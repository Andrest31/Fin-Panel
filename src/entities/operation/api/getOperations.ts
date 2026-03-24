import { z } from 'zod';

export const operationSchema = z.object({
  id: z.string(),
  merchant: z.string(),
  amount: z.number(),
  currency: z.string(),
  status: z.enum(['new', 'in_review', 'approved', 'blocked', 'flagged']),
  riskLevel: z.enum(['low', 'medium', 'high']),
  createdAt: z.string(),
});

export const operationsResponseSchema = z.array(operationSchema);

export type Operation = z.infer<typeof operationSchema>;

export async function getOperations(): Promise<Operation[]> {
  const response = await fetch('/api/operations');

  if (!response.ok) {
    throw new Error(`Failed to load operations: ${response.status}`);
  }

  const text = await response.text();

  try {
    const json = JSON.parse(text);
    return operationsResponseSchema.parse(json);
  } catch {
    throw new Error(`Expected JSON from /api/operations, got: ${text.slice(0, 120)}`);
  }
}