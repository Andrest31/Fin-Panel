import { Alert, Box, Button, Chip, Stack } from '@mui/material';
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
  return (
    <>
      <Box
        sx={{
          position: 'sticky',
          top: 64,
          zIndex: 3,
          bgcolor: 'background.default',
          pb: 2,
          mb: 1,
        }}
      >
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

        <OperationsFilters value={filters} onChange={onFiltersChange} onReset={onResetFilters} />
      </Box>

      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
        <Chip label={`Found: ${totalOperations}`} />
        <Chip label={`Page: ${filters.page}`} />
        <Chip label={`Rows: ${filters.pageSize}`} />
        <Chip label={`Selected: ${visibleSelectedCount}`} />
        <Chip label={`Sort: ${filters.sortBy}`} />
        <Chip label={`Order: ${filters.order}`} />
        <Chip label={`Refreshed: ${formatRefreshedAt(data?.refreshedAt)}`} />
        <Chip color="success" label="Live updates on" />
        {isFetching && !isLoading ? <Chip label="Refreshing..." color="warning" /> : null}
      </Stack>
    </>
  );
}
