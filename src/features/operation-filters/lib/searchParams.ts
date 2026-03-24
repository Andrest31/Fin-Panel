import type { URLSearchParamsInit } from 'react-router-dom';
import {
  defaultOperationsFilters,
  type CountryFilter,
  type OperationRiskLevel,
  type OperationStatus,
  type OperationsFilterValues,
  type OperationsSortBy,
  type PaymentMethodFilter,
  type SortOrder,
} from '../model/types';

const allowedStatuses: OperationStatus[] = ['all', 'new', 'in_review', 'approved', 'blocked', 'flagged'];
const allowedRiskLevels: OperationRiskLevel[] = ['all', 'low', 'medium', 'high'];
const allowedSortBy: OperationsSortBy[] = ['createdAt', 'amount', 'merchant'];
const allowedOrder: SortOrder[] = ['asc', 'desc'];
const allowedPaymentMethods: PaymentMethodFilter[] = ['all', 'card', 'sbp'];
const allowedCountries: CountryFilter[] = ['all', 'RU'];

function isAllowedValue<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  if (!value) return fallback;
  return allowed.includes(value as T) ? (value as T) : fallback;
}

export function getOperationsFiltersFromSearchParams(searchParams: URLSearchParams): OperationsFilterValues {
  return {
    search: searchParams.get('search') ?? defaultOperationsFilters.search,
    status: isAllowedValue(searchParams.get('status'), allowedStatuses, defaultOperationsFilters.status),
    riskLevel: isAllowedValue(searchParams.get('riskLevel'), allowedRiskLevels, defaultOperationsFilters.riskLevel),
    sortBy: isAllowedValue(searchParams.get('sortBy'), allowedSortBy, defaultOperationsFilters.sortBy),
    order: isAllowedValue(searchParams.get('order'), allowedOrder, defaultOperationsFilters.order),
    minAmount: searchParams.get('minAmount') ?? defaultOperationsFilters.minAmount,
    maxAmount: searchParams.get('maxAmount') ?? defaultOperationsFilters.maxAmount,
    dateFrom: searchParams.get('dateFrom') ?? defaultOperationsFilters.dateFrom,
    dateTo: searchParams.get('dateTo') ?? defaultOperationsFilters.dateTo,
    paymentMethod: isAllowedValue(
      searchParams.get('paymentMethod'),
      allowedPaymentMethods,
      defaultOperationsFilters.paymentMethod,
    ),
    country: isAllowedValue(searchParams.get('country'), allowedCountries, defaultOperationsFilters.country),
  };
}

export function toOperationsSearchParams(filters: OperationsFilterValues): URLSearchParamsInit {
  const params: Record<string, string> = {};

  if (filters.search) params.search = filters.search;
  if (filters.status !== defaultOperationsFilters.status) params.status = filters.status;
  if (filters.riskLevel !== defaultOperationsFilters.riskLevel) params.riskLevel = filters.riskLevel;
  if (filters.sortBy !== defaultOperationsFilters.sortBy) params.sortBy = filters.sortBy;
  if (filters.order !== defaultOperationsFilters.order) params.order = filters.order;
  if (filters.minAmount) params.minAmount = filters.minAmount;
  if (filters.maxAmount) params.maxAmount = filters.maxAmount;
  if (filters.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters.dateTo) params.dateTo = filters.dateTo;
  if (filters.paymentMethod !== defaultOperationsFilters.paymentMethod) {
    params.paymentMethod = filters.paymentMethod;
  }
  if (filters.country !== defaultOperationsFilters.country) {
    params.country = filters.country;
  }

  return params;
}