import { approvedOperations } from './approved';
import { coreOperations } from './core';
import { highRiskOperations } from './highRisk';

export const baseOperations = [
  ...coreOperations,
  ...highRiskOperations,
  ...approvedOperations,
];
