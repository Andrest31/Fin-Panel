import { Stack, Typography } from '@mui/material';
import { MetricsCards } from '@/widgets/metrics-cards/MetricsCards';

export function DashboardPage() {
  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">Fraud Monitoring Dashboard</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Срез по очереди операций, риску и скорости обработки.
        </Typography>
      </div>
      <MetricsCards />
    </Stack>
  );
}
