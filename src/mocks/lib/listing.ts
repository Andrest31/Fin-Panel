import { getSlaState } from '@/entities/operation/lib/decisioning';
import type {
  CasePriority,
  CaseQueue,
  OperationRecord,
  OperationRiskLevel,
  OperationsSortBy,
  OperationStatus,
  PaymentMethod,
  SortOrder,
} from './types';

function getPriorityWeight(priority: CasePriority) {
  if (priority === 'critical') return 4;
  if (priority === 'high') return 3;
  if (priority === 'medium') return 2;
  return 1;
}

function getSlaSortValue(slaDeadline: string | null) {
  if (!slaDeadline) return Number.MAX_SAFE_INTEGER;
  return new Date(slaDeadline).getTime();
}

function toListItem(operation: OperationRecord) {
  return {
    id: operation.id,
    merchant: operation.merchant,
    amount: operation.amount,
    currency: operation.currency,
    status: operation.status,
    riskLevel: operation.riskLevel,
    riskScore: operation.riskScore,
    createdAt: operation.createdAt,
    updatedAt: operation.updatedAt,
    customerId: operation.customerId,
    paymentMethod: operation.paymentMethod,
    country: operation.country,
    city: operation.city,
    deviceId: operation.deviceId,
    ipAddress: operation.ipAddress,
    reviewer: operation.reviewer,
    flagReasons: operation.flagReasons,
    queue: operation.queue,
    priority: operation.priority,
    slaDeadline: operation.slaDeadline,
    slaState: getSlaState(operation.slaDeadline),
  };
}

function sortOperations(
  data: OperationRecord[],
  sortBy: OperationsSortBy,
  order: SortOrder,
): OperationRecord[] {
  const sorted = [...data].sort((a, b) => {
    switch (sortBy) {
      case 'amount':
        return a.amount - b.amount;

      case 'merchant':
        return a.merchant.localeCompare(b.merchant);

      case 'riskScore':
        return a.riskScore - b.riskScore;

      case 'priority':
        return getPriorityWeight(a.priority) - getPriorityWeight(b.priority);

      case 'slaDeadline':
        return getSlaSortValue(a.slaDeadline) - getSlaSortValue(b.slaDeadline);

      case 'createdAt':
      default:
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
  });

  return order === 'asc' ? sorted : sorted.reverse();
}

function parseOptionalNumber(value: string | null): number | undefined {
  if (value === null || value.trim() === '') {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function filterOperations(items: OperationRecord[], url: URL): OperationRecord[] {
  const search = url.searchParams.get('search')?.trim().toLowerCase() ?? '';
  const status = url.searchParams.get('status') as OperationStatus | null;
  const riskLevel = url.searchParams.get('riskLevel') as OperationRiskLevel | null;
  const paymentMethod = url.searchParams.get('paymentMethod') as PaymentMethod | null;
  const country = url.searchParams.get('country');
  const queue = url.searchParams.get('queue') as CaseQueue | null;
  const priority = url.searchParams.get('priority') as CasePriority | null;
  const slaState = url.searchParams.get('slaState');
  const activeOnly = url.searchParams.get('activeOnly') === 'true';

  const minAmount = parseOptionalNumber(url.searchParams.get('minAmount'));
  const maxAmount = parseOptionalNumber(url.searchParams.get('maxAmount'));

  const dateFrom = url.searchParams.get('dateFrom');
  const dateTo = url.searchParams.get('dateTo');

  const dateFromTimestamp = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null;
  const dateToTimestamp = dateTo ? new Date(`${dateTo}T23:59:59.999`).getTime() : null;

  return items.filter((operation) => {
    const createdAtTimestamp = new Date(operation.createdAt).getTime();
    const currentSlaState = getSlaState(operation.slaDeadline);

    const matchesSearch =
      search.length === 0 ||
      operation.merchant.toLowerCase().includes(search) ||
      operation.id.toLowerCase().includes(search);

    const matchesStatus = !status || operation.status === status;
    const matchesRiskLevel = !riskLevel || operation.riskLevel === riskLevel;
    const matchesPaymentMethod = !paymentMethod || operation.paymentMethod === paymentMethod;
    const matchesCountry = !country || operation.country === country;
    const matchesQueue = !queue || operation.queue === queue;
    const matchesPriority = !priority || operation.priority === priority;
    const matchesSlaState = !slaState || currentSlaState === slaState;
    const matchesActiveOnly =
      !activeOnly || (operation.status !== 'approved' && operation.status !== 'blocked');
    const matchesMinAmount = minAmount === undefined || operation.amount >= minAmount;
    const matchesMaxAmount = maxAmount === undefined || operation.amount <= maxAmount;
    const matchesDateFrom = dateFromTimestamp === null || createdAtTimestamp >= dateFromTimestamp;
    const matchesDateTo = dateToTimestamp === null || createdAtTimestamp <= dateToTimestamp;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesRiskLevel &&
      matchesPaymentMethod &&
      matchesCountry &&
      matchesQueue &&
      matchesPriority &&
      matchesSlaState &&
      matchesActiveOnly &&
      matchesMinAmount &&
      matchesMaxAmount &&
      matchesDateFrom &&
      matchesDateTo
    );
  });
}

export { filterOperations, sortOperations, toListItem };