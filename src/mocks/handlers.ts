import { http, HttpResponse } from 'msw';

type OperationStatus = 'new' | 'in_review' | 'approved' | 'blocked' | 'flagged';
type OperationRiskLevel = 'low' | 'medium' | 'high';
type OperationsSortBy = 'createdAt' | 'amount' | 'merchant';
type SortOrder = 'asc' | 'desc';
type PaymentMethod = 'card' | 'sbp';

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
  riskLevel: OperationRiskLevel;
  createdAt: string;
  updatedAt: string;
  customerId: string;
  paymentMethod: PaymentMethod;
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
  {
    id: 'op_004',
    merchant: 'Luxury Store',
    amount: 84500,
    currency: 'RUB',
    status: 'flagged',
    riskLevel: 'high',
    createdAt: '2026-03-24T10:26:00.000Z',
    updatedAt: '2026-03-24T10:29:00.000Z',
    customerId: 'cus_1004',
    paymentMethod: 'card',
    country: 'RU',
    city: 'Moscow',
    deviceId: 'dev_9004',
    ipAddress: '84.52.141.10',
    reviewer: null,
    flagReasons: ['mcc_anomaly', 'large_amount'],
    history: [
      {
        id: 'evt_007',
        type: 'created',
        timestamp: '2026-03-24T10:26:00.000Z',
        actor: 'system',
        comment: 'Operation created',
      },
      {
        id: 'evt_008',
        type: 'flagged',
        timestamp: '2026-03-24T10:27:00.000Z',
        actor: 'system',
        comment: 'Operation flagged by rule engine',
        reason: 'mcc_anomaly',
      },
    ],
  },
  {
    id: 'op_005',
    merchant: 'Travel Booking',
    amount: 22990,
    currency: 'RUB',
    status: 'new',
    riskLevel: 'medium',
    createdAt: '2026-03-24T10:30:00.000Z',
    updatedAt: '2026-03-24T10:31:00.000Z',
    customerId: 'cus_1005',
    paymentMethod: 'card',
    country: 'RU',
    city: 'Novosibirsk',
    deviceId: 'dev_9005',
    ipAddress: '176.15.11.90',
    reviewer: null,
    flagReasons: ['travel_pattern'],
    history: [
      {
        id: 'evt_009',
        type: 'created',
        timestamp: '2026-03-24T10:30:00.000Z',
        actor: 'system',
        comment: 'Operation created',
      },
    ],
  },
  {
    id: 'op_006',
    merchant: 'Fuel Station',
    amount: 3100,
    currency: 'RUB',
    status: 'approved',
    riskLevel: 'low',
    createdAt: '2026-03-24T10:33:00.000Z',
    updatedAt: '2026-03-24T10:34:00.000Z',
    customerId: 'cus_1006',
    paymentMethod: 'card',
    country: 'RU',
    city: 'Ekaterinburg',
    deviceId: 'dev_9006',
    ipAddress: '213.87.51.14',
    reviewer: 'analyst_03',
    flagReasons: [],
    history: [
      {
        id: 'evt_010',
        type: 'created',
        timestamp: '2026-03-24T10:33:00.000Z',
        actor: 'system',
        comment: 'Operation created',
      },
      {
        id: 'evt_011',
        type: 'approved',
        timestamp: '2026-03-24T10:34:00.000Z',
        actor: 'analyst_03',
        comment: 'Known low-risk pattern',
        reason: 'known_customer',
      },
    ],
  },
  {
    id: 'op_007',
    merchant: 'Online Casino',
    amount: 15400,
    currency: 'RUB',
    status: 'blocked',
    riskLevel: 'high',
    createdAt: '2026-03-24T10:36:00.000Z',
    updatedAt: '2026-03-24T10:37:00.000Z',
    customerId: 'cus_1007',
    paymentMethod: 'sbp',
    country: 'RU',
    city: 'Rostov-on-Don',
    deviceId: 'dev_9007',
    ipAddress: '109.126.80.77',
    reviewer: 'analyst_04',
    flagReasons: ['high_risk_merchant', 'velocity_spike'],
    history: [
      {
        id: 'evt_012',
        type: 'created',
        timestamp: '2026-03-24T10:36:00.000Z',
        actor: 'system',
        comment: 'Operation created',
      },
      {
        id: 'evt_013',
        type: 'blocked',
        timestamp: '2026-03-24T10:37:00.000Z',
        actor: 'analyst_04',
        comment: 'Blocked due to fraud indicators',
        reason: 'stolen_card_signal',
      },
    ],
  },
  {
    id: 'op_008',
    merchant: 'Marketplace',
    amount: 7800,
    currency: 'RUB',
    status: 'in_review',
    riskLevel: 'medium',
    createdAt: '2026-03-24T10:39:00.000Z',
    updatedAt: '2026-03-24T10:41:00.000Z',
    customerId: 'cus_1008',
    paymentMethod: 'card',
    country: 'RU',
    city: 'Samara',
    deviceId: 'dev_9008',
    ipAddress: '46.0.201.44',
    reviewer: 'analyst_02',
    flagReasons: ['new_device'],
    history: [
      {
        id: 'evt_014',
        type: 'created',
        timestamp: '2026-03-24T10:39:00.000Z',
        actor: 'system',
        comment: 'Operation created',
      },
      {
        id: 'evt_015',
        type: 'sent_to_review',
        timestamp: '2026-03-24T10:41:00.000Z',
        actor: 'system',
        comment: 'Review requested',
        reason: 'new_device',
      },
    ],
  },
  {
    id: 'op_009',
    merchant: 'Food Delivery',
    amount: 1290,
    currency: 'RUB',
    status: 'approved',
    riskLevel: 'low',
    createdAt: '2026-03-24T10:42:00.000Z',
    updatedAt: '2026-03-24T10:43:00.000Z',
    customerId: 'cus_1009',
    paymentMethod: 'sbp',
    country: 'RU',
    city: 'Moscow',
    deviceId: 'dev_9009',
    ipAddress: '81.19.132.15',
    reviewer: 'analyst_01',
    flagReasons: [],
    history: [
      {
        id: 'evt_016',
        type: 'created',
        timestamp: '2026-03-24T10:42:00.000Z',
        actor: 'system',
        comment: 'Operation created',
      },
    ],
  },
  {
    id: 'op_010',
    merchant: 'Gaming Store',
    amount: 9400,
    currency: 'RUB',
    status: 'new',
    riskLevel: 'medium',
    createdAt: '2026-03-24T10:45:00.000Z',
    updatedAt: '2026-03-24T10:46:00.000Z',
    customerId: 'cus_1010',
    paymentMethod: 'card',
    country: 'RU',
    city: 'Perm',
    deviceId: 'dev_9010',
    ipAddress: '185.22.64.11',
    reviewer: null,
    flagReasons: ['merchant_pattern'],
    history: [
      {
        id: 'evt_017',
        type: 'created',
        timestamp: '2026-03-24T10:45:00.000Z',
        actor: 'system',
        comment: 'Operation created',
      },
    ],
  },
  {
    id: 'op_011',
    merchant: 'ElectroHub',
    amount: 38990,
    currency: 'RUB',
    status: 'flagged',
    riskLevel: 'high',
    createdAt: '2026-03-24T10:47:00.000Z',
    updatedAt: '2026-03-24T10:48:00.000Z',
    customerId: 'cus_1011',
    paymentMethod: 'card',
    country: 'RU',
    city: 'Krasnodar',
    deviceId: 'dev_9011',
    ipAddress: '92.63.72.201',
    reviewer: null,
    flagReasons: ['large_amount', 'ip_reputation'],
    history: [
      {
        id: 'evt_018',
        type: 'created',
        timestamp: '2026-03-24T10:47:00.000Z',
        actor: 'system',
        comment: 'Operation created',
      },
    ],
  },
  {
    id: 'op_012',
    merchant: 'Taxi Service',
    amount: 890,
    currency: 'RUB',
    status: 'approved',
    riskLevel: 'low',
    createdAt: '2026-03-24T10:49:00.000Z',
    updatedAt: '2026-03-24T10:50:00.000Z',
    customerId: 'cus_1012',
    paymentMethod: 'card',
    country: 'RU',
    city: 'Voronezh',
    deviceId: 'dev_9012',
    ipAddress: '193.33.88.41',
    reviewer: 'analyst_02',
    flagReasons: [],
    history: [
      {
        id: 'evt_019',
        type: 'created',
        timestamp: '2026-03-24T10:49:00.000Z',
        actor: 'system',
        comment: 'Operation created',
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

function filterOperations(url: URL): OperationRecord[] {
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

  return operations.filter((operation) => {
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

export const handlers = [
  http.get('/api/operations', async ({ request }) => {
    const url = new URL(request.url);

    const rawPage = Number(url.searchParams.get('page') ?? '1');
    const rawPageSize = Number(url.searchParams.get('pageSize') ?? '10');
    const sortBy = (url.searchParams.get('sortBy') as OperationsSortBy | null) ?? 'createdAt';
    const order = (url.searchParams.get('order') as SortOrder | null) ?? 'desc';

    const page = Number.isNaN(rawPage) ? 1 : Math.max(1, rawPage);
    const pageSize = Number.isNaN(rawPageSize) ? 10 : Math.min(100, Math.max(1, rawPageSize));

    const filtered = filterOperations(url);
    const sorted = sortOperations(filtered, sortBy, order);

    const startIndex = (page - 1) * pageSize;
    const paginatedItems = sorted.slice(startIndex, startIndex + pageSize);

    return HttpResponse.json({
      items: paginatedItems.map(toListItem),
      total: sorted.length,
      page,
      pageSize,
      refreshedAt: new Date().toISOString(),
    });
  }),

  http.get('/api/operations/:id', async ({ params }) => {
    const operation = operations.find((item) => item.id === params.id);

    if (!operation) {
      return HttpResponse.json({ message: 'Operation not found' }, { status: 404 });
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

    if (!body.ids?.length) {
      return HttpResponse.json({ message: 'Ids are required' }, { status: 400 });
    }

    if (!body.status) {
      return HttpResponse.json({ message: 'Status is required' }, { status: 400 });
    }

    const updatedIds: string[] = [];

    body.ids.forEach((id) => {
      const operation = operations.find((item) => item.id === id);

      if (!operation) return;

      applyStatusChange(operation, body.status!, body.reason, body.comment);
      updatedIds.push(id);
    });

    return HttpResponse.json({
      updatedIds,
      status: body.status,
    });
  }),
];