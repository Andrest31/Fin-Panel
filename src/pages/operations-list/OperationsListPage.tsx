import {
  Alert,
  Box,
  Button,
  Chip,
  Snackbar,
  Stack,
  TablePagination,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ChangeEvent } from 'react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  bulkUpdateOperationStatus,
  getOperations,
  type GetOperationsParams,
  type GetOperationsResponse,
  type OperationDetails,
  type OperationStatus,
} from '@/entities/operation/api/getOperations';
import {
  applyOptimisticDecisionToOperationDetails,
  applyOptimisticDecisionToOperationsResponse,
} from '@/entities/operation/lib/optimisticUpdates';
import { DecisionDialog } from '@/features/operation-actions/ui/DecisionDialog';
import { getOperationsFiltersFromSearchParams, toOperationsSearchParams } from '@/features/operation-filters/lib/searchParams';
import { defaultOperationsFilters, type OperationsFilterValues } from '@/features/operation-filters/model/types';
import { OperationsFilters } from '@/features/operation-filters/ui/OperationsFilters';
import { BulkActionsBar } from '@/widgets/operations-table/BulkActionsBar';
import { OperationsTable } from '@/widgets/operations-table/OperationsTable';
import { OperationsTableSkeleton } from '@/widgets/operations-table/OperationsTableSkeleton';

type DecisionPayload = {
  status: OperationStatus;
  reason: string;
  comment: string;
};

type MutationContext = {
  previousOperationsLists: Array<[readonly unknown[], GetOperationsResponse | undefined]>;
  previousOperationDetails: Array<[string, OperationDetails | undefined]>;
};

function mapFiltersToQueryParams(filters: OperationsFilterValues): GetOperationsParams {
  const minAmount = filters.minAmount.trim() ? Number(filters.minAmount) : undefined;
  const maxAmount = filters.maxAmount.trim() ? Number(filters.maxAmount) : undefined;

  return {
    page: filters.page,
    pageSize: filters.pageSize,
    search: filters.search.trim() || undefined,
    status: filters.status === 'all' ? undefined : filters.status,
    riskLevel: filters.riskLevel === 'all' ? undefined : filters.riskLevel,
    sortBy: filters.sortBy,
    order: filters.order,
    minAmount: minAmount !== undefined && !Number.isNaN(minAmount) ? minAmount : undefined,
    maxAmount: maxAmount !== undefined && !Number.isNaN(maxAmount) ? maxAmount : undefined,
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
    paymentMethod: filters.paymentMethod === 'all' ? undefined : filters.paymentMethod,
    country: filters.country === 'all' ? undefined : filters.country,
  };
}

function formatRefreshedAt(value?: string) {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}

