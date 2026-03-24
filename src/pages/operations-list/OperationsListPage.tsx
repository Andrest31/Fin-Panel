import { Alert, Box, Chip, Snackbar, Stack, TablePagination, Typography } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  bulkUpdateOperationStatus,
  getOperations,
  type Operation,
  type OperationStatus,
} from '@/entities/operation/api/getOperations';
import { DecisionDialog } from '@/features/operation-actions/ui/DecisionDialog';
import { getOperationsFiltersFromSearchParams, toOperationsSearchParams } from '@/features/operation-filters/lib/searchParams';
import { defaultOperationsFilters, type OperationsFilterValues } from '@/features/operation-filters/model/types';
import { OperationsFilters } from '@/features/operation-filters/ui/OperationsFilters';
import { BulkActionsBar } from '@/widgets/operations-table/BulkActionsBar';
import { OperationsTable } from '@/widgets/operations-table/OperationsTable';
import { OperationsTableSkeleton } from '@/widgets/operations-table/OperationsTableSkeleton';

function applyFiltersAndSort(data: Operation[], filters: OperationsFilterValues): Operation[] {
  const normalizedSearch = filters.search.trim().toLowerCase();

  const minAmount = filters.minAmount ? Number(filters.minAmount) : null;
  const maxAmount = filters.maxAmount ? Number(filters.maxAmount) : null;

  const dateFromTimestamp = filters.dateFrom
    ? new Date(`${filters.dateFrom}T00:00:00`).getTime()
    : null;

  const dateToTimestamp = filters.dateTo
    ? new Date(`${filters.dateTo}T23:59:59.999`).getTime()
    : null;

  const filtered = data.filter((operation) => {
    const createdAtTimestamp = new Date(operation.createdAt).getTime();

    const matchesSearch =
      normalizedSearch.length === 0 || operation.merchant.toLowerCase().includes(normalizedSearch);

    const matchesStatus = filters.status === 'all' || operation.status === filters.status;

    const matchesRiskLevel =
      filters.riskLevel === 'all' || operation.riskLevel === filters.riskLevel;

    const matchesPaymentMethod =
      filters.paymentMethod === 'all' || operation.paymentMethod === filters.paymentMethod;

    const matchesCountry =
      filters.country === 'all' || operation.country === filters.country;

    const matchesMinAmount =
      minAmount === null || Number.isNaN(minAmount) || operation.amount >= minAmount;

    const matchesMaxAmount =
      maxAmount === null || Number.isNaN(maxAmount) || operation.amount <= maxAmount;

    const matchesDateFrom =
      dateFromTimestamp === null || createdAtTimestamp >= dateFromTimestamp;

    const matchesDateTo =
      dateToTimestamp === null || createdAtTimestamp <= dateToTimestamp;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesRiskLevel &&
      matchesPaymentMethod &&
      matchesCountry &&
      matchesMinAmount &&
      matchesMaxAmount &&
      matchesDateFrom &&
      matchesDateTo
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    let comparison = 0;

    if (filters.sortBy === 'amount') {
      comparison = a.amount - b.amount;
    } else if (filters.sortBy === 'merchant') {
      comparison = a.merchant.localeCompare(b.merchant);
    } else {
      comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }

    return filters.order === 'asc' ? comparison : -comparison;
  });

  return sorted;
}

