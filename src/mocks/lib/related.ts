import type { OperationRecord } from './types';

function buildRelatedOperations(items: OperationRecord[], operation: OperationRecord) {
  return items
    .filter((item) => item.id !== operation.id)
    .filter(
      (item) =>
        item.customerId === operation.customerId || item.deviceId === operation.deviceId,
    )
    .slice(0, 5)
    .map((item) => ({
      id: item.id,
      merchant: item.merchant,
      amount: item.amount,
      currency: item.currency,
      status: item.status,
      riskLevel: item.riskLevel,
      createdAt: item.createdAt,
      relation:
        item.customerId === operation.customerId
          ? 'same customer'
          : 'same device',
    }));
}

export { buildRelatedOperations };
