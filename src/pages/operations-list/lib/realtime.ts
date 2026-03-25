import type { OperationsFilterValues } from '@/features/operation-filters/model/types';

export function isRealtimeSensitiveView(filters: OperationsFilterValues) {
  return (
    filters.page === 1 &&
    filters.sortBy === 'createdAt' &&
    filters.order === 'desc' &&
    !filters.search &&
    filters.status === 'all' &&
    filters.riskLevel === 'all'
  );
}

export function getRealtimeMessage(newIdsCount: number) {
  return newIdsCount === 1
    ? 'В очереди появилась 1 новая операция'
    : `В очереди появилось ${newIdsCount} новых операций`;
}
