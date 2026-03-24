import { z } from 'zod';

export const riskLevelSchema = z.enum(['low', 'medium', 'high', 'critical']);
export type RiskLevel = z.infer<typeof riskLevelSchema>;

export const operationSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  amount: z.number(),
  currency: z.string(),
  merchant: z.string(),
  customerId: z.string(),
  status: z.enum(['new', 'in_review', 'approved', 'blocked', 'escalated']),
  riskLevel: riskLevelSchema,
  score: z.number().min(0).max(100),
  country: z.string(),
});

export const operationsResponseSchema = z.object({
  items: z.array(operationSchema),
  total: z.number(),
  refreshedAt: z.string(),
});

export type Operation = z.infer<typeof operationSchema>;
export type OperationsResponse = z.infer<typeof operationsResponseSchema>;
