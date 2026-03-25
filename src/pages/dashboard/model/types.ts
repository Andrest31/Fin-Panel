import type { Operation } from '@/entities/operation/api/getOperations';

export type ChartItem = {
  name: string;
  value: number;
};

export type FlagReasonStat = {
  reason: string;
  count: number;
};

export type DashboardMetrics = {
  totalCount: number;
  highRiskCount: number;
  inReviewCount: number;
  blockedCount: number;
  approvedCount: number;
  approvedRate: number;
};

export type MetricCardItem = {
  label: string;
  value: number | string;
};

export type LatestOperation = Operation;
