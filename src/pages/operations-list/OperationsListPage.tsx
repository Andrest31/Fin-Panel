import { Alert, Paper, Stack, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getOperations } from '@/entities/operation/api/getOperations';
import { OperationsTable } from '@/widgets/operations-table/OperationsTable';

export function OperationsListPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['operations'],
    queryFn: getOperations,
    refetchInterval: 10_000,
  });

  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">Operations Queue</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Базовый экран очереди операций. Дальше сюда добавим фильтры, сортировку и bulk-actions.
        </Typography>
      </div>

      {isLoading && <Alert severity="info">Загружаем операции...</Alert>}
      {isError && <Alert severity="error">{(error as Error).message}</Alert>}

      {data && (
        <Paper sx={{ p: 2, display: 'grid', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Total: {data.total} · Refreshed at: {new Date(data.refreshedAt).toLocaleTimeString('ru-RU')}
          </Typography>
          <OperationsTable items={data.items} />
        </Paper>
      )}
    </Stack>
  );
}
