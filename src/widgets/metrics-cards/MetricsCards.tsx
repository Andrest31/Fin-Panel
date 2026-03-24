import { Grid2, Paper, Typography } from '@mui/material';

const metrics = [
  { label: 'Operations in queue', value: '124' },
  { label: 'High risk share', value: '18%' },
  { label: 'Avg review time', value: '4m 12s' },
  { label: 'Blocked today', value: '27' },
];

export function MetricsCards() {
  return (
    <Grid2 container spacing={2}>
      {metrics.map((metric) => (
        <Grid2 key={metric.label} size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="body2" color="text.secondary">
              {metric.label}
            </Typography>
            <Typography variant="h5" sx={{ mt: 1, fontWeight: 700 }}>
              {metric.value}
            </Typography>
          </Paper>
        </Grid2>
      ))}
    </Grid2>
  );
}
