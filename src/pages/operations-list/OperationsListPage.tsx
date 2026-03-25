import { Box, Snackbar, Typography } from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ChangeEvent } from "react";
import { useMemo, useState } from "react";
import { DecisionDialog } from "@/features/operation-actions/ui/DecisionDialog";
import { BulkActionsBar } from "@/widgets/operations-table/BulkActionsBar";
import { getOperations } from "@/entities/operation/api/getOperations";
import { useBulkOperationsDecision } from "./hooks/useBulkOperationsDecision";
import { useOperationsFilters } from "./hooks/useOperationsFilters";
import { useOperationsRealtime } from "./hooks/useOperationsRealtime";
import { mapFiltersToQueryParams } from "./lib/queryParams";
import { OperationsListContent } from "./components/OperationsListContent";
import { OperationsListToolbar } from "./components/OperationsListToolbar";

export function OperationsListPage() {
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [pendingBulkStatus, setPendingBulkStatus] = useState<
    null | "new" | "in_review" | "approved" | "blocked" | "flagged"
  >(null);

  const { filters, updateFilters, resetFilters } = useOperationsFilters();
  const queryParams = useMemo(
    () => mapFiltersToQueryParams(filters),
    [filters],
  );

  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: ["operations", queryParams],
    queryFn: () => getOperations(queryParams),
    refetchInterval: import.meta.env.MODE === "test" ? false : 8000,
    refetchIntervalInBackground: true,
    placeholderData: (previousData) => previousData,
  });

  const operations = data?.items ?? [];
  const totalOperations = data?.total ?? 0;

  const {
    highlightedIds,
    setHighlightedIds,
    realtimeMessage,
    setRealtimeMessage,
  } = useOperationsRealtime(data, filters);

  const visibleSelectedIds = selectedIds.filter((id) =>
    operations.some((operation) => operation.id === id),
  );

  const bulkMutation = useBulkOperationsDecision({
    onSuccess: (updatedCount) => {
      setSelectedIds([]);
      setPendingBulkStatus(null);
      setSuccessMessage(`Обновлено операций: ${updatedCount}`);
      setErrorMessage("");
    },
    onError: (message) => {
      setErrorMessage(message);
      setSuccessMessage("");
      setPendingBulkStatus(null);
    },
    onConflict: () => {
      setSelectedIds([]);
    },
    onSettled: async (ids) => {
      await queryClient.invalidateQueries({ queryKey: ["operations"] });
      await Promise.all(
        ids.map((id) =>
          queryClient.invalidateQueries({ queryKey: ["operation", id] }),
        ),
      );
    },
  });

  const handleFiltersChange = (nextFilters: typeof filters) => {
    updateFilters(nextFilters);
    setSelectedIds([]);
    setHighlightedIds([]);
  };

  const handleResetFilters = () => {
    resetFilters();
    setSelectedIds([]);
    setHighlightedIds([]);
  };

  const handleToggleOne = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const handleToggleAll = (idsOnPage: string[]) => {
    const allSelected = idsOnPage.every((id) => selectedIds.includes(id));

    setSelectedIds((current) => {
      if (allSelected) {
        return current.filter((id) => !idsOnPage.includes(id));
      }

      return Array.from(new Set([...current, ...idsOnPage]));
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

  const selectedOperationsLabel =
    visibleSelectedIds.length === 1
      ? (operations.find((item) => item.id === visibleSelectedIds[0])
          ?.merchant ?? "operation")
      : `${visibleSelectedIds.length} operations`;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 1 }}>
        Operations Queue
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Очередь подозрительных операций с live-обновлениями, bulk-обработкой и
        оптимизацией под большие объёмы данных.
      </Typography>

      <OperationsListToolbar
        filters={filters}
        data={data}
        totalOperations={totalOperations}
        visibleSelectedCount={visibleSelectedIds.length}
        isFetching={isFetching}
        isLoading={isLoading}
        realtimeMessage={realtimeMessage}
        onHideRealtimeMessage={() => setRealtimeMessage("")}
        onFiltersChange={handleFiltersChange}
        onResetFilters={handleResetFilters}
      />

      {visibleSelectedIds.length > 0 ? (
        <BulkActionsBar
          selectedCount={visibleSelectedIds.length}
          isPending={bulkMutation.isPending}
          onApply={setPendingBulkStatus}
          onReset={() => setSelectedIds([])}
        />
      ) : null}

      <OperationsListContent
        operations={operations}
        totalOperations={totalOperations}
        page={filters.page}
        pageSize={filters.pageSize}
        isLoading={isLoading}
        isError={isError}
        error={error}
        highlightedIds={highlightedIds}
        selectedIds={visibleSelectedIds}
        onRetry={() => void refetch()}
        onToggleOne={handleToggleOne}
        onToggleAll={handleToggleAll}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

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
        onClose={() => setSuccessMessage("")}
        message={successMessage}
      />

      <Snackbar
        open={Boolean(errorMessage)}
        autoHideDuration={4000}
        onClose={() => setErrorMessage("")}
        message={errorMessage}
      />
    </Box>
  );
}
