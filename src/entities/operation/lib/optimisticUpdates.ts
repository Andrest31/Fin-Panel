import type {
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
    default:
      return 'status_changed';
  }
}

function createOptimisticHistoryEvent(payload: DecisionPayload): OperationHistoryEvent {
  return {
    id: `optimistic_${Date.now()}`,
    type: getEventType(payload.status),
    timestamp: new Date().toISOString(),
    actor: OPTIMISTIC_ACTOR,
    comment: payload.comment,
    reason: payload.reason,
  };
}

export function applyOptimisticDecisionToOperation(
  operation: Operation,
  payload: DecisionPayload,
): Operation {
  return {
    ...operation,
    status: payload.status,
    updatedAt: new Date().toISOString(),
    reviewer: OPTIMISTIC_ACTOR,
  };
}

export function applyOptimisticDecisionToOperationDetails(
  operation: OperationDetails,
  payload: DecisionPayload,
): OperationDetails {
  const optimisticEvent = createOptimisticHistoryEvent(payload);

  return {
    ...operation,
    status: payload.status,
    updatedAt: optimisticEvent.timestamp,
    reviewer: OPTIMISTIC_ACTOR,
    history: [optimisticEvent, ...operation.history],
  };
}

export function applyOptimisticDecisionToOperationsList(
  operations: Operation[],
  ids: string[],
  payload: DecisionPayload,
): Operation[] {
  const selectedIds = new Set(ids);

  return operations.map((operation) =>
    selectedIds.has(operation.id)
      ? applyOptimisticDecisionToOperation(operation, payload)
      : operation,
  );
}