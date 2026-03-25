import { ApiError } from '@/entities/operation/api/getOperations';

export function getBulkErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.status === 409) {
    return 'Часть операций уже была обработана другим аналитиком. Список обновлён.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Не удалось обновить операции';
}
