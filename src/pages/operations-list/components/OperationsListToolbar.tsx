import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Stack,
  Typography,
  alpha,
} from '@mui/material';
import type { GetOperationsResponse } from '@/entities/operation/api/getOperations';
import type { OperationsFilterValues } from '@/features/operation-filters/model/types';
import { OperationsFilters } from '@/features/operation-filters/ui/OperationsFilters';
import { formatRefreshedAt } from '../lib/queryParams';

type Props = {
  filters: OperationsFilterValues;
  data: GetOperationsResponse | undefined;
  totalOperations: number;
  visibleSelectedCount: number;
  isFetching: boolean;
  isLoading: boolean;
  realtimeMessage: string;
  onHideRealtimeMessage: () => void;
  onFiltersChange: (filters: OperationsFilterValues) => void;
  onResetFilters: () => void;
};

function getQueueStats(items: GetOperationsResponse['items'] | undefined) {
  const source = items ?? [];

  return {
    activeOnPage: source.filter((item) => item.status !== 'approved' && item.status !== 'blocked')
      .length,
    highRiskOnPage: source.filter((item) => item.riskLevel === 'high').length,
    breachedOnPage: source.filter((item) => item.slaState === 'breached').length,
    escalatedOnPage: source.filter((item) => item.queue === 'senior_review').length,
  };
}

export function OperationsListToolbar({
  filters,
  data,
  totalOperations,
  visibleSelectedCount,
  isFetching,
  isLoading,
  realtimeMessage,
  onHideRealtimeMessage,
  onFiltersChange,
  onResetFilters,
}: Props) {
  const stats = getQueueStats(data?.items);

  return (
    <Box sx={{ mb: 2.5 }}>
      {realtimeMessage ? (
        <Alert
          severity="info"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={onHideRealtimeMessage}>
              Hide
            </Button>
          }
        >
          {realtimeMessage}
        </Alert>
      ) : null}

      <Paper
        sx={{
          p: 2.5,
          mb: 2,
          borderRadius: 6,
          bgcolor: alpha('#ffffff', 0.72),
          backdropFilter: 'blur(16px)',
        }}
      >
        <Stack
          direction={{ xs: 'column', xl: 'row' }}
          spacing={2.5}
          alignItems={{ xs: 'flex-start', xl: 'center' }}
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="h4" sx={{ mb: 1 }}>
              Operations Queue
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Triage cases by queue, priority and SLA instead of digging through a raw list.
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Summary cards below reflect the current page after filters.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Chip label={`Filtered total ${totalOperations}`} />
            <Chip label={`Selected ${visibleSelectedCount}`} />
            <Chip label={`Refreshed ${formatRefreshedAt(data?.refreshedAt)}`} />
            <Chip
              color="success"
              label="Live updates on"
              sx={{ bgcolor: alpha('#1f9d72', 0.12), color: 'success.main' }}
            />
            {isFetching && !isLoading ? <Chip label="Refreshing..." color="warning" /> : null}
          </Stack>
        </Stack>

        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
            <Paper sx={{ p: 2, borderRadius: 5, bgcolor: alpha('#5b6cff', 0.08) }}>
              <Typography variant="body2" color="text.secondary">
                Active on current page
              </Typography>
              <Typography variant="h5" sx={{ mt: 1 }}>
                {stats.activeOnPage}
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
            <Paper sx={{ p: 2, borderRadius: 5, bgcolor: alpha('#ef4444', 0.08) }}>
              <Typography variant="body2" color="text.secondary">
                High risk on current page
              </Typography>
              <Typography variant="h5" sx={{ mt: 1 }}>
                {stats.highRiskOnPage}
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
            <Paper sx={{ p: 2, borderRadius: 5, bgcolor: alpha('#f59e0b', 0.10) }}>
              <Typography variant="body2" color="text.secondary">
                SLA breached on current page
              </Typography>
              <Typography variant="h5" sx={{ mt: 1 }}>
                {stats.breachedOnPage}
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
            <Paper sx={{ p: 2, borderRadius: 5, bgcolor: alpha('#7c4dff', 0.08) }}>
              <Typography variant="body2" color="text.secondary">
                Escalated on current page
              </Typography>
              <Typography variant="h5" sx={{ mt: 1 }}>
                {stats.escalatedOnPage}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      <OperationsFilters value={filters} onChange={onFiltersChange} onReset={onResetFilters} />
    </Box>
  );
}