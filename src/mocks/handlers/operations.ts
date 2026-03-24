import { http, HttpResponse, delay } from 'msw';
import { operationsMock } from '@/entities/operation/model/mockData';

export const operationsHandlers = [
  http.get('/api/operations', async () => {
    await delay(600);

    return HttpResponse.json({
      items: operationsMock,
      total: operationsMock.length,
      refreshedAt: new Date().toISOString(),
    });
  }),
];
