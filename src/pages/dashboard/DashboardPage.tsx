import { Box, Typography } from '@mui/material';
import { MetricsCards } from '../../widgets/metrics-cards/MetricsCards';

const mockMetrics = [
  { label: 'Total operations', value: 1248 },
  { label: 'Flagged (high risk)', value: 87 },
  { label: 'Approved today', value: 342 },
];

export function DashboardPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Dashboard
      </Typography>

      <MetricsCards metrics={mockMetrics} />
    </Box>
  );
}