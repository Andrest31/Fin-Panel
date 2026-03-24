import { http, HttpResponse } from 'msw';

type OperationStatus = 'new' | 'in_review' | 'approved' | 'blocked' | 'flagged';

type OperationHistoryEvent = {
  id: string;
  type: string;
  timestamp: string;
  actor: string;
  comment: string;
  reason?: string;
};

type OperationRecord = {
  id: string;
  merchant: string;
  amount: number;
  currency: string;
  status: OperationStatus;
  riskLevel: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  customerId: string;
  paymentMethod: string;
  country: string;
  city: string;
  deviceId: string;
  ipAddress: string;
  reviewer: string | null;
  flagReasons: string[];
  history: OperationHistoryEvent[];
};

type StatusUpdateRequest = {
  status?: OperationStatus;
  reason?: string;
  comment?: string;
};

const operations: OperationRecord[] = [
  {
    id: 'op_001',
    merchant: 'TechMarket',
    amount: 12500,
    currency: 'RUB',
    status: 'new',
    riskLevel: 'high',
    createdAt: '2026-03-24T10:15:00.000Z',
    updatedAt: '2026-03-24T10:20:00.000Z',
    customerId: 'cus_1001',
    paymentMethod: 'card',
    country: 'RU',
    city: 'Moscow',
    deviceId: 'dev_9001',
    ipAddress: '91.240.12.11',
    reviewer: null,
    flagReasons: ['large_amount', 'new_device', 'velocity_spike'],
    history: [
      {
        id: 'evt_001',
        type: 'created',
        timestamp: '2026-03-24T10:15:00.000Z',
        actor: 'system',
        comment: 'Operation created and sent to queue',
      },
      {
        id: 'evt_002',
        type: 'risk_scored',
        timestamp: '2026-03-24T10:16:30.000Z',
        actor: 'system',
        comment: 'Risk level set to high',
      },
    ],
  },
  {
    id: 'op_002',
    merchant: 'Daily Coffee',
    amount: 420,
    currency: 'RUB',
    status: 'approved',
    riskLevel: 'low',
    createdAt: '2026-03-24T10:18:00.000Z',
    updatedAt: '2026-03-24T10:19:00.000Z',
    customerId: 'cus_1002',
    paymentMethod: 'card',
    country: 'RU',
    city: 'Saint Petersburg',
    deviceId: 'dev_9002',
    ipAddress: '95.82.44.23',
    reviewer: 'analyst_01',
    flagReasons: [],
    history: [
      {
        id: 'evt_003',
        type: 'created',
        timestamp: '2026-03-24T10:18:00.000Z',
        actor: 'system',
        comment: 'Operation created',
      },
      {
        id: 'evt_004',
        type: 'approved',
        timestamp: '2026-03-24T10:19:00.000Z',
        actor: 'analyst_01',
        comment: 'No suspicious signals found',
        reason: 'trusted_pattern',
      },
    ],
  },
  {
    id: 'op_003',
    merchant: 'Fast Electronics',
    amount: 18990,
    currency: 'RUB',
    status: 'in_review',
    riskLevel: 'medium',
    createdAt: '2026-03-24T10:21:00.000Z',
    updatedAt: '2026-03-24T10:25:00.000Z',
    customerId: 'cus_1003',
    paymentMethod: 'sbp',
    country: 'RU',
    city: 'Kazan',
    deviceId: 'dev_9003',
    ipAddress: '178.45.201.8',
    reviewer: 'analyst_02',
    flagReasons: ['merchant_pattern'],
    history: [
      {
        id: 'evt_005',
        type: 'created',
        timestamp: '2026-03-24T10:21:00.000Z',
        actor: 'system',
        comment: 'Operation created',
      },
      {
        id: 'evt_006',
        type: 'sent_to_review',
        timestamp: '2026-03-24T10:25:00.000Z',
        actor: 'system',
        comment: 'Sent to analyst review',
        reason: 'merchant_pattern',
      },
    ],
  },
];

function toListItem(operation: OperationRecord) {
  return {
    id: operation.id,
    merchant: operation.merchant,
    amount: operation.amount,
    currency: operation.currency,
    status: operation.status,
    riskLevel: operation.riskLevel,
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
) {
  const now = new Date().toISOString();
  const actionMeta = getActionMeta(nextStatus);

  operation.status = nextStatus;
  operation.updatedAt = now;
  operation.reviewer = actionMeta.reviewer;
  operation.history.unshift({
    id: `evt_${Date.now()}_${operation.id}`,
    type: actionMeta.eventType,
    timestamp: now,
    actor: actionMeta.reviewer,
    comment: comment?.trim() || actionMeta.defaultComment,
    reason: reason?.trim() || undefined,
  });
}

export const handlers = [
  http.get('/api/operations', async () => {
    return HttpResponse.json(operations.map(toListItem));
  }),

  http.get('/api/operations/:id', async ({ params }) => {
    const operation = operations.find((item) => item.id === params.id);

    if (!operation) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(operation);
  }),

  http.patch('/api/operations/:id/status', async ({ params, request }) => {
    const operation = operations.find((item) => item.id === params.id);

    if (!operation) {
      return HttpResponse.json({ message: 'Operation not found' }, { status: 404 });
    }

    const body = (await request.json()) as StatusUpdateRequest;
    const nextStatus = body.status;

    if (!nextStatus) {
      return HttpResponse.json({ message: 'Status is required' }, { status: 400 });
    }

    applyStatusChange(operation, nextStatus, body.reason, body.comment);

    return HttpResponse.json(operation);
  }),

  http.patch('/api/operations/bulk-status', async ({ request }) => {
    const body = (await request.json()) as {
      ids?: string[];
      status?: OperationStatus;
      reason?: string;
      comment?: string;
    };

    if (!Array.isArray(body.ids) || body.ids.length === 0) {
      return HttpResponse.json({ message: 'ids are required' }, { status: 400 });
    }

    if (!body.status) {
      return HttpResponse.json({ message: 'status is required' }, { status: 400 });
    }

    const updatedIds = new Set(body.ids);

    operations.forEach((operation) => {
      if (updatedIds.has(operation.id)) {
        applyStatusChange(operation, body.status as OperationStatus, body.reason, body.comment);
      }
    });

    return HttpResponse.json({
      updatedIds: body.ids,
      status: body.status,
    });
  }),
];