export function OperationsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [pendingBulkStatus, setPendingBulkStatus] = useState<OperationStatus | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const queryClient = useQueryClient();
  const pollingInterval = import.meta.env.MODE === 'test' ? false : 10000;

  const filters = useMemo(
    () => getOperationsFiltersFromSearchParams(searchParams),
    [searchParams],
  );

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['operations'],
    queryFn: getOperations,
    refetchInterval: pollingInterval,
  });

  const filteredOperations = useMemo(() => {
    return applyFiltersAndSort(data ?? [], filters);
  }, [data, filters]);

  const paginatedOperations = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredOperations.slice(start, end);
  }, [filteredOperations, page, rowsPerPage]);

  const bulkMutation = useMutation({
    mutationFn: ({
      ids,
      status,
      reason,
      comment,
    }: {
      ids: string[];
      status: OperationStatus;
      reason: string;
      comment: string;
    }) => bulkUpdateOperationStatus(ids, { status, reason, comment }),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['operations'] });
      await Promise.all(
        result.updatedIds.map((id) =>
          queryClient.invalidateQueries({ queryKey: ['operation', id] }),
        ),
      );

      setSelectedIds([]);
      setPendingBulkStatus(null);
      setSuccessMessage(`Обновлено операций: ${result.updatedIds.length}`);
      setErrorMessage('');
    },
    onError: (mutationError) => {
      setErrorMessage(
        mutationError instanceof Error ? mutationError.message : 'Не удалось обновить операции',
      );
      setSuccessMessage('');
    },
  });

  const handleFiltersChange = (nextFilters: OperationsFilterValues) => {
    setSearchParams(toOperationsSearchParams(nextFilters));
    setSelectedIds([]);
    setPage(0);
  };

  const handleReset = () => {
    setSearchParams(toOperationsSearchParams(defaultOperationsFilters));
    setSelectedIds([]);
    setPage(0);
  };

  const handleToggleOne = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const handleToggleAll = (idsOnPage: string[]) => {
    const allSelected = idsOnPage.every((id) => selectedIds.includes(id));

    setSelectedIds((current) => {
      if (allSelected) {
        return current.filter((id) => !idsOnPage.includes(id));
      }

      const next = new Set([...current, ...idsOnPage]);
      return Array.from(next);
    });
  };

  const handleChangePage = (_event: unknown, nextPage: number) => {
    setPage(nextPage);
    setSelectedIds([]);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number(event.target.value));
    setPage(0);
    setSelectedIds([]);
  };

  const visibleSelectedIds = selectedIds.filter((id) =>
    paginatedOperations.some((operation) => operation.id === id),
  );

  const selectedOperationsLabel =
    visibleSelectedIds.length === 1
      ? paginatedOperations.find((item) => item.id === visibleSelectedIds[0])?.merchant ?? 'operation'
      : `${visibleSelectedIds.length} operations`;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 1 }}>
        Operations Queue
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Очередь операций для анализа: поиск, фильтрация, сортировка и регулярное обновление данных.
      </Typography>

      <OperationsFilters value={filters} onChange={handleFiltersChange} onReset={handleReset} />

      {visibleSelectedIds.length > 0 && (
        <BulkActionsBar
          selectedCount={visibleSelectedIds.length}
          isPending={bulkMutation.isPending}
          onApply={setPendingBulkStatus}
          onReset={() => setSelectedIds([])}
        />
      )}

      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
        <Chip label={`Found: ${filteredOperations.length}`} />
        <Chip label={`Page: ${page + 1}`} />
        <Chip label={`Selected: ${visibleSelectedIds.length}`} />
        <Chip label={`Sort: ${filters.sortBy}`} />
        <Chip label={`Order: ${filters.order}`} />
        {isFetching && !isLoading ? <Chip label="Refreshing..." color="warning" /> : null}
      </Stack>

      {isLoading && <OperationsTableSkeleton rows={rowsPerPage} />}

      {isError && (
        <Alert severity="error">
          {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
      )}

      {!isLoading && !isError && filteredOperations.length === 0 && (
        <Alert severity="info">No operations found for current filters.</Alert>
      )}

      {!isLoading && !isError && filteredOperations.length > 0 && (
        <>
          <OperationsTable
            operations={paginatedOperations}
            selectedIds={visibleSelectedIds}
            onToggleOne={handleToggleOne}
            onToggleAll={handleToggleAll}
          />

          <TablePagination
            component="div"
            count={filteredOperations.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </>
      )}

      <DecisionDialog
        open={Boolean(pendingBulkStatus) && visibleSelectedIds.length > 0}
        targetLabel={selectedOperationsLabel}
        status={pendingBulkStatus}
        isPending={bulkMutation.isPending}
        onClose={() => {
          if (!bulkMutation.isPending) {
            setPendingBulkStatus(null);
          }
        }}
        onSubmit={({ reason, comment }) => {
          if (!pendingBulkStatus || visibleSelectedIds.length === 0) return;

          bulkMutation.mutate({
            ids: visibleSelectedIds,
            status: pendingBulkStatus,
            reason,
            comment,
          });
        }}
      />

      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage('')}
        message={successMessage}
      />

      <Snackbar
        open={Boolean(errorMessage)}
        autoHideDuration={4000}
        onClose={() => setErrorMessage('')}
        message={errorMessage}
      />
    </Box>
  );
}