import type {
  CollaborationUpdateRequest,
  OperationRecord,
  OperationRiskLevel,
  OperationsSortBy,
  OperationStatus,
  PaymentMethod,
  SortOrder,
  StoreState,
} from './types';

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
  };
}

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

function applyCollaborationChange(
  operation: OperationRecord,
  payload: CollaborationUpdateRequest,
) {
  const now = new Date().toISOString();

  if (payload.action === 'assign') {
    const previousAssignee = operation.assignee?.name ?? null;

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
        { field: 'queue', before: operation.queue, after: payload.queue ?? operation.queue },
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

function createRealtimeOperation(sequence: number): OperationRecord {
  const now = new Date();
  const createdAt = now.toISOString();

  return {
    id: `op_live_${sequence}`,
    merchant: `Realtime Merchant ${sequence}`,
    amount: 5000 + (sequence % 20) * 750,
    currency: 'RUB',
    status: sequence % 2 === 0 ? 'new' : 'flagged',
    riskLevel: sequence % 3 === 0 ? 'medium' : 'high',
    riskScore: sequence % 3 === 0 ? 63 : 82,
    riskFactors: [
      {
        code: 'velocity_spike',
        label: 'Velocity spike',
        contribution: 24,
        value: 'Rapid burst detected in last 10 minutes',
      },
      {
        code: 'new_device',
        label: 'New device',
        contribution: 18,
        value: 'Previously unseen device fingerprint',
      },
      {
        code: 'amount_anomaly',
        label: 'Amount anomaly',
        contribution: 17,
        value: 'Higher than normal for this customer cohort',
      },
    ],
    createdAt,
    updatedAt: createdAt,
    customerId: `cus_live_${sequence % 12}`,
    paymentMethod: sequence % 2 === 0 ? 'card' : 'sbp',
    country: 'RU',
    city: sequence % 2 === 0 ? 'Moscow' : 'Saint Petersburg',
    deviceId: `dev_live_${sequence % 6}`,
    ipAddress: `172.18.${sequence % 100}.${(sequence % 200) + 20}`,
    reviewer: null,
    flagReasons: ['velocity_spike', 'new_device'],
    recommendedAction: 'Review immediately due to live anomaly burst.',
    analystSummary: 'Realtime-generated operation for queue monitoring demo.',
    assignee: null,
    queue: 'manual_review',
    priority: 'high',
    slaDeadline: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
    collaborationNotes: [],
    history: [
      {
        id: `evt_live_${sequence}_1`,
        type: 'created',
        timestamp: createdAt,
        actor: 'system',
        comment: 'Operation created by realtime stream simulator',
      },
      {
        id: `evt_live_${sequence}_2`,
        type: 'risk_scored',
        timestamp: createdAt,
        actor: 'system',
        comment: 'Risk score calculated for realtime event',
        changes: [
          { field: 'riskScore', before: null, after: sequence % 3 === 0 ? '63' : '82' },
          { field: 'riskLevel', before: null, after: sequence % 3 === 0 ? 'medium' : 'high' },
        ],
      },
    ],
  };
}

function applyLiveQueueMutation(store: StoreState) {
  const now = Date.now();

  if (now - store.lastMutationAt < 9000) {
    return;
  }

  const shouldInsertNewOperation = store.nextRealtimeId % 2 === 0;

  if (shouldInsertNewOperation) {
    const operation = createRealtimeOperation(store.nextRealtimeId);
    store.operations.unshift(operation);
    store.nextRealtimeId += 1;
    store.lastMutationAt = now;
    return;
  }

  const targetIndex = Math.min(
    store.operations.length - 1,
    Math.max(3, store.nextRealtimeId % 25),
  );

  const target = store.operations[targetIndex];

  if (target) {
    applyStatusChange(
      target,
      target.status === 'new' ? 'in_review' : target.status === 'in_review' ? 'blocked' : 'in_review',
      'system_monitoring_signal',
      'Operation was updated by realtime monitoring rules',
      'system',
    );
  }

  store.nextRealtimeId += 1;
  store.lastMutationAt = now;
}

function applyLiveDetailMutation(store: StoreState, operation: OperationRecord) {
  const now = Date.now();
  const previousTouchAt = store.lastDetailMutationAtById[operation.id] ?? 0;

  if (now - previousTouchAt < 14000) {
    return;
  }

  const timestamp = new Date(now).toISOString();

  operation.updatedAt = timestamp;
  operation.history.unshift({
    id: `evt_detail_live_${now}_${operation.id}`,
    type: 'monitoring_signal_refreshed',
    timestamp,
    actor: 'system',
    comment: 'Additional monitoring signal attached to the case in realtime.',
    changes: [],
  });

  if (operation.assignee && operation.collaborationNotes.length < 6) {
    operation.collaborationNotes.unshift({
      id: `note_live_${now}_${operation.id}`,
      author: operation.assignee.name,
      role: operation.assignee.role,
      createdAt: timestamp,
      text: 'Realtime monitoring refreshed the case context.',
    });
  }

  store.lastDetailMutationAtById[operation.id] = now;
}

function sortOperations(
  data: OperationRecord[],
  sortBy: OperationsSortBy,
  order: SortOrder,
): OperationRecord[] {
  const sorted = [...data].sort((a, b) => {
    if (sortBy === 'amount') {
      return a.amount - b.amount;
    }

    if (sortBy === 'merchant') {
      return a.merchant.localeCompare(b.merchant);
    }

    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
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

  const minAmount = parseOptionalNumber(url.searchParams.get('minAmount'));
  const maxAmount = parseOptionalNumber(url.searchParams.get('maxAmount'));

  const dateFrom = url.searchParams.get('dateFrom');
  const dateTo = url.searchParams.get('dateTo');

  const dateFromTimestamp = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null;
  const dateToTimestamp = dateTo ? new Date(`${dateTo}T23:59:59.999`).getTime() : null;

  return items.filter((operation) => {
    const createdAtTimestamp = new Date(operation.createdAt).getTime();

    const matchesSearch =
      search.length === 0 ||
      operation.merchant.toLowerCase().includes(search) ||
      operation.id.toLowerCase().includes(search);

    const matchesStatus = !status || operation.status === status;
    const matchesRiskLevel = !riskLevel || operation.riskLevel === riskLevel;
    const matchesPaymentMethod = !paymentMethod || operation.paymentMethod === paymentMethod;
    const matchesCountry = !country || operation.country === country;
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
      matchesMinAmount &&
      matchesMaxAmount &&
      matchesDateFrom &&
      matchesDateTo
    );
  });
}

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


export {
  applyCollaborationChange,
  applyLiveDetailMutation,
  applyLiveQueueMutation,
  applyStatusChange,
  buildRelatedOperations,
  filterOperations,
  sortOperations,
  toListItem,
};
