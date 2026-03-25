import type { CollaborationUpdateRequest, OperationRecord } from './types';

function applyCollaborationChange(
  operation: OperationRecord,
  payload: CollaborationUpdateRequest,
) {
  const now = new Date().toISOString();

  if (payload.action === 'assign') {
    const previousAssignee = operation.assignee?.name ?? null;
    const previousQueue = operation.queue;

    operation.assignee = {
      id: payload.assigneeId ?? 'spec_unknown',
      name: payload.assigneeName ?? 'Unknown specialist',
      role: payload.assigneeRole ?? 'fraud_analyst',
    };
    operation.queue = payload.queue ?? operation.queue;
    operation.priority = payload.priority ?? operation.priority;
    operation.updatedAt = now;

    operation.history.unshift({
      id: `evt_assign_${Date.now()}_${operation.id}`,
      type: 'reassigned',
      timestamp: now,
      actor: 'analyst_99',
      comment: payload.note ?? 'Case reassigned',
      reason: payload.reason,
      changes: [
        { field: 'assignee', before: previousAssignee, after: operation.assignee.name },
        { field: 'queue', before: previousQueue, after: operation.queue },
      ],
    });
  }

  if (payload.action === 'escalate') {
    const previousQueue = operation.queue;
    const previousPriority = operation.priority;
    const previousAssignee = operation.assignee?.name ?? null;

    operation.assignee = {
      id: payload.assigneeId ?? 'spec_escalated',
      name: payload.assigneeName ?? 'Escalated specialist',
      role: payload.assigneeRole ?? 'compliance',
    };
    operation.queue = payload.queue ?? 'compliance';
    operation.priority = payload.priority ?? 'critical';
    operation.updatedAt = now;

    operation.history.unshift({
      id: `evt_escalate_${Date.now()}_${operation.id}`,
      type: 'escalated',
      timestamp: now,
      actor: 'analyst_99',
      comment: payload.note ?? 'Case escalated',
      reason: payload.reason,
      changes: [
        { field: 'assignee', before: previousAssignee, after: operation.assignee.name },
        { field: 'queue', before: previousQueue, after: operation.queue },
        { field: 'priority', before: previousPriority, after: operation.priority },
      ],
    });
  }

  if (payload.action === 'add_note') {
    operation.updatedAt = now;

    operation.history.unshift({
      id: `evt_note_${Date.now()}_${operation.id}`,
      type: 'note_added',
      timestamp: now,
      actor: 'analyst_99',
      comment: payload.note ?? 'Note added',
      reason: payload.reason,
      changes: [],
    });
  }

  operation.collaborationNotes.unshift({
    id: `note_${Date.now()}_${operation.id}`,
    author: 'Alexey Morozov',
    role:
      payload.action === 'escalate'
        ? (payload.assigneeRole ?? 'compliance')
        : 'fraud_analyst',
    createdAt: now,
    text: payload.note ?? 'Collaboration note added',
  });
}

export { applyCollaborationChange };
