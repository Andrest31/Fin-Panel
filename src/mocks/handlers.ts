import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/operations', async () => {
    return HttpResponse.json([
      {
        id: 'op_001',
        merchant: 'TechMarket',
        amount: 12500,
        currency: 'RUB',
        status: 'new',
        riskLevel: 'high',
        createdAt: '2026-03-24T10:15:00.000Z',
      },
      {
        id: 'op_002',
        merchant: 'Daily Coffee',
        amount: 420,
        currency: 'RUB',
        status: 'approved',
        riskLevel: 'low',
        createdAt: '2026-03-24T10:18:00.000Z',
      },
      {
        id: 'op_003',
        merchant: 'Fast Electronics',
        amount: 18990,
        currency: 'RUB',
        status: 'in_review',
        riskLevel: 'medium',
        createdAt: '2026-03-24T10:21:00.000Z',
      },
    ]);
  }),
];