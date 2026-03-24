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

export type Operation = z.infer<typeof operationListItemSchema>;
export type OperationDetails = z.infer<typeof operationDetailsSchema>;
export type OperationHistoryEvent = z.infer<typeof operationHistoryEventSchema>;

async function parseJsonResponse<T>(response: Response, schema: z.ZodSchema<T>): Promise<T> {
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  const text = await response.text();

  try {
    const json = JSON.parse(text);
    return schema.parse(json);
  } catch {
    throw new Error(`Expected JSON, got: ${text.slice(0, 120)}`);
  }
}

export async function getOperations(): Promise<Operation[]> {
  const response = await fetch('/api/operations');
  return parseJsonResponse(response, operationsResponseSchema);
}

export async function getOperationById(id: string): Promise<OperationDetails> {
  const response = await fetch(`/api/operations/${id}`);

  if (response.status === 404) {
    throw new Error('Operation not found');
  }

  return parseJsonResponse(response, operationDetailsSchema);
}