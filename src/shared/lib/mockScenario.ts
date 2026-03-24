export type MockScenario =
  | 'normal'
  | 'slow'
  | 'flaky'
  | 'rate_limit'
  | 'server_error'
  | 'conflict';

export type MockDataVolume = 'small' | 'medium' | 'large' | 'xlarge';

const SCENARIO_STORAGE_KEY = 'fin-panel:mock-scenario';
const VOLUME_STORAGE_KEY = 'fin-panel:mock-volume';

export function getMockScenario(): MockScenario {
  if (typeof window === 'undefined') {
    return 'normal';
  }

  const value = window.localStorage.getItem(SCENARIO_STORAGE_KEY);

  if (
    value === 'normal' ||
    value === 'slow' ||
    value === 'flaky' ||
    value === 'rate_limit' ||
    value === 'server_error' ||
    value === 'conflict'
  ) {
    return value;
  }

  return 'normal';
}

export function setMockScenario(value: MockScenario) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(SCENARIO_STORAGE_KEY, value);
}

export function getMockDataVolume(): MockDataVolume {
  if (typeof window === 'undefined') {
    return 'medium';
  }

  const value = window.localStorage.getItem(VOLUME_STORAGE_KEY);

  if (
    value === 'small' ||
    value === 'medium' ||
    value === 'large' ||
    value === 'xlarge'
  ) {
    return value;
  }

  return 'medium';
}

export function setMockDataVolume(value: MockDataVolume) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(VOLUME_STORAGE_KEY, value);
}

export function getMockDataVolumeLabel(value: MockDataVolume) {
  switch (value) {
    case 'small':
      return '25 rows';
    case 'medium':
      return '250 rows';
    case 'large':
      return '2 500 rows';
    case 'xlarge':
      return '10 000 rows';
    default:
      return value;
  }
}

export function isRetryableStatus(status: number) {
  return status === 409 || status === 429 || status >= 500;
}