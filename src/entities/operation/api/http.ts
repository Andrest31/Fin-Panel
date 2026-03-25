import { z } from 'zod';
import { getMockDataVolume, getMockScenario } from '@/shared/lib/mockScenario';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function createRequestHeaders() {
  return {
    'x-mock-scenario': getMockScenario(),
    'x-mock-volume': getMockDataVolume(),
  };
}

export async function parseJsonResponse<T>(
  response: Response,
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
): Promise<T> {
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

    throw new ApiError(message, response.status);
  }

  return schema.parse(json);
}