export function OperationsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [pendingBulkStatus, setPendingBulkStatus] = useState<OperationStatus | null>(null);

  const queryClient = useQueryClient();
  const pollingInterval = import.meta.env.MODE === 'test' ? false : 10000;

  const filters = useMemo(
    () => getOperationsFiltersFromSearchParams(searchParams),
    [searchParams],
  );

  const queryParams = useMemo(() => mapFiltersToQueryParams(filters), [filters]);

  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: ['operations', queryParams],
    queryFn: () => getOperations(queryParams),
    refetchInterval: pollingInterval,
    placeholderData: (previousData) => previousData,
  });

  const operations = data?.items ?? [];
  const totalOperations = data?.total ?? 0;

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

    onMutate: async ({
      ids,
      status,
      reason,
      comment,
    }): Promise<MutationContext> => {
      const payload: DecisionPayload = { status, reason, comment };

      await queryClient.cancelQueries({ queryKey: ['operations'] });

      const previousOperationsLists = queryClient.getQueriesData<GetOperationsResponse>({
        queryKey: ['operations'],
      });

      const previousOperationDetails: Array<[string, OperationDetails | undefined]> = ids.map((id) => [
        id,
        queryClient.getQueryData<OperationDetails>(['operation', id]),
      ]);

      previousOperationsLists.forEach(([queryKey, response]) => {
        if (!response) return;

        queryClient.setQueryData<GetOperationsResponse>(
          queryKey,
          applyOptimisticDecisionToOperationsResponse(response, ids, payload),
        );
      });

      previousOperationDetails.forEach(([operationId, operationDetails]) => {
        if (!operationDetails) return;

        queryClient.setQueryData<OperationDetails>(
          ['operation', operationId],
          applyOptimisticDecisionToOperationDetails(operationDetails, payload),
        );
      });

      setErrorMessage('');

      return {
        previousOperationsLists,
        previousOperationDetails,
      };
    },

    onSuccess: (result) => {
      setSelectedIds([]);
      setPendingBulkStatus(null);
      setSuccessMessage(`Обновлено операций: ${result.updatedIds.length}`);
      setErrorMessage('');
    },

    onError: (mutationError, _variables, context) => {
      context?.previousOperationsLists.forEach(([queryKey, response]) => {
        queryClient.setQueryData(queryKey, response);
      });

      context?.previousOperationDetails.forEach(([operationId, operationDetails]) => {
        if (operationDetails) {
          queryClient.setQueryData(['operation', operationId], operationDetails);
        }
      });

      setErrorMessage(
        mutationError instanceof Error ? mutationError.message : 'Не удалось обновить операции',
      );
      setSuccessMessage('');
    },

    onSettled: async (_data, _error, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['operations'] });
      await Promise.all(
        variables.ids.map((id) =>
          queryClient.invalidateQueries({ queryKey: ['operation', id] }),
        ),
      );
    },
  });

  const handleFiltersChange = (nextFilters: OperationsFilterValues) => {
    setSearchParams(toOperationsSearchParams(nextFilters));
    setSelectedIds([]);
  };

  const handleReset = () => {
    setSearchParams(toOperationsSearchParams(defaultOperationsFilters));
    setSelectedIds([]);
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
    handleFiltersChange({
      ...filters,
      page: nextPage + 1,
    });
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    handleFiltersChange({
      ...filters,
      page: 1,
      pageSize: Number(event.target.value),
    });
  };

  const visibleSelectedIds = selectedIds.filter((id) =>
    operations.some((operation) => operation.id === id),
  );

  const selectedOperationsLabel =
    visibleSelectedIds.length === 1
      ? operations.find((item) => item.id === visibleSelectedIds[0])?.merchant ?? 'operation'
      : `${visibleSelectedIds.length} operations`;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 1 }}>
        Operations Queue
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Очередь операций для анализа: серверная фильтрация, сортировка, пагинация и регулярное обновление данных.
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
        <Chip label={`Found: ${totalOperations}`} />
        <Chip label={`Page: ${filters.page}`} />
        <Chip label={`Rows: ${filters.pageSize}`} />
        <Chip label={`Selected: ${visibleSelectedIds.length}`} />
        <Chip label={`Sort: ${filters.sortBy}`} />
        <Chip label={`Order: ${filters.order}`} />
        <Chip label={`Refreshed: ${formatRefreshedAt(data?.refreshedAt)}`} />
        {isFetching && !isLoading ? <Chip label="Refreshing..." color="warning" /> : null}
      </Stack>

      {isLoading && <OperationsTableSkeleton rows={filters.pageSize} />}

      {isError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => void refetch()}>
              Retry
            </Button>
          }
        >
          {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
      )}

      {!isLoading && !isError && totalOperations === 0 && (
        <Alert severity="info">No operations found for current filters.</Alert>
      )}

      {!isLoading && !isError && totalOperations > 0 && (
        <>
          <OperationsTable
            operations={operations}
            selectedIds={visibleSelectedIds}
            onToggleOne={handleToggleOne}
            onToggleAll={handleToggleAll}
          />

          <TablePagination
            component="div"
            count={totalOperations}
            page={filters.page - 1}
            onPageChange={handleChangePage}
            rowsPerPage={filters.pageSize}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
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