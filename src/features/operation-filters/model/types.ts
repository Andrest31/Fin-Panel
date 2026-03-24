export type OperationStatus = 'all' | 'new' | 'in_review' | 'approved' | 'blocked' | 'flagged';
export type OperationRiskLevel = 'all' | 'low' | 'medium' | 'high';
export type OperationsSortBy = 'createdAt' | 'amount' | 'merchant';
export type SortOrder = 'asc' | 'desc';

export type OperationsFilterValues = {
  search: string;
  status: OperationStatus;
  riskLevel: OperationRiskLevel;
  sortBy: OperationsSortBy;
  order: SortOrder;
};

export const defaultOperationsFilters: OperationsFilterValues = {
  search: '',
  status: 'all',
  riskLevel: 'all',
  sortBy: 'createdAt',
  order: 'desc',
};