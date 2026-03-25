import type { MockDataVolume } from './types';
import { baseOperations } from '../fixtures/baseOperations';

const volumeCounts: Record<MockDataVolume, number> = {
  small: 25,
  medium: 250,
  large: 2500,
  xlarge: 10000,
};

export { baseOperations, volumeCounts };
