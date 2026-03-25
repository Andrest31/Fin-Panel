import type { OperationRecord, StoreState } from './types';
import { applyStatusChange } from './statusMutations';

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

export { applyLiveDetailMutation, applyLiveQueueMutation };
