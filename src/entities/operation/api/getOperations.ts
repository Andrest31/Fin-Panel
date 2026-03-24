import { operationsResponseSchema, OperationsResponse } from '@/entities/operation/model/types';

export async function getOperations(): Promise<OperationsResponse> {
  const response = await fetch('/api/operations');

  if (!response.ok) {
    throw new Error('Failed to load operations');
  }

  const json = await response.json();
  return operationsResponseSchema.parse(json);
}
