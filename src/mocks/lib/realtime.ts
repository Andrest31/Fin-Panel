import type { OperationRecord, StoreState } from './types';
import { applyStatusChange } from './statusMutations';

const realtimeMerchantProfiles = [
  {
    merchant: 'Wildberries',
    city: 'Moscow',
    paymentMethod: 'card' as const,
    amountBase: 6840,
    amountStep: 530,
    riskScore: 81,
    flagReasons: ['velocity_spike', 'new_device'] as const,
    recommendedAction: 'Verify whether recent account takeover signals are present.',
    analystSummary: 'Marketplace payment entered the realtime queue after a burst of rapid retries.',
    riskFactors: [
      { code: 'velocity_spike' as const, label: 'Velocity spike', contribution: 24, value: 'Five payment attempts in the last 9 minutes' },
      { code: 'new_device' as const, label: 'New device', contribution: 18, value: 'Previously unseen mobile device fingerprint' },
      { code: 'amount_anomaly' as const, label: 'Amount anomaly', contribution: 15, value: '1.8x above the customer median for marketplace spend' },
    ],
  },
  {
    merchant: 'Ozon Travel',
    city: 'Saint Petersburg',
    paymentMethod: 'sbp' as const,
    amountBase: 12990,
    amountStep: 790,
    riskScore: 66,
    flagReasons: ['travel_pattern', 'geo_mismatch'] as const,
    recommendedAction: 'Check whether the travel booking aligns with the customer geolocation history.',
    analystSummary: 'Travel booking triggered cross-region risk heuristics in the live stream.',
    riskFactors: [
      { code: 'travel_pattern' as const, label: 'Travel pattern', contribution: 19, value: 'Cross-region booking with same-day departure window' },
      { code: 'geo_mismatch' as const, label: 'Geo mismatch', contribution: 17, value: 'Booking initiated from a city not seen in the last 60 days' },
      { code: 'amount_anomaly' as const, label: 'Amount anomaly', contribution: 12, value: '2.0x above the usual travel spend bucket' },
    ],
  },
  {
    merchant: 'M.Video',
    city: 'Yekaterinburg',
    paymentMethod: 'card' as const,
    amountBase: 22490,
    amountStep: 1100,
    riskScore: 84,
    flagReasons: ['amount_anomaly', 'new_device'] as const,
    recommendedAction: 'Hold for analyst review and compare with recent device activity.',
    analystSummary: 'High-ticket electronics purchase appeared with a fresh device fingerprint.',
    riskFactors: [
      { code: 'amount_anomaly' as const, label: 'Amount anomaly', contribution: 23, value: '2.7x above the baseline for this customer segment' },
      { code: 'new_device' as const, label: 'New device', contribution: 20, value: 'Device fingerprint has not been seen before for this customer' },
      { code: 'merchant_pattern' as const, label: 'Merchant pattern', contribution: 14, value: 'Merchant category has elevated manual review frequency' },
    ],
  },
  {
    merchant: 'Yandex Go',
    city: 'Kazan',
    paymentMethod: 'sbp' as const,
    amountBase: 1790,
    amountStep: 140,
    riskScore: 62,
    flagReasons: ['ip_reputation', 'velocity_spike'] as const,
    recommendedAction: 'Confirm whether the IP reputation issue is linked to a shared network.',
    analystSummary: 'Transport payment was added to the queue after network reputation and burst checks.',
    riskFactors: [
      { code: 'ip_reputation' as const, label: 'IP reputation', contribution: 21, value: 'IP linked to recent suspicious checkout attempts' },
      { code: 'velocity_spike' as const, label: 'Velocity spike', contribution: 16, value: 'Multiple ride payments initiated in a short interval' },
      { code: 'mcc_anomaly' as const, label: 'MCC anomaly', contribution: 10, value: 'Transport MCC is uncommon for this customer profile' },
    ],
  },
] as const;

function createRealtimeOperation(sequence: number): OperationRecord {
  const now = new Date();
  const createdAt = now.toISOString();
  const profile = realtimeMerchantProfiles[sequence % realtimeMerchantProfiles.length];
  const riskScore = Math.min(99, profile.riskScore + (sequence % 4));

  return {
    id: `op_live_${sequence}`,
    merchant: profile.merchant,
    amount: profile.amountBase + (sequence % 7) * profile.amountStep,
    currency: 'RUB',
    status: sequence % 3 === 0 ? 'flagged' : 'new',
    riskLevel: riskScore >= 75 ? 'high' : 'medium',
    riskScore,
    riskFactors: profile.riskFactors.map((factor) => ({ ...factor })),
    createdAt,
    updatedAt: createdAt,
    customerId: `cus_live_${(sequence % 48) + 1}`,
    paymentMethod: profile.paymentMethod,
    country: 'RU',
    city: profile.city,
    deviceId: `dev_live_${(sequence % 18) + 1}`,
    ipAddress: `172.18.${sequence % 100}.${(sequence % 200) + 20}`,
    reviewer: null,
    flagReasons: [...profile.flagReasons],
    recommendedAction: profile.recommendedAction,
    analystSummary: profile.analystSummary,
    assignee: null,
    queue: 'manual_review',
    priority: riskScore >= 80 ? 'critical' : 'high',
    slaDeadline: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
    collaborationNotes: [],
    history: [
      { id: `evt_live_${sequence}_1`, type: 'created', timestamp: createdAt, actor: 'system', comment: 'Operation created by realtime monitoring stream' },
      {
        id: `evt_live_${sequence}_2`,
        type: 'risk_scored',
        timestamp: createdAt,
        actor: 'system',
        comment: 'Risk score recalculated from incoming monitoring signals',
        changes: [
          { field: 'riskScore', before: null, after: String(riskScore) },
          { field: 'riskLevel', before: null, after: riskScore >= 75 ? 'high' : 'medium' },
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
