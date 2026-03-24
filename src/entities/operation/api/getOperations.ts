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
});

export const operationDetailsSchema = operationListItemSchema.extend({
  history: z.array(operationHistoryEventSchema),
});

export const operationsResponseSchema = z.array(operationListItemSchema);

export const updateOperationStatusBodySchema = z.object({
  status: operationStatusSchema,
});

export const bulkUpdateOperationStatusBodySchema = z.object({
  ids: z.array(z.string()).min(1),
  status: operationStatusSchema,
});

export const bulkUpdateOperationStatusResponseSchema = z.object({
  updatedIds: z.array(z.string()),
  status: operationStatusSchema,
});

export type Operation = z.infer<typeof operationListItemSchema>;
export type OperationDetails = z.infer<typeof operationDetailsSchema>;
export type OperationHistoryEvent = z.infer<typeof operationHistoryEventSchema>;
export type OperationStatus = z.infer<typeof operationStatusSchema>;
export type BulkUpdateOperationStatusResponse = z.infer<
  typeof bulkUpdateOperationStatusResponseSchema
>;

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

export async function getOperations(): Promise<Operation[]> {
  const response = await fetch('/api/operations');
  return parseJsonResponse(response, operationsResponseSchema);
}

export async function getOperationById(id: string): Promise<OperationDetails> {
  const response = await fetch(`/api/operations/${id}`);
  return parseJsonResponse(response, operationDetailsSchema);
}

export async function updateOperationStatus(
  id: string,
  status: OperationStatus,
): Promise<OperationDetails> {
  const requestBody = updateOperationStatusBodySchema.parse({ status });

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
  status: OperationStatus,
): Promise<BulkUpdateOperationStatusResponse> {
  const requestBody = bulkUpdateOperationStatusBodySchema.parse({ ids, status });

  const response = await fetch('/api/operations/bulk-status', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  return parseJsonResponse(response, bulkUpdateOperationStatusResponseSchema);
}