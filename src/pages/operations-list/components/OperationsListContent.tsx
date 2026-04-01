import { Alert, Button, Paper, TablePagination, alpha } from '@mui/material';
import type { ChangeEvent } from 'react';
import type { Operation } from '@/entities/operation/api/getOperations';
import { OperationsTable } from '@/widgets/operations-table/OperationsTable';
import { OperationsTableSkeleton } from '@/widgets/operations-table/OperationsTableSkeleton';

type Props = {
  operations: Operation[];
  totalOperations: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  highlightedIds: string[];
  selectedIds: string[];
  onRetry: () => void;
  onToggleOne: (id: string) => void;
  onToggleAll: (idsOnPage: string[]) => void;
  onPageChange: (_event: unknown, nextPage: number) => void;
  onRowsPerPageChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function OperationsListContent({
  operations,
  totalOperations,
  page,
  pageSize,
  isLoading,
  isError,
  error,
  highlightedIds,
  selectedIds,
  onRetry,
  onToggleOne,
  onToggleAll,
  onPageChange,
  onRowsPerPageChange,
}: Props) {
  if (isLoading) {
    return <OperationsTableSkeleton rows={pageSize} />;
  }

  if (isError) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={onRetry}>
            Retry
          </Button>
        }
      >
        {error instanceof Error ? error.message : 'Unknown error'}
      </Alert>
    );
  }

  if (totalOperations === 0) {
    return <Alert severity="info">No operations found for current filters.</Alert>;
  }

  return (
    <Paper
      sx={{
        p: 1,
        borderRadius: 6,
        bgcolor: alpha('#ffffff', 0.50),
      }}
    >
      <OperationsTable
        operations={operations}
        selectedIds={selectedIds}
        onToggleOne={onToggleOne}
        onToggleAll={onToggleAll}
        highlightedIds={highlightedIds}
      />

      <TablePagination
        component="div"
        count={totalOperations}
        page={page - 1}
        onPageChange={onPageChange}
        rowsPerPage={pageSize}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
      />
    </Paper>
  );
}