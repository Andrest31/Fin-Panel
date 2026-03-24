import { Alert, Box, Chip, CircularProgress, Stack, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getOperations, type Operation } from '@/entities/operation/api/getOperations';
import { getOperationsFiltersFromSearchParams, toOperationsSearchParams } from '@/features/operation-filters/lib/searchParams';
import { defaultOperationsFilters, type OperationsFilterValues } from '@/features/operation-filters/model/types';
import { OperationsFilters } from '@/features/operation-filters/ui/OperationsFilters';
import { OperationsTable } from '@/widgets/operations-table/OperationsTable';

function applyFiltersAndSort(data: Operation[], filters: OperationsFilterValues): Operation[] {
  const normalizedSearch = filters.search.trim().toLowerCase();

  const filtered = data.filter((operation) => {
    const matchesSearch =
      normalizedSearch.length === 0 || operation.merchant.toLowerCase().includes(normalizedSearch);

    const matchesStatus = filters.status === 'all' || operation.status === filters.status;

    const matchesRiskLevel =
      filters.riskLevel === 'all' || operation.riskLevel === filters.riskLevel;

    return matchesSearch && matchesStatus && matchesRiskLevel;
  });

  const sorted = [...filtered].sort((a, b) => {
    let comparison = 0;

    if (filters.sortBy === 'amount') {
      comparison = a.amount - b.amount;
    } else if (filters.sortBy === 'merchant') {
      comparison = a.merchant.localeCompare(b.merchant);
    } else {
      comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }

    return filters.order === 'asc' ? comparison : -comparison;
  });

  return sorted;
}

export function OperationsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(
    () => getOperationsFiltersFromSearchParams(searchParams),
    [searchParams],
  );

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['operations'],
    queryFn: getOperations,
    refetchInterval: 10000,
  });

  const filteredOperations = useMemo(() => {
    return applyFiltersAndSort(data ?? [], filters);
  }, [data, filters]);

  const handleFiltersChange = (nextFilters: OperationsFilterValues) => {
    setSearchParams(toOperationsSearchParams(nextFilters));
  };

  const handleReset = () => {
    setSearchParams(toOperationsSearchParams(defaultOperationsFilters));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 1 }}>
        Operations Queue
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Очередь операций для анализа: поиск, фильтрация, сортировка и регулярное обновление данных.
      </Typography>

      <OperationsFilters
        value={filters}
        onChange={handleFiltersChange}
        onReset={handleReset}
      />

      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
        <Chip label={`Found: ${filteredOperations.length}`} />
        <Chip label={`Sort: ${filters.sortBy}`} />
        <Chip label={`Order: ${filters.order}`} />
        {isFetching && !isLoading ? <Chip label="Refreshing..." color="warning" /> : null}
      </Stack>

      {isLoading && <CircularProgress />}

      {isError && (
        <Alert severity="error">
          {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
      )}

      {!isLoading && !isError && filteredOperations.length === 0 && (
        <Alert severity="info">No operations found for current filters.</Alert>
      )}

      {!isLoading && !isError && filteredOperations.length > 0 && (
        <OperationsTable operations={filteredOperations} />
      )}
    </Box>
  );
}