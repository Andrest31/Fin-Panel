import type {
  OperationRiskFactor,
  OperationRiskLevel,
  OperationStatus,
} from '@/entities/operation/api/getOperations';

export function getRiskColor(riskLevel: OperationRiskLevel) {
  if (riskLevel === 'high') return 'error';
  if (riskLevel === 'medium') return 'warning';
  return 'success';
}

export function getStatusColor(status: OperationStatus) {
  if (status === 'approved') return 'success';
  if (status === 'blocked' || status === 'flagged') return 'error';
  if (status === 'in_review') return 'warning';
  return 'default';
}

export function getPriorityColor(priority: 'low' | 'medium' | 'high' | 'critical') {
  if (priority === 'critical') return 'error';
  if (priority === 'high') return 'warning';
  if (priority === 'medium') return 'info';
  return 'default';
}

export function getRecommendedActionColor(action: string) {
  if (action.toLowerCase().includes('block')) return 'error.main';
  if (action.toLowerCase().includes('manual')) return 'warning.main';
  return 'success.main';
}

export function formatRiskFactorContribution(factor: OperationRiskFactor) {
  return `+${factor.contribution}`;
}
