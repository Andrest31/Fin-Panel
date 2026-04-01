import {
  assertAllowedStatusTransition,
  syncDerivedOperationFields,
} from '@/entities/operation/lib/decisioning';
import type {
  GetOperationsResponse,
  Operation,
  OperationDetails,
  OperationHistoryEvent,
  OperationStatus,
} from '../api/getOperations';

type DecisionPayload = {
  status: OperationStatus;
  reason: string;
  comment: string;
};

const OPTIMISTIC_ACTOR = 'analyst_99';

function getEventType(status: OperationStatus): string {
  switch (status) {
    case 'approved':
      return 'approved';
    case 'blocked':
      return 'blocked';
    case 'in_review':
      return 'sent_to_review';
    case 'flagged':
      return 'flagged';
    default:
      return 'status_changed';
  }
}

function createOptimisticHistoryEvent(
  operation: Operation | OperationDetails,
  payload: DecisionPayload,
): OperationHistoryEvent {
  return {
    id: `optimistic_${Date.now()}`,
    type: getEventType(payload.status),
    timestamp: new Date().toISOString(),
    actor: OPTIMISTIC_ACTOR,
    comment: payload.comment,
    reason: payload.reason,
    changes: [
      {
        field: 'status',
        before: operation.status,
        after: payload.status,
      },
      {
        field: 'reviewer',
        before: operation.reviewer,
        after: OPTIMISTIC_ACTOR,
      },
    ],
  };
}

export function applyOptimisticDecisionToOperation(
  operation: Operation,
  payload: DecisionPayload,
): Operation {
  try {
    assertAllowedStatusTransition(operation.status, payload.status);

    return {
      ...operation,
      status: payload.status,
      updatedAt: new Date().toISOString(),
      reviewer: OPTIMISTIC_ACTOR,
    };
  } catch {
    return operation;
  }
}

export function applyOptimisticDecisionToOperationDetails(
  operation: OperationDetails,
  payload: DecisionPayload,
): OperationDetails {
  try {
    assertAllowedStatusTransition(operation.status, payload.status);

    const optimisticEvent = createOptimisticHistoryEvent(operation, payload);

    const nextOperation: OperationDetails = {
      ...operation,
      status: payload.status,
      updatedAt: optimisticEvent.timestamp,
      reviewer: OPTIMISTIC_ACTOR,
      analystSummary: payload.comment,
      history: [optimisticEvent, ...operation.history],
    };

    return syncDerivedOperationFields(nextOperation, { now: optimisticEvent.timestamp });
  } catch {
    return operation;
  }
}

export function applyOptimisticDecisionToOperationsList(
  operations: Operation[],
  ids: string[],
  payload: DecisionPayload,
): Operation[] {
  const selectedIds = new Set(ids);

  return operations.map((operation) => {
    if (!selectedIds.has(operation.id)) {
      return operation;
    }

    return applyOptimisticDecisionToOperation(operation, payload);
  });
}

export function applyOptimisticDecisionToOperationsResponse(
  response: GetOperationsResponse,
  ids: string[],
  payload: DecisionPayload,
): GetOperationsResponse {
  return {
    ...response,
    items: applyOptimisticDecisionToOperationsList(response.items, ids, payload),
  };
}