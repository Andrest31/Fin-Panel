import type { OperationRecord, OperationStatus } from './types';

function getActionMeta(status: OperationStatus) {
  if (status === 'approved') {
    return {
      eventType: 'approved',
      defaultComment: 'Operation approved by analyst',
      reviewer: 'analyst_99',
      recommendedAction: 'Operation was approved after analyst review.',
    };
  }

  if (status === 'blocked') {
    return {
      eventType: 'blocked',
      defaultComment: 'Operation blocked by analyst',
      reviewer: 'analyst_99',
      recommendedAction: 'Operation was blocked after analyst decision.',
    };
  }

  if (status === 'in_review') {
    return {
      eventType: 'sent_to_review',
      defaultComment: 'Operation sent to manual review',
      reviewer: 'analyst_99',
      recommendedAction: 'Operation requires additional manual investigation.',
    };
  }

  return {
    eventType: 'status_changed',
    defaultComment: `Status changed to ${status}`,
    reviewer: 'analyst_99',
    recommendedAction: `Status changed to ${status}.`,
  };
}

function applyStatusChange(
  operation: OperationRecord,
  nextStatus: OperationStatus,
  reason?: string,
  comment?: string,
  actor = 'analyst_99',
) {
  const now = new Date().toISOString();
  const actionMeta = getActionMeta(nextStatus);

  operation.history.unshift({
    id: `evt_${Date.now()}_${operation.id}`,
    type: actionMeta.eventType,
    timestamp: now,
    actor,
    comment: comment?.trim() || actionMeta.defaultComment,
    reason: reason?.trim() || undefined,
    changes: [
      {
        field: 'status',
        before: operation.status,
        after: nextStatus,
      },
      {
        field: 'reviewer',
        before: operation.reviewer,
        after: actionMeta.reviewer,
      },
    ],
  });

  operation.status = nextStatus;
  operation.updatedAt = now;
  operation.reviewer = actionMeta.reviewer;
  operation.analystSummary = comment?.trim() || operation.analystSummary;
  operation.recommendedAction = actionMeta.recommendedAction;
}

export { applyStatusChange };
