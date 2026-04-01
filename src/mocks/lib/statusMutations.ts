import {
  assertAllowedStatusTransition,
  syncDerivedOperationFields,
} from '@/entities/operation/lib/decisioning';
import type { OperationRecord, OperationStatus } from './types';

function getActionMeta(status: OperationStatus) {
  if (status === 'approved') {
    return {
      eventType: 'approved',
      defaultComment: 'Operation approved by analyst',
      reviewer: 'analyst_99',
    };
  }

  if (status === 'blocked') {
    return {
      eventType: 'blocked',
      defaultComment: 'Operation blocked by analyst',
      reviewer: 'analyst_99',
    };
  }

  if (status === 'in_review') {
    return {
      eventType: 'sent_to_review',
      defaultComment: 'Operation sent to manual review',
      reviewer: 'analyst_99',
    };
  }

  if (status === 'flagged') {
    return {
      eventType: 'flagged',
      defaultComment: 'Operation flagged for additional checks',
      reviewer: 'analyst_99',
    };
  }

  return {
    eventType: 'status_changed',
    defaultComment: `Status changed to ${status}`,
    reviewer: 'analyst_99',
  };
}

function applyStatusChange(
  operation: OperationRecord,
  nextStatus: OperationStatus,
  reason?: string,
  comment?: string,
  actor = 'analyst_99',
) {
  assertAllowedStatusTransition(operation.status, nextStatus);

  const previousStatus = operation.status;
  const previousQueue = operation.queue;
  const previousPriority = operation.priority;
  const previousReviewer = operation.reviewer;
  const now = new Date().toISOString();
  const actionMeta = getActionMeta(nextStatus);

  operation.status = nextStatus;
  operation.updatedAt = now;
  operation.reviewer = actionMeta.reviewer;
  operation.analystSummary = comment?.trim() || operation.analystSummary;

  syncDerivedOperationFields(operation, { now });

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
        before: previousStatus,
        after: nextStatus,
      },
      {
        field: 'reviewer',
        before: previousReviewer,
        after: actionMeta.reviewer,
      },
      {
        field: 'queue',
        before: previousQueue,
        after: operation.queue,
      },
      {
        field: 'priority',
        before: previousPriority,
        after: operation.priority,
      },
    ],
  });
}

export { applyStatusChange };