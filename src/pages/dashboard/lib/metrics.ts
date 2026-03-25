import type { Operation } from '@/entities/operation/api/getOperations';
import type {
  ChartItem,
  DashboardMetrics,
  FlagReasonStat,
  LatestOperation,
  MetricCardItem,
} from '../model/types';

export const STATUS_COLORS: Record<Operation['status'], string> = {
  new: '#90a4ae',
  in_review: '#ffb300',
  approved: '#43a047',
  blocked: '#e53935',
  flagged: '#8e24aa',
};

export const RISK_COLORS: Record<Operation['riskLevel'], string> = {
  low: '#43a047',
  medium: '#ffb300',
  high: '#e53935',
};

export function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export function getDashboardMetrics(operations: Operation[]): DashboardMetrics {
  const totalCount = operations.length;
  const highRiskCount = operations.filter((operation) => operation.riskLevel === 'high').length;
  const inReviewCount = operations.filter((operation) => operation.status === 'in_review').length;
  const blockedCount = operations.filter((operation) => operation.status === 'blocked').length;
  const approvedCount = operations.filter((operation) => operation.status === 'approved').length;

  return {
    totalCount,
    highRiskCount,
    inReviewCount,
    blockedCount,
    approvedCount,
    approvedRate: totalCount > 0 ? (approvedCount / totalCount) * 100 : 0,
  };
}

export function getMetricCards(metrics: DashboardMetrics): MetricCardItem[] {
  return [
    { label: 'Total operations', value: metrics.totalCount },
    { label: 'High risk', value: metrics.highRiskCount },
    { label: 'In review', value: metrics.inReviewCount },
    { label: 'Blocked', value: metrics.blockedCount },
    { label: 'Approved', value: metrics.approvedCount },
    { label: 'Approved rate', value: formatPercent(metrics.approvedRate) },
  ];
}

export function getStatusBreakdown(operations: Operation[]): ChartItem[] {
  return getGroupedCounts(operations, (operation) => operation.status);
}

export function getRiskBreakdown(operations: Operation[]): ChartItem[] {
  return getGroupedCounts(operations, (operation) => operation.riskLevel);
}

export function getTopFlagReasons(operations: Operation[]): FlagReasonStat[] {
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

export function getLatestOperations(operations: Operation[]): LatestOperation[] {
  return [...operations]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);
}

function getGroupedCounts<T extends string>(
  operations: Operation[],
  getKey: (operation: Operation) => T,
): ChartItem[] {
  const counts = new Map<T, number>();

  operations.forEach((operation) => {
    const key = getKey(operation);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
}
