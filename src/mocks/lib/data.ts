import { approvedOperations } from '../fixtures/baseOperations/approved';
import { coreOperations } from '../fixtures/baseOperations/core';
import { highRiskOperations } from '../fixtures/baseOperations/highRisk';
import type { MockDataVolume, OperationRecord } from './types';

export const baseOperations: OperationRecord[] = [
  ...highRiskOperations,
  ...approvedOperations,
  ...coreOperations,
];

export const volumeCounts: Record<MockDataVolume, number> = {
  small: 25,
  medium: 150,
  large: 1000,
  xlarge: 10000,
};