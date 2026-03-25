import { ApiError } from '@/entities/operation/api/getOperations';

export function getMutationErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.status === 409) {
    return 'Операция уже была обновлена другим специалистом. Данные перечитаны.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Не удалось обновить кейс';
}
