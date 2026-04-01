import {
  bulkUpdateOperationStatusBodySchema,
  bulkUpdateOperationStatusResponseSchema,
  type BulkUpdateOperationStatusResponse,
  getOperationsParamsSchema,
  type GetOperationsParams,
  type GetOperationsResponse,
  operationDetailsSchema,
  operationsResponseSchema,
  type OperationCollaborationPayload,
  type OperationDecisionPayload,
  type OperationDetails,
  updateOperationCollaborationBodySchema,
  updateOperationStatusBodySchema,
} from './schemas';
import { createRequestHeaders, parseJsonResponse } from './http';

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
  if (parsedParams.minAmount !== undefined) {
    searchParams.set('minAmount', String(parsedParams.minAmount));
  }
  if (parsedParams.maxAmount !== undefined) {
    searchParams.set('maxAmount', String(parsedParams.maxAmount));
  }
  if (parsedParams.dateFrom) searchParams.set('dateFrom', parsedParams.dateFrom);
  if (parsedParams.dateTo) searchParams.set('dateTo', parsedParams.dateTo);
  if (parsedParams.paymentMethod) searchParams.set('paymentMethod', parsedParams.paymentMethod);
  if (parsedParams.country) searchParams.set('country', parsedParams.country);
  if (parsedParams.queue) searchParams.set('queue', parsedParams.queue);
  if (parsedParams.priority) searchParams.set('priority', parsedParams.priority);
  if (parsedParams.slaState) searchParams.set('slaState', parsedParams.slaState);
  if (parsedParams.activeOnly) searchParams.set('activeOnly', 'true');

  return searchParams;
}

export async function getOperations(params: GetOperationsParams): Promise<GetOperationsResponse> {
  const searchParams = createOperationsSearchParams(params);
  const response = await fetch(`/api/operations?${searchParams.toString()}`, {
    headers: createRequestHeaders(),
  });

  return parseJsonResponse(response, operationsResponseSchema);
}

export async function getOperationById(id: string): Promise<OperationDetails> {
  const response = await fetch(`/api/operations/${id}`, {
    headers: createRequestHeaders(),
  });

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
      ...createRequestHeaders(),
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
      ...createRequestHeaders(),
    },
    body: JSON.stringify(requestBody),
  });

  return parseJsonResponse(response, bulkUpdateOperationStatusResponseSchema);
}

export async function updateOperationCollaboration(
  id: string,
  payload: OperationCollaborationPayload,
): Promise<OperationDetails> {
  const requestBody = updateOperationCollaborationBodySchema.parse(payload);

  const response = await fetch(`/api/operations/${id}/collaboration`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...createRequestHeaders(),
    },
    body: JSON.stringify(requestBody),
  });

  return parseJsonResponse(response, operationDetailsSchema);
}