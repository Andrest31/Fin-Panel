export type DecisionStatus = 'new' | 'in_review' | 'approved' | 'blocked' | 'flagged';
export type DecisionAction = Extract<DecisionStatus, 'in_review' | 'approved' | 'blocked' | 'flagged'>;
export type RiskLevel = 'low' | 'medium' | 'high';
export type CaseQueue = 'manual_review' | 'senior_review' | 'compliance' | 'customer_confirmation';
export type CasePriority = 'low' | 'medium' | 'high' | 'critical';

export type RiskFactorInput = {
  code: string;
  label: string;
  contribution: number;
  value: string;
};

type MutableDecisionOperation = {
  status: DecisionStatus;
  amount: number;
  paymentMethod: 'card' | 'sbp';
  riskFactors: RiskFactorInput[];
  riskScore: number;
  riskLevel: RiskLevel;
  flagReasons: string[];
  recommendedAction: string;
  queue: CaseQueue;
  priority: CasePriority;
  slaDeadline: string | null;
};

const ALLOWED_TRANSITIONS: Record<DecisionStatus, DecisionAction[]> = {
  new: ['in_review', 'approved', 'blocked', 'flagged'],
  flagged: ['in_review', 'approved', 'blocked'],
  in_review: ['approved', 'blocked', 'flagged'],
  approved: ['in_review', 'flagged'],
  blocked: ['in_review'],
};

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function calculateRiskScore(
  riskFactors: RiskFactorInput[],
  context: Pick<MutableDecisionOperation, 'amount' | 'paymentMethod'>,
) {
  const factorScore = riskFactors.reduce((sum, factor) => sum + factor.contribution, 0);

  const amountBoost =
    context.amount >= 50_000 ? 18 : context.amount >= 20_000 ? 10 : context.amount >= 10_000 ? 4 : 0;
  const paymentMethodBoost = context.paymentMethod === 'card' ? 4 : 0;

  return clampScore(factorScore + amountBoost + paymentMethodBoost);
}

export function getRiskLevelFromScore(score: number): RiskLevel {
  if (score >= 75) return 'high';
  if (score >= 45) return 'medium';
  return 'low';
}

export function getAvailableDecisionStatuses(status: DecisionStatus): DecisionAction[] {
  return ALLOWED_TRANSITIONS[status] ?? [];
}

export function assertAllowedStatusTransition(current: DecisionStatus, next: DecisionStatus) {
  if (current === next) {
    throw new Error(`Operation is already in status ${current}`);
  }

  const availableTransitions = getAvailableDecisionStatuses(current);

  if (!availableTransitions.includes(next as DecisionAction)) {
    throw new Error(`Transition ${current} → ${next} is not allowed by workflow rules`);
  }
}

export function buildExplainabilityItems(
  riskFactors: RiskFactorInput[],
  context: Pick<MutableDecisionOperation, 'amount' | 'paymentMethod'>,
) {
  const items = riskFactors
    .map((factor) => ({
      title: factor.label,
      description: factor.value,
      contribution: factor.contribution,
      code: factor.code,
    }))
    .sort((left, right) => right.contribution - left.contribution);

  if (context.amount >= 20_000) {
    items.push({
      title: 'Transaction amount',
      description:
        context.amount >= 50_000
          ? 'Very high amount for manual review'
          : 'Elevated amount compared with baseline',
      contribution: context.amount >= 50_000 ? 18 : 10,
      code: 'amount_boost',
    });
  }

  if (context.paymentMethod === 'card') {
    items.push({
      title: 'Card payment review',
      description: 'Card transactions get additional manual-review weight',
      contribution: 4,
      code: 'payment_method_boost',
    });
  }

  return items.sort((left, right) => right.contribution - left.contribution);
}

function deriveFlagReasons(riskFactors: RiskFactorInput[]) {
  return riskFactors
    .filter((factor) => factor.contribution >= 15)
    .sort((left, right) => right.contribution - left.contribution)
    .slice(0, 3)
    .map((factor) => factor.code);
}

function getQueueFromScore(score: number, status: DecisionStatus): CaseQueue {
  if (status === 'blocked') return 'compliance';
  if (status === 'approved') return 'manual_review';
  if (score >= 85 || status === 'flagged') return 'senior_review';
  if (score >= 45) return 'manual_review';
  return 'customer_confirmation';
}

function getPriorityFromScore(score: number, status: DecisionStatus): CasePriority {
  if (status === 'blocked') return 'critical';
  if (score >= 85) return 'critical';
  if (score >= 70 || status === 'flagged') return 'high';
  if (score >= 45) return 'medium';
  return 'low';
}

function getSlaDeadline(score: number, status: DecisionStatus, nowIso: string) {
  if (status === 'approved' || status === 'blocked') {
    return null;
  }

  const now = new Date(nowIso).getTime();
  const timeoutMs =
    score >= 85 || status === 'flagged'
      ? 30 * 60 * 1000
      : score >= 70
        ? 60 * 60 * 1000
        : score >= 45
          ? 2 * 60 * 60 * 1000
          : 6 * 60 * 60 * 1000;

  return new Date(now + timeoutMs).toISOString();
}

export function getRecommendedAction(
  score: number,
  status: DecisionStatus,
  explainabilityItems: Array<{ title: string; contribution: number }>,
) {
  const dominantSignals = explainabilityItems.slice(0, 2).map((item) => item.title.toLowerCase());

  if (status === 'blocked') {
    return 'Operation blocked. Preserve evidence and watch related activity.';
  }

  if (status === 'approved') {
    return 'Approved after review. Keep passive monitoring for related operations.';
  }

  if (score >= 85) {
    return `Escalate immediately and prepare block decision. Focus on ${dominantSignals.join(
      ' and ',
    )}.`;
  }

  if (score >= 70 || status === 'flagged') {
    return `Keep case in senior review. Validate ${dominantSignals.join(
      ' and ',
    )} before approval.`;
  }

  if (score >= 45) {
    return `Continue manual review and verify ${dominantSignals.join(' and ')}.`;
  }

  return 'Low-risk case. Approve if customer history and payment context look consistent.';
}

export function syncDerivedOperationFields<T extends MutableDecisionOperation>(
  operation: T,
  options?: { now?: string },
) {
  const now = options?.now ?? new Date().toISOString();
  const explainabilityItems = buildExplainabilityItems(operation.riskFactors, operation);
  const riskScore = calculateRiskScore(operation.riskFactors, operation);

  operation.riskScore = riskScore;
  operation.riskLevel = getRiskLevelFromScore(riskScore);
  operation.flagReasons = deriveFlagReasons(operation.riskFactors);
  operation.priority = getPriorityFromScore(riskScore, operation.status);
  operation.queue = getQueueFromScore(riskScore, operation.status);
  operation.slaDeadline = getSlaDeadline(riskScore, operation.status, now);
  operation.recommendedAction = getRecommendedAction(riskScore, operation.status, explainabilityItems);

  return operation;
}

export function getSlaState(slaDeadline: string | null) {
  if (!slaDeadline) return 'resolved' as const;

  const diffMs = new Date(slaDeadline).getTime() - Date.now();

  if (diffMs <= 0) return 'breached' as const;
  if (diffMs <= 30 * 60 * 1000) return 'at_risk' as const;
  return 'healthy' as const;
}