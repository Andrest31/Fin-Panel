import { z } from 'zod';

export const operationStatusSchema = z.enum([
  'new',
  'in_review',
  'approved',
  'blocked',
  'flagged',
]);

export const operationRiskLevelSchema = z.enum(['low', 'medium', 'high']);

export const operationListItemSchema = z.object({
  id: z.string(),
  merchant: z.string(),
  amount: z.number(),
  currency: z.string(),
  status: operationStatusSchema,
  riskLevel: operationRiskLevelSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  customerId: z.string(),
  paymentMethod: z.string(),
  country: z.string(),
  city: z.string(),
  deviceId: z.string(),
  ipAddress: z.string(),
  reviewer: z.string().nullable(),
  flagReasons: z.array(z.string()),
});

export const operationHistoryEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  timestamp: z.string(),
  actor: z.string(),
  comment: z.string(),
  reason: z.string().optional(),
});

export const operationDetailsSchema = operationListItemSchema.extend({
  history: z.array(operationHistoryEventSchema),
});

export const operationsSortBySchema = z.enum(['createdAt', 'amount', 'merchant']);
export const sortOrderSchema = z.enum(['asc', 'desc']);
export const paymentMethodSchema = z.enum(['card', 'sbp']);

export const getOperationsParamsSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(10),
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

export type Operation = z.infer<typeof operationListItemSchema>;
export type OperationDetails = z.infer<typeof operationDetailsSchema>;
export type OperationHistoryEvent = z.infer<typeof operationHistoryEventSchema>;
export type OperationStatus = z.infer<typeof operationStatusSchema>;
export type OperationRiskLevel = z.infer<typeof operationRiskLevelSchema>;
export type OperationsSortBy = z.infer<typeof operationsSortBySchema>;
export type SortOrder = z.infer<typeof sortOrderSchema>;
export type GetOperationsParams = z.infer<typeof getOperationsParamsSchema>;
export type GetOperationsResponse = z.infer<typeof operationsResponseSchema>;
export type BulkUpdateOperationStatusResponse = z.infer<
  typeof bulkUpdateOperationStatusResponseSchema
>;

export type OperationDecisionPayload = {
  status: OperationStatus;
  reason: string;
  comment: string;
};

async function parseJsonResponse<T>(response: Response, schema: z.ZodSchema<T>): Promise<T> {
  const text = await response.text();

  let json: unknown;

  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Expected JSON, got: ${text.slice(0, 120)}`);
  }

  if (!response.ok) {
    const message =
      typeof json === 'object' &&
      json !== null &&
      'message' in json &&
      typeof json.message === 'string'
        ? json.message
        : `Request failed: ${response.status}`;

    throw new Error(message);
  }

  return schema.parse(json);
}

function createOperationsSearchParams(params: GetOperationsParams): URLSearchParams {
  const parsedParams = getOperationsParamsSchema.parse(params);
  const searchParams = new URLSearchParams();

  searchParams.set('page', String(parsedParams.page));
  searchParams.set('pageSize', String(parsedParams.pageSize));
  searchParams.set('sortBy', parsedParams.sortBy);
  searchParams.set('order', parsedParams.order);

  if (parsedParams.search) searchParams.set('search', parsedParams.search);
  if (parsedParams.status) searchParams.set('status', parsedParams.status);
  if (parsedParams.riskLevel) searchParams.set('riskLevel', parsedParams.riskLevel);
  if (parsedParams.minAmount !== undefined) searchParams.set('minAmount', String(parsedParams.minAmount));
  if (parsedParams.maxAmount !== undefined) searchParams.set('maxAmount', String(parsedParams.maxAmount));
  if (parsedParams.dateFrom) searchParams.set('dateFrom', parsedParams.dateFrom);
  if (parsedParams.dateTo) searchParams.set('dateTo', parsedParams.dateTo);
  if (parsedParams.paymentMethod) searchParams.set('paymentMethod', parsedParams.paymentMethod);
  if (parsedParams.country) searchParams.set('country', parsedParams.country);

  return searchParams;
}

export async function getOperations(params: GetOperationsParams): Promise<GetOperationsResponse> {
  const searchParams = createOperationsSearchParams(params);
  const response = await fetch(`/api/operations?${searchParams.toString()}`);

  return parseJsonResponse(response, operationsResponseSchema);
}

export async function getOperationById(id: string): Promise<OperationDetails> {
  const response = await fetch(`/api/operations/${id}`);
  return parseJsonResponse(response, operationDetailsSchema);
}

export async function updateOperationStatus(
  id: string,
  payload: OperationDecisionPayload,
): Promise<OperationDetails> {
  const requestBody = updateOperationStatusBodySchema.parse(payload);

  const response = await fetch(`/api/operations/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  return parseJsonResponse(response, operationDetailsSchema);
}

export async function bulkUpdateOperationStatus(
  ids: string[],
  payload: OperationDecisionPayload,
): Promise<BulkUpdateOperationStatusResponse> {
  const requestBody = bulkUpdateOperationStatusBodySchema.parse({
    ids,
    ...payload,
  });

  const response = await fetch('/api/operations/bulk-status', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  return parseJsonResponse(response, bulkUpdateOperationStatusResponseSchema);
}