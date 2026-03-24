import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { useQuery } from '@tanstack/react-query';
import { Link as RouterLink } from 'react-router-dom';
import { getOperations, type Operation } from '@/entities/operation/api/getOperations';
import { RiskLevelChip } from '@/entities/operation/ui/RiskLevelChip';
import { StatusChip } from '@/entities/operation/ui/StatusChip';
import { MetricsCards } from '@/widgets/metrics-cards/MetricsCards';

type StatusCount = {
  label: string;
  value: number;
};

type FlagReasonStat = {
  reason: string;
  count: number;
};

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function getDashboardMetrics(operations: Operation[]) {
  const totalCount = operations.length;
  const highRiskCount = operations.filter((operation) => operation.riskLevel === 'high').length;
  const inReviewCount = operations.filter((operation) => operation.status === 'in_review').length;
  const blockedCount = operations.filter((operation) => operation.status === 'blocked').length;
  const approvedCount = operations.filter((operation) => operation.status === 'approved').length;

  const approvedRate = totalCount > 0 ? (approvedCount / totalCount) * 100 : 0;

  return {
    totalCount,
    highRiskCount,
    inReviewCount,
    blockedCount,
    approvedCount,
    approvedRate,
  };
}

function getStatusBreakdown(operations: Operation[]): StatusCount[] {
  const counts = new Map<string, number>();

  operations.forEach((operation) => {
    counts.set(operation.status, (counts.get(operation.status) ?? 0) + 1);
  });

  return Array.from(counts.entries()).map(([label, value]) => ({
    label,
    value,
  }));
}

function getRiskBreakdown(operations: Operation[]): StatusCount[] {
  const counts = new Map<string, number>();

  operations.forEach((operation) => {
    counts.set(operation.riskLevel, (counts.get(operation.riskLevel) ?? 0) + 1);
  });

  return Array.from(counts.entries()).map(([label, value]) => ({
    label,
    value,
  }));
}

function getTopFlagReasons(operations: Operation[]): FlagReasonStat[] {
  const counts = new Map<string, number>();

  operations.forEach((operation) => {
    operation.flagReasons.forEach((reason) => {
      counts.set(reason, (counts.get(reason) ?? 0) + 1);
    });
  });

  return Array.from(counts.entries())
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function getLatestOperations(operations: Operation[]): Operation[] {
  return [...operations]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 5);
}

export function DashboardPage() {
  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['operations'],
    queryFn: getOperations,
    refetchInterval: 10000,
  });

  const operations = data ?? [];
  const metrics = getDashboardMetrics(operations);
  const statusBreakdown = getStatusBreakdown(operations);
  const riskBreakdown = getRiskBreakdown(operations);
  const topFlagReasons = getTopFlagReasons(operations);
  const latestOperations = getLatestOperations(operations);

  const metricCards = [
    { label: 'Total operations', value: metrics.totalCount },
    { label: 'High risk', value: metrics.highRiskCount },
    { label: 'In review', value: metrics.inReviewCount },
    { label: 'Blocked', value: metrics.blockedCount },
    { label: 'Approved', value: metrics.approvedCount },
    { label: 'Approved rate', value: formatPercent(metrics.approvedRate) },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Fraud Monitoring Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Сводка по потоку операций, рискам и последним изменениям.
          </Typography>
        </Box>

        {isFetching && !isLoading ? <Chip label="Refreshing..." color="warning" /> : null}
      </Stack>

      {isLoading && <CircularProgress />}

      {isError && (
        <Alert severity="error">
          {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
      )}

      {!isLoading && !isError && (
        <>
          <MetricsCards metrics={metricCards} />

          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, lg: 4 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Status breakdown
                  </Typography>

                  <Stack spacing={1.5}>
                    {statusBreakdown.map((item) => (
                      <Stack
                        key={item.label}
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <StatusChip status={item.label as Operation['status']} />
                        <Typography variant="body1">{item.value}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, lg: 4 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Risk breakdown
                  </Typography>

                  <Stack spacing={1.5}>
                    {riskBreakdown.map((item) => (
                      <Stack
                        key={item.label}
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <RiskLevelChip riskLevel={item.label as Operation['riskLevel']} />
                        <Typography variant="body1">{item.value}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, lg: 4 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Top flag reasons
                  </Typography>

                  {topFlagReasons.length > 0 ? (
                    <Stack spacing={1.5}>
                      {topFlagReasons.map((item) => (
                        <Stack
                          key={item.reason}
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography variant="body2">{item.reason}</Typography>
                          <Chip label={item.count} size="small" />
                        </Stack>
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No flag reasons yet
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Latest updated operations
                  </Typography>

                  <List>
                    {latestOperations.map((operation, index) => (
                      <Box key={operation.id}>
                        <ListItem
                          disableGutters
                          component={RouterLink}
                          to={`/operations/${operation.id}`}
                          sx={{
                            color: 'inherit',
                            textDecoration: 'none',
                            display: 'block',
                          }}
                        >
                          <Stack
                            direction={{ xs: 'column', md: 'row' }}
                            spacing={2}
                            justifyContent="space-between"
                            alignItems={{ xs: 'flex-start', md: 'center' }}
                          >
                            <ListItemText
                              primary={operation.merchant}
                              secondary={`${operation.id} • ${new Date(operation.updatedAt).toLocaleString()}`}
                            />

                            <Stack direction="row" spacing={1}>
                              <StatusChip status={operation.status} />
                              <RiskLevelChip riskLevel={operation.riskLevel} />
                              <Chip
                                label={new Intl.NumberFormat('ru-RU', {
                                  style: 'currency',
                                  currency: operation.currency,
                                  maximumFractionDigits: 0,
                                }).format(operation.amount)}
                                size="small"
                                variant="outlined"
                              />
                            </Stack>
                          </Stack>
                        </ListItem>

                        {index < latestOperations.length - 1 ? <Divider /> : null}
                      </Box>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}