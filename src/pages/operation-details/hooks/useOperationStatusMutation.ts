import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ApiError,
  updateOperationStatus,
  type GetOperationsResponse,
  type OperationDetails,
} from '@/entities/operation/api/getOperations';
import {
  applyOptimisticDecisionToOperationDetails,
  applyOptimisticDecisionToOperationsResponse,
} from '@/entities/operation/lib/optimisticUpdates';
import { getMutationErrorMessage } from '../lib/getMutationErrorMessage';
import type { DecisionPayload, MutationContext } from '../model/types';

type Options = {
  id: string;
  onSuccess: (status: string) => void;
  onError: (message: string) => void;
  onConflict: () => Promise<void>;
  onSettled: () => Promise<void>;
};

export function useOperationStatusMutation(options: Options) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: DecisionPayload) => updateOperationStatus(options.id, payload),

    onMutate: async (payload): Promise<MutationContext> => {
      await queryClient.cancelQueries({ queryKey: ['operation', options.id] });
      await queryClient.cancelQueries({ queryKey: ['operations'] });

      const previousOperation = queryClient.getQueryData<OperationDetails>(['operation', options.id]);
      const previousOperationsLists = queryClient.getQueriesData<GetOperationsResponse>({
        queryKey: ['operations'],
      });

      if (previousOperation) {
        queryClient.setQueryData<OperationDetails>(
          ['operation', options.id],
          applyOptimisticDecisionToOperationDetails(previousOperation, payload),
        );
      }

      previousOperationsLists.forEach(([queryKey, response]) => {
        if (!response) return;

        queryClient.setQueryData<GetOperationsResponse>(
          queryKey,
          applyOptimisticDecisionToOperationsResponse(response, [options.id], payload),
        );
      });

      return {
        previousOperation,
        previousOperationsLists,
      };
    },

    onSuccess: (updatedOperation) => {
      queryClient.setQueryData(['operation', options.id], updatedOperation);
      options.onSuccess(updatedOperation.status);
    },

    onError: async (mutationError, _payload, context) => {
      if (context?.previousOperation) {
        queryClient.setQueryData(['operation', options.id], context.previousOperation);
      }

      context?.previousOperationsLists.forEach(([queryKey, response]) => {
        queryClient.setQueryData(queryKey, response);
      });

      options.onError(getMutationErrorMessage(mutationError));

      if (mutationError instanceof ApiError && mutationError.status === 409) {
        await options.onConflict();
      }
    },

    onSettled: options.onSettled,
  });
}
