import { delay, HttpResponse } from 'msw';
import type { MockDataVolume, MockScenario } from './types';

function getScenario(request: Request): MockScenario {
  const scenario = request.headers.get('x-mock-scenario');

  if (
    scenario === 'normal' ||
    scenario === 'slow' ||
    scenario === 'flaky' ||
    scenario === 'rate_limit' ||
    scenario === 'server_error' ||
    scenario === 'conflict'
  ) {
    return scenario;
  }

  return 'normal';
}

function getVolume(request: Request): MockDataVolume {
  const volume = request.headers.get('x-mock-volume');

  if (volume === 'small' || volume === 'medium' || volume === 'large' || volume === 'xlarge') {
    return volume;
  }

  return 'medium';
}

async function maybeApplyScenario(request: Request) {
  const scenario = getScenario(request);

  if (scenario === 'slow') {
    await delay(1200);
  }

  if (scenario === 'rate_limit') {
    return HttpResponse.json({ message: 'Rate limit exceeded' }, { status: 429 });
  }

  if (scenario === 'server_error') {
    return HttpResponse.json({ message: 'Internal server error' }, { status: 500 });
  }

  if (scenario === 'flaky' && Math.random() < 0.35) {
    return HttpResponse.json({ message: 'Temporary mock API failure' }, { status: 503 });
  }

  return null;
}


export { getScenario, getVolume, maybeApplyScenario };
