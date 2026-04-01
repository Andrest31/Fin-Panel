import { Alert, Box, CircularProgress } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useQuery } from '@tanstack/react-query';
import { getOperations } from '@/entities/operation/api/getOperations';
import { MetricsCards } from '@/widgets/metrics-cards/MetricsCards';
import { DashboardHeader } from './components/DashboardHeader';
import { LatestOperationsCard } from './components/LatestOperationsCard';
import { RiskDistributionCard } from './components/RiskDistributionCard';
import { StatusDistributionCard } from './components/StatusDistributionCard';
import { TopFlagReasonsCard } from './components/TopFlagReasonsCard';
import {
  getDashboardMetrics,
  getLatestOperations,
  getMetricCards,
  getRiskBreakdown,
  getStatusBreakdown,
  getTopFlagReasons,
} from './lib/metrics';

export function DashboardPage() {
  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['operations-dashboard'],
    queryFn: () =>
      getOperations({
        page: 1,
        pageSize: 250,
        sortBy: 'createdAt',
        order: 'desc',
      }),
    refetchInterval: 10000,
  });

  const operations = data?.items ?? [];
  const metrics = getDashboardMetrics(operations);
  const metricCards = getMetricCards(metrics);
  const statusBreakdown = getStatusBreakdown(operations);
  const riskBreakdown = getRiskBreakdown(operations);
  const topFlagReasons = getTopFlagReasons(operations);
  const latestOperations = getLatestOperations(operations);

  return (
    <Box sx={{ p: 3 }}>
      <DashboardHeader isRefreshing={isFetching && !isLoading} />

      {isLoading ? <CircularProgress /> : null}

      {isError ? (
        <Alert severity="error">
          {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
      ) : null}

      {!isLoading && !isError ? (
        <>
          <MetricsCards metrics={metricCards} />

          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, xl: 6 }}>
              <StatusDistributionCard data={statusBreakdown} />
            </Grid>

            <Grid size={{ xs: 12, xl: 6 }}>
              <RiskDistributionCard data={riskBreakdown} />
            </Grid>

            <Grid size={{ xs: 12, lg: 7 }}>
              <LatestOperationsCard operations={latestOperations} />
            </Grid>

            <Grid size={{ xs: 12, lg: 5 }}>
              <TopFlagReasonsCard items={topFlagReasons} />
            </Grid>
          </Grid>
        </>
      ) : null}
    </Box>
  );
}
