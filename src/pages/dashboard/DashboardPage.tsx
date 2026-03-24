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
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getOperations, type Operation } from '@/entities/operation/api/getOperations';
import { RiskLevelChip } from '@/entities/operation/ui/RiskLevelChip';
import { StatusChip } from '@/entities/operation/ui/StatusChip';
import { MetricsCards } from '@/widgets/metrics-cards/MetricsCards';

type ChartItem = {
  name: string;
  value: number;
};

type FlagReasonStat = {
  reason: string;
  count: number;
};

const STATUS_COLORS: Record<Operation['status'], string> = {
  new: '#90a4ae',
  in_review: '#ffb300',
  approved: '#43a047',
  blocked: '#e53935',
  flagged: '#8e24aa',
};

const RISK_COLORS: Record<Operation['riskLevel'], string> = {
  low: '#43a047',
  medium: '#ffb300',
  high: '#e53935',
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

function getStatusBreakdown(operations: Operation[]): ChartItem[] {
  const counts = new Map<Operation['status'], number>();

  operations.forEach((operation) => {
    counts.set(operation.status, (counts.get(operation.status) ?? 0) + 1);
  });

  return Array.from(counts.entries()).map(([name, value]) => ({
    name,
    value,
  }));
}

function getRiskBreakdown(operations: Operation[]): ChartItem[] {
  const counts = new Map<Operation['riskLevel'], number>();

  operations.forEach((operation) => {
    counts.set(operation.riskLevel, (counts.get(operation.riskLevel) ?? 0) + 1);
  });

  return Array.from(counts.entries()).map(([name, value]) => ({
    name,
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
    queryKey: ['operations-dashboard'],
    queryFn: () =>
      getOperations({
        page: 1,
        pageSize: 100,
        sortBy: 'createdAt',
        order: 'desc',
      }),
    refetchInterval: 10000,
  });

  const operations = data?.items ?? [];
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
            <Grid size={{ xs: 12, xl: 6 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Status distribution
                  </Typography>

                  <Box sx={{ width: '100%', height: 320 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={statusBreakdown}
                          dataKey="value"
                          nameKey="name"
                          outerRadius={100}
                          label
                        >
                          {statusBreakdown.map((entry) => (
                            <Cell
                              key={entry.name}
                              fill={STATUS_COLORS[entry.name as Operation['status']]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, xl: 6 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Risk distribution
                  </Typography>

                  <Box sx={{ width: '100%', height: 320 }}>
                    <ResponsiveContainer>
                      <BarChart data={riskBreakdown}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name="Operations">
                          {riskBreakdown.map((entry) => (
                            <Cell
                              key={entry.name}
                              fill={RISK_COLORS[entry.name as Operation['riskLevel']]}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, lg: 7 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Latest operations
                  </Typography>

                  <List>
                    {latestOperations.map((operation, index) => (
                      <Box key={operation.id}>
                        <ListItem
                          component={RouterLink}
                          to={`/operations/${operation.id}`}
                          sx={{
                            color: 'inherit',
                            textDecoration: 'none',
                            alignItems: 'flex-start',
                          }}
                        >
                          <ListItemText
                            primary={
                              <Stack
                                direction={{ xs: 'column', md: 'row' }}
                                spacing={1}
                                alignItems={{ xs: 'flex-start', md: 'center' }}
                              >
                                <Typography variant="subtitle1">{operation.merchant}</Typography>
                                <StatusChip status={operation.status} />
                                <RiskLevelChip riskLevel={operation.riskLevel} />
                              </Stack>
                            }
                            secondary={
                              <>
                                <Typography variant="body2" color="text.secondary">
                                  {operation.amount} {operation.currency} • {operation.country} / {operation.city}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Updated: {new Date(operation.updatedAt).toLocaleString()}
                                </Typography>
                              </>
                            }
                          />
                        </ListItem>

                        {index < latestOperations.length - 1 ? <Divider /> : null}
                      </Box>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, lg: 5 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Top flag reasons
                  </Typography>

                  <List>
                    {topFlagReasons.map((item, index) => (
                      <Box key={item.reason}>
                        <ListItem disableGutters>
                          <ListItemText
                            primary={item.reason}
                            secondary={`Count: ${item.count}`}
                          />
                        </ListItem>

                        {index < topFlagReasons.length - 1 ? <Divider /> : null}
                      </Box>
                    ))}

                    {topFlagReasons.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No flag reasons available
                      </Typography>
                    ) : null}
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