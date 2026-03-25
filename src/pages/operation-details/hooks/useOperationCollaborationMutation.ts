import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ApiError,
  updateOperationCollaboration,
} from '@/entities/operation/api/getOperations';
import { getMutationErrorMessage } from '../lib/getMutationErrorMessage';

type Options = {
  id: string;
  onSuccess: () => void;
  onError: (message: string) => void;
  onConflict: () => Promise<void>;
  onSettled: () => Promise<void>;
};

export function useOperationCollaborationMutation(options: Options) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Parameters<typeof updateOperationCollaboration>[1]) =>
      updateOperationCollaboration(options.id, payload),

    onSuccess: (updatedOperation) => {
      queryClient.setQueryData(['operation', options.id], updatedOperation);
      options.onSuccess();
    },

    onError: async (mutationError) => {
      options.onError(getMutationErrorMessage(mutationError));

      if (mutationError instanceof ApiError && mutationError.status === 409) {
        await options.onConflict();
      }
    },

    onSettled: options.onSettled,
  });
}
