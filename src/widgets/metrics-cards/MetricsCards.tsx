import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

type MetricCard = {
  label: string;
  value: string | number;
};

type MetricsCardsProps = {
  metrics: MetricCard[];
};

export function MetricsCards({ metrics }: MetricsCardsProps) {
  return (
    <Grid container spacing={2}>
      {metrics.map((metric) => (
        <Grid key={metric.label} size={{ xs: 12, md: 4, lg: 2 }}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="body2" color="text.secondary">
              {metric.label}
            </Typography>
            <Typography variant="h5" sx={{ mt: 1 }}>
              {metric.value}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}