import type { URLSearchParamsInit } from 'react-router-dom';
import {
  defaultOperationsFilters,
  type CountryFilter,
  type OperationRiskLevel,
  type OperationStatus,
  type OperationsFilterValues,
  type OperationsSortBy,
  type PaymentMethodFilter,
  type PriorityFilter,
  type QueueFilter,
  type QueuePreset,
  type SlaStateFilter,
  type SortOrder,
} from '../model/types';

const allowedStatuses: OperationStatus[] = ['all', 'new', 'in_review', 'approved', 'blocked', 'flagged'];
const allowedRiskLevels: OperationRiskLevel[] = ['all', 'low', 'medium', 'high'];
const allowedSortBy: OperationsSortBy[] = [
  'createdAt',
  'amount',
  'merchant',
  'riskScore',
  'priority',
  'slaDeadline',
];
const allowedOrder: SortOrder[] = ['asc', 'desc'];
const allowedPaymentMethods: PaymentMethodFilter[] = ['all', 'card', 'sbp'];
const allowedCountries: CountryFilter[] = ['all', 'RU'];
const allowedQueues: QueueFilter[] = [
  'all',
  'manual_review',
  'senior_review',
  'compliance',
  'customer_confirmation',
];
const allowedPriorities: PriorityFilter[] = ['all', 'low', 'medium', 'high', 'critical'];
const allowedSlaStates: SlaStateFilter[] = ['all', 'healthy', 'at_risk', 'breached', 'resolved'];
const allowedPresets: QueuePreset[] = [
  'all',
  'high_risk',
  'manual_review',
  'escalated',
  'sla_breached',
  'active',
];
const allowedPageSizes = [5, 10, 25, 50, 100];

function isAllowedValue<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  if (!value) return fallback;
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function parsePositiveInteger(value: string | null, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

function parseBoolean(value: string | null, fallback: boolean) {
  if (value === null) return fallback;
  return value === 'true';
}

export function getOperationsFiltersFromSearchParams(searchParams: URLSearchParams): OperationsFilterValues {
  const pageSizeFromUrl = parsePositiveInteger(searchParams.get('pageSize'), defaultOperationsFilters.pageSize);

  return {
    page: parsePositiveInteger(searchParams.get('page'), defaultOperationsFilters.page),
    pageSize: allowedPageSizes.includes(pageSizeFromUrl) ? pageSizeFromUrl : defaultOperationsFilters.pageSize,
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
    queue: isAllowedValue(searchParams.get('queue'), allowedQueues, defaultOperationsFilters.queue),
    priority: isAllowedValue(searchParams.get('priority'), allowedPriorities, defaultOperationsFilters.priority),
    slaState: isAllowedValue(searchParams.get('slaState'), allowedSlaStates, defaultOperationsFilters.slaState),
    activeOnly: parseBoolean(searchParams.get('activeOnly'), defaultOperationsFilters.activeOnly),
    preset: isAllowedValue(searchParams.get('preset'), allowedPresets, defaultOperationsFilters.preset),
  };
}

export function toOperationsSearchParams(filters: OperationsFilterValues): URLSearchParamsInit {
  const params: Record<string, string> = {};

  if (filters.page !== defaultOperationsFilters.page) params.page = String(filters.page);
  if (filters.pageSize !== defaultOperationsFilters.pageSize) {
    params.pageSize = String(filters.pageSize);
  }

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
  if (filters.queue !== defaultOperationsFilters.queue) {
    params.queue = filters.queue;
  }
  if (filters.priority !== defaultOperationsFilters.priority) {
    params.priority = filters.priority;
  }
  if (filters.slaState !== defaultOperationsFilters.slaState) {
    params.slaState = filters.slaState;
  }
  if (filters.activeOnly !== defaultOperationsFilters.activeOnly) {
    params.activeOnly = String(filters.activeOnly);
  }
  if (filters.preset !== defaultOperationsFilters.preset) {
    params.preset = filters.preset;
  }

  return params;
}