import { z } from 'zod';

export const operationStatusSchema = z.enum([
  'new',
  'in_review',
  'approved',
  'blocked',
  'flagged',
]);

export const operationRiskLevelSchema = z.enum(['low', 'medium', 'high']);

export const riskFactorCodeSchema = z.enum([
  'velocity_spike',
  'new_device',
  'geo_mismatch',
  'high_risk_merchant',
  'ip_reputation',
  'amount_anomaly',
  'merchant_pattern',
  'travel_pattern',
  'mcc_anomaly',
]);

export const collaboratorRoleSchema = z.enum([
  'fraud_analyst',
  'senior_analyst',
  'compliance',
  'support',
]);

export const caseQueueSchema = z.enum([
  'manual_review',
  'senior_review',
  'compliance',
  'customer_confirmation',
]);

export const casePrioritySchema = z.enum(['low', 'medium', 'high', 'critical']);

export const operationRiskFactorSchema = z.object({
  code: riskFactorCodeSchema,
  label: z.string(),
  contribution: z.number(),
  value: z.string(),
});

export const operationListItemSchema = z.object({
  id: z.string(),
  merchant: z.string(),
  amount: z.number(),
  currency: z.string(),
  status: operationStatusSchema,
  riskLevel: operationRiskLevelSchema,
  riskScore: z.number().min(0).max(100),
  createdAt: z.string(),
  updatedAt: z.string(),
  customerId: z.string(),
  paymentMethod: z.enum(['card', 'sbp']),
  country: z.string(),
  city: z.string(),
  deviceId: z.string(),
  ipAddress: z.string(),
  reviewer: z.string().nullable(),
  flagReasons: z.array(z.string()),
});

export const operationHistoryChangeSchema = z.object({
  field: z.string(),
  before: z.string().nullable(),
  after: z.string().nullable(),
});

export const operationHistoryEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  timestamp: z.string(),
  actor: z.string(),
  comment: z.string(),
  reason: z.string().optional(),
  changes: z.array(operationHistoryChangeSchema).optional().default([]),
});

export const relatedOperationSchema = z.object({
  id: z.string(),
  merchant: z.string(),
  amount: z.number(),
  currency: z.string(),
  status: operationStatusSchema,
  riskLevel: operationRiskLevelSchema,
  createdAt: z.string(),
  relation: z.string(),
});

export const caseAssigneeSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: collaboratorRoleSchema,
});

export const collaborationNoteSchema = z.object({
  id: z.string(),
  author: z.string(),
  role: collaboratorRoleSchema,
  createdAt: z.string(),
  text: z.string(),
});

export const operationDetailsSchema = operationListItemSchema.extend({
  riskFactors: z.array(operationRiskFactorSchema),
  history: z.array(operationHistoryEventSchema),
  relatedOperations: z.array(relatedOperationSchema),
  recommendedAction: z.string(),
  analystSummary: z.string(),
  assignee: caseAssigneeSchema.nullable(),
  queue: caseQueueSchema,
  priority: casePrioritySchema,
  slaDeadline: z.string().nullable(),
  collaborationNotes: z.array(collaborationNoteSchema),
});

export const operationsSortBySchema = z.enum(['createdAt', 'amount', 'merchant']);
export const sortOrderSchema = z.enum(['asc', 'desc']);
export const paymentMethodSchema = z.enum(['card', 'sbp']);

export const getOperationsParamsSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(250).default(10),
  search: z.string().trim().optional(),
  status: operationStatusSchema.optional(),
  riskLevel: operationRiskLevelSchema.optional(),
  sortBy: operationsSortBySchema.default('createdAt'),
  order: sortOrderSchema.default('desc'),
  minAmount: z.number().finite().optional(),
  maxAmount: z.number().finite().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  paymentMethod: paymentMethodSchema.optional(),
  country: z.string().trim().optional(),
});

export const operationsResponseSchema = z.object({
  items: z.array(operationListItemSchema),
  total: z.number().int().min(0),
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  refreshedAt: z.string(),
});

export const updateOperationStatusBodySchema = z.object({
  status: operationStatusSchema,
  reason: z.string().trim().min(1, 'Reason is required'),
  comment: z.string().trim().min(3, 'Comment is required'),
});

export const bulkUpdateOperationStatusBodySchema = z.object({
  ids: z.array(z.string()).min(1),
  status: operationStatusSchema,
  reason: z.string().trim().min(1, 'Reason is required'),
  comment: z.string().trim().min(3, 'Comment is required'),
});

export const bulkUpdateOperationStatusResponseSchema = z.object({
  updatedIds: z.array(z.string()),
  status: operationStatusSchema,
});

export const updateOperationCollaborationBodySchema = z.object({
  action: z.enum(['assign', 'escalate', 'add_note']),
  assigneeId: z.string().optional(),
  assigneeName: z.string().optional(),
  assigneeRole: collaboratorRoleSchema.optional(),
  queue: caseQueueSchema.optional(),
  priority: casePrioritySchema.optional(),
  reason: z.string().trim().min(1),
  note: z.string().trim().min(3),
});

export type Operation = z.infer<typeof operationListItemSchema>;
export type OperationDetails = z.infer<typeof operationDetailsSchema>;
export type OperationHistoryEvent = z.infer<typeof operationHistoryEventSchema>;
export type OperationHistoryChange = z.infer<typeof operationHistoryChangeSchema>;
export type OperationStatus = z.infer<typeof operationStatusSchema>;
export type OperationRiskLevel = z.infer<typeof operationRiskLevelSchema>;
export type OperationRiskFactor = z.infer<typeof operationRiskFactorSchema>;
export type RelatedOperation = z.infer<typeof relatedOperationSchema>;
export type OperationsSortBy = z.infer<typeof operationsSortBySchema>;
export type SortOrder = z.infer<typeof sortOrderSchema>;
export type GetOperationsParams = z.infer<typeof getOperationsParamsSchema>;
export type GetOperationsResponse = z.infer<typeof operationsResponseSchema>;
export type BulkUpdateOperationStatusResponse = z.infer<
  typeof bulkUpdateOperationStatusResponseSchema
>;
export type CaseAssignee = z.infer<typeof caseAssigneeSchema>;
export type CollaborationNote = z.infer<typeof collaborationNoteSchema>;
export type CollaboratorRole = z.infer<typeof collaboratorRoleSchema>;
export type CaseQueue = z.infer<typeof caseQueueSchema>;
export type CasePriority = z.infer<typeof casePrioritySchema>;

export type OperationDecisionPayload = {
  status: OperationStatus;
  reason: string;
  comment: string;
};

export type OperationCollaborationPayload = z.infer<
  typeof updateOperationCollaborationBodySchema
>;
