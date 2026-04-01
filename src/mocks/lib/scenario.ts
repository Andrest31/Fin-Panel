import { delay, HttpResponse } from 'msw';
import type { MockDataVolume, MockScenario } from './types';

const DEFAULT_DELAY_MS = 350;
const SLOW_DELAY_MS = 1800;

export function getScenario(request: Request): MockScenario {
  const url = new URL(request.url);
  const scenario = url.searchParams.get('scenario');

  if (
    scenario === 'normal' ||
    scenario === 'slow' ||
    scenario === 'flaky' ||
    scenario === 'rate_limit' ||
    scenario === 'server_error' ||
    scenario === 'conflict' ||
    scenario === 'error' ||
    scenario === 'empty' ||
    scenario === 'default'
  ) {
    return scenario;
  }

  return 'normal';
}

export function getVolume(request: Request): MockDataVolume {
  const url = new URL(request.url);
  const volume = url.searchParams.get('volume');

  if (volume === 'small' || volume === 'medium' || volume === 'large' || volume === 'xlarge') {
    return volume;
  }

  return 'medium';
}

export async function maybeApplyScenario(request: Request) {
  const scenario = getScenario(request);

  if (scenario === 'slow') {
    await delay(SLOW_DELAY_MS);
    return null;
  }

  if (scenario === 'rate_limit') {
    await delay(DEFAULT_DELAY_MS);
    return HttpResponse.json({ message: 'Too many requests' }, { status: 429 });
  }

  if (scenario === 'server_error' || scenario === 'error') {
    await delay(DEFAULT_DELAY_MS);
    return HttpResponse.json({ message: 'Internal server error' }, { status: 500 });
  }

  if (scenario === 'flaky' && Math.random() < 0.35) {
    await delay(DEFAULT_DELAY_MS);
    return HttpResponse.json({ message: 'Temporary upstream error' }, { status: 503 });
  }

  if (scenario === 'empty') {
    await delay(DEFAULT_DELAY_MS);
    return HttpResponse.json({
      items: [],
      total: 0,
      page: 1,
      pageSize: 10,
      refreshedAt: new Date().toISOString(),
    });
  }

  await delay(DEFAULT_DELAY_MS);
  return null;
}