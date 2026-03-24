import { Alert, Box, CircularProgress, List, ListItem, ListItemText, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getOperations } from '@/entities/operation/api/getOperations';

export function OperationsListPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['operations'],
    queryFn: getOperations,
    refetchInterval: 10000,
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 1 }}>
        Operations Queue
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Базовый экран очереди операций. Дальше сюда добавим фильтры, сортировку и bulk-actions.
      </Typography>

      {isLoading && <CircularProgress />}

      {isError && (
        <Alert severity="error">
          {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
      )}

      {data && (
        <List>
          {data.map((operation) => (
            <ListItem key={operation.id} divider>
              <ListItemText
                primary={operation.merchant}
                secondary={`${operation.amount} ${operation.currency} • ${operation.status} • risk: ${operation.riskLevel}`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}