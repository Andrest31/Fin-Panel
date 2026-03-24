export type MockScenario =
  | 'normal'
  | 'slow'
  | 'flaky'
  | 'rate_limit'
  | 'server_error';

const STORAGE_KEY = 'fin-panel:mock-scenario';

export function getMockScenario(): MockScenario {
  if (typeof window === 'undefined') {
    return 'normal';
  }

  const value = window.localStorage.getItem(STORAGE_KEY);

  if (
    value === 'normal' ||
    value === 'slow' ||
    value === 'flaky' ||
    value === 'rate_limit' ||
    value === 'server_error'
  ) {
    return value;
  }

  return 'normal';
}

export function setMockScenario(value: MockScenario) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, value);
}

export function isRetryableStatus(status: number) {
  return status === 429 || status >= 500;
}