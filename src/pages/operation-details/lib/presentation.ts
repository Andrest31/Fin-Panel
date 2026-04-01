import { getSlaState } from '@/entities/operation/lib/decisioning';
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
  if (action.toLowerCase().includes('senior review') || action.toLowerCase().includes('manual')) {
    return 'warning.main';
  }
  return 'success.main';
}

export function formatRiskFactorContribution(factor: OperationRiskFactor) {
  return `+${factor.contribution}`;
}

export function formatWorkflowStage(status: OperationStatus) {
  if (status === 'new') return 'Incoming queue';
  if (status === 'flagged') return 'Escalated review';
  if (status === 'in_review') return 'Manual review';
  if (status === 'approved') return 'Resolved / approved';
  return 'Resolved / blocked';
}

export function formatSlaLabel(slaDeadline: string | null) {
  const slaState = getSlaState(slaDeadline);

  if (slaState === 'resolved') return 'SLA resolved';
  if (slaState === 'breached') return 'SLA breached';
  if (slaState === 'at_risk') return 'SLA at risk';
  return 'SLA healthy';
}

export function getSlaChipColor(slaDeadline: string | null) {
  const slaState = getSlaState(slaDeadline);

  if (slaState === 'breached') return 'error';
  if (slaState === 'at_risk') return 'warning';
  if (slaState === 'healthy') return 'success';
  return 'default';
}