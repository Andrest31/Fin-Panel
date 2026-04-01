export type OperationStatus = 'all' | 'new' | 'in_review' | 'approved' | 'blocked' | 'flagged';
export type OperationRiskLevel = 'all' | 'low' | 'medium' | 'high';
export type OperationsSortBy =
  | 'createdAt'
  | 'amount'
  | 'merchant'
  | 'riskScore'
  | 'priority'
  | 'slaDeadline';
export type SortOrder = 'asc' | 'desc';
export type PaymentMethodFilter = 'all' | 'card' | 'sbp';
export type CountryFilter = 'all' | 'RU';
export type QueueFilter =
  | 'all'
  | 'manual_review'
  | 'senior_review'
  | 'compliance'
  | 'customer_confirmation';
export type PriorityFilter = 'all' | 'low' | 'medium' | 'high' | 'critical';
export type SlaStateFilter = 'all' | 'healthy' | 'at_risk' | 'breached' | 'resolved';
export type QueuePreset = 'all' | 'high_risk' | 'manual_review' | 'escalated' | 'sla_breached' | 'active';

export type OperationsFilterValues = {
  page: number;
  pageSize: number;
  search: string;
  status: OperationStatus;
  riskLevel: OperationRiskLevel;
  sortBy: OperationsSortBy;
  order: SortOrder;
  minAmount: string;
  maxAmount: string;
  dateFrom: string;
  dateTo: string;
  paymentMethod: PaymentMethodFilter;
  country: CountryFilter;
  queue: QueueFilter;
  priority: PriorityFilter;
  slaState: SlaStateFilter;
  activeOnly: boolean;
  preset: QueuePreset;
};

export const defaultOperationsFilters: OperationsFilterValues = {
  page: 1,
  pageSize: 10,
  search: '',
  status: 'all',
  riskLevel: 'all',
  sortBy: 'createdAt',
  order: 'desc',
  minAmount: '',
  maxAmount: '',
  dateFrom: '',
  dateTo: '',
  paymentMethod: 'all',
  country: 'all',
  queue: 'all',
  priority: 'all',
  slaState: 'all',
  activeOnly: true,
  preset: 'all',
};