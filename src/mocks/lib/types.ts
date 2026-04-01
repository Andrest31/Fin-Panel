export type MockDataVolume = 'small' | 'medium' | 'large' | 'xlarge';
export type MockScenario =
  | 'normal'
  | 'slow'
  | 'flaky'
  | 'rate_limit'
  | 'server_error'
  | 'conflict'
  | 'error'
  | 'empty'
  | 'default';

export type OperationStatus = 'new' | 'in_review' | 'approved' | 'blocked' | 'flagged';
export type OperationRiskLevel = 'low' | 'medium' | 'high';
export type PaymentMethod = 'card' | 'sbp';

export type RiskFactorCode =
  | 'velocity_spike'
  | 'new_device'
  | 'geo_mismatch'
  | 'high_risk_merchant'
  | 'ip_reputation'
  | 'amount_anomaly'
  | 'merchant_pattern'
  | 'travel_pattern'
  | 'mcc_anomaly';

export type CollaboratorRole =
  | 'fraud_analyst'
  | 'senior_analyst'
  | 'compliance'
  | 'support';

export type CaseQueue =
  | 'manual_review'
  | 'senior_review'
  | 'compliance'
  | 'customer_confirmation';

export type CasePriority = 'low' | 'medium' | 'high' | 'critical';
export type SlaState = 'healthy' | 'at_risk' | 'breached' | 'resolved';

export type OperationsSortBy =
  | 'createdAt'
  | 'amount'
  | 'merchant'
  | 'riskScore'
  | 'priority'
  | 'slaDeadline';

export type SortOrder = 'asc' | 'desc';

export type OperationRiskFactor = {
  code: RiskFactorCode;
  label: string;
  contribution: number;
  value: string;
};

export type OperationHistoryChange = {
  field: string;
  before: string | null;
  after: string | null;
};

export type OperationHistoryEvent = {
  id: string;
  type: string;
  timestamp: string;
  actor: string;
  comment: string;
  reason?: string;
  changes?: OperationHistoryChange[];
};

export type RelatedOperation = {
  id: string;
  merchant: string;
  amount: number;
  currency: string;
  status: OperationStatus;
  riskLevel: OperationRiskLevel;
  createdAt: string;
  relation: string;
};

export type CaseAssignee = {
  id: string;
  name: string;
  role: CollaboratorRole;
};

export type CollaborationNote = {
  id: string;
  author: string;
  role: CollaboratorRole;
  createdAt: string;
  text: string;
};

export type OperationRecord = {
  id: string;
  merchant: string;
  amount: number;
  currency: string;
  status: OperationStatus;
  riskLevel: OperationRiskLevel;
  riskScore: number;
  createdAt: string;
  updatedAt: string;
  customerId: string;
  paymentMethod: PaymentMethod;
  country: string;
  city: string;
  deviceId: string;
  ipAddress: string;
  reviewer: string | null;
  flagReasons: string[];
  queue: CaseQueue;
  priority: CasePriority;
  slaDeadline: string | null;
  riskFactors: OperationRiskFactor[];
  history: OperationHistoryEvent[];
  recommendedAction: string;
  analystSummary: string;
  assignee: CaseAssignee | null;
  collaborationNotes: CollaborationNote[];

  /**
   * Не делаем обязательным:
   * старые fixtures и realtime-генераторы его не содержат,
   * а related operations строятся динамически в handlers.
   */
  relatedOperations?: RelatedOperation[];
};

export type StoreState = {
  operations: OperationRecord[];
  lastMutationAt: number;
  lastDetailMutationAtById: Record<string, number>;
  nextRealtimeId: number;
};

export type StatusUpdateRequest = {
  status: OperationStatus;
  reason?: string;
  comment?: string;
};

export type CollaborationAction = 'assign' | 'escalate' | 'add_note';

export type CollaborationUpdateRequest = {
  action: CollaborationAction;
  assigneeId?: string;
  assigneeName?: string;
  assigneeRole?: CollaboratorRole;
  queue?: CaseQueue;
  priority?: CasePriority;
  reason: string;
  note: string;
};