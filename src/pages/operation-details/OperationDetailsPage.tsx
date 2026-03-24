import { Alert, Paper, Stack, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';

export function OperationDetailsPage() {
  const { operationId } = useParams();

  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">Operation Details</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Здесь будет деталка операции, история изменений и действия аналитика.
        </Typography>
      </div>
      <Paper sx={{ p: 3 }}>
        <Alert severity="info">MVP placeholder for {operationId}</Alert>
      </Paper>
    </Stack>
  );
}
