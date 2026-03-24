export type OperationStatus = 'all' | 'new' | 'in_review' | 'approved' | 'blocked' | 'flagged';
export type OperationRiskLevel = 'all' | 'low' | 'medium' | 'high';
export type OperationsSortBy = 'createdAt' | 'amount' | 'merchant';
export type SortOrder = 'asc' | 'desc';
export type PaymentMethodFilter = 'all' | 'card' | 'sbp';
export type CountryFilter = 'all' | 'RU';

export type OperationsFilterValues = {
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
};

export const defaultOperationsFilters: OperationsFilterValues = {
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
};