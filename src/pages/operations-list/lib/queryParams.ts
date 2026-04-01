import type { GetOperationsParams } from '@/entities/operation/api/getOperations';
import type { OperationsFilterValues } from '@/features/operation-filters/model/types';

export function mapFiltersToQueryParams(filters: OperationsFilterValues): GetOperationsParams {
  const minAmount = filters.minAmount.trim() ? Number(filters.minAmount) : undefined;
  const maxAmount = filters.maxAmount.trim() ? Number(filters.maxAmount) : undefined;

  return {
    page: filters.page,
    pageSize: filters.pageSize,
    search: filters.search.trim() || undefined,
    status: filters.status === 'all' ? undefined : filters.status,
    riskLevel: filters.riskLevel === 'all' ? undefined : filters.riskLevel,
    sortBy: filters.sortBy,
    order: filters.order,
    minAmount: minAmount !== undefined && !Number.isNaN(minAmount) ? minAmount : undefined,
    maxAmount: maxAmount !== undefined && !Number.isNaN(maxAmount) ? maxAmount : undefined,
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
    paymentMethod: filters.paymentMethod === 'all' ? undefined : filters.paymentMethod,
    country: filters.country === 'all' ? undefined : filters.country,
    queue: filters.queue === 'all' ? undefined : filters.queue,
    priority: filters.priority === 'all' ? undefined : filters.priority,
    slaState: filters.slaState === 'all' ? undefined : filters.slaState,
    activeOnly: filters.activeOnly || undefined,
  };
}

export function formatRefreshedAt(value?: string) {
  if (!value) return '—';
  return new Date(value).toLocaleTimeString();
}