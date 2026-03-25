import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ApiError,
  bulkUpdateOperationStatus,
  type GetOperationsResponse,
  type OperationDetails,
} from "@/entities/operation/api/getOperations";
import {
  applyOptimisticDecisionToOperationDetails,
  applyOptimisticDecisionToOperationsResponse,
} from "@/entities/operation/lib/optimisticUpdates";
import { getBulkErrorMessage } from "../lib/getBulkErrorMessage";
import type {
  BulkDecisionVariables,
  BulkMutationContext,
  DecisionPayload,
} from "../model/types";

type Options = {
  onSuccess: (updatedCount: number) => void;
  onError: (message: string) => void;
  onConflict: () => void;
  onSettled: (ids: string[]) => Promise<void>;
};

export function useBulkOperationsDecision(options: Options) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, status, reason, comment }: BulkDecisionVariables) =>
      bulkUpdateOperationStatus(ids, { status, reason, comment }),

    onMutate: async ({
      ids,
      status,
      reason,
      comment,
    }): Promise<BulkMutationContext> => {
      const payload: DecisionPayload = { status, reason, comment };

      await queryClient.cancelQueries({ queryKey: ["operations"] });

      const previousOperationsLists =
        queryClient.getQueriesData<GetOperationsResponse>({
          queryKey: ["operations"],
        });

      const previousOperationDetails: Array<
        [string, OperationDetails | undefined]
      > = ids.map((id) => [
        id,
        queryClient.getQueryData<OperationDetails>(["operation", id]),
      ]);

      previousOperationsLists.forEach(([queryKey, response]) => {
        if (!response) return;

        queryClient.setQueryData<GetOperationsResponse>(
          queryKey,
          applyOptimisticDecisionToOperationsResponse(response, ids, payload),
        );
      });

      previousOperationDetails.forEach(([operationId, operationDetails]) => {
        if (!operationDetails) return;

        queryClient.setQueryData<OperationDetails>(
          ["operation", operationId],
          applyOptimisticDecisionToOperationDetails(operationDetails, payload),
        );
      });

      return {
        previousOperationsLists,
        previousOperationDetails,
      };
    },

    onSuccess: (result) => {
      options.onSuccess(result.updatedIds.length);
    },

    onError: async (mutationError, _variables, context) => {
      context?.previousOperationsLists.forEach(([queryKey, response]) => {
        queryClient.setQueryData(queryKey, response);
      });

      context?.previousOperationDetails.forEach(
        ([operationId, operationDetails]) => {
          if (operationDetails) {
            queryClient.setQueryData(
              ["operation", operationId],
              operationDetails,
            );
          }
        },
      );

      options.onError(getBulkErrorMessage(mutationError));

      if (mutationError instanceof ApiError && mutationError.status === 409) {
        options.onConflict();
        await queryClient.invalidateQueries({ queryKey: ["operations"] });
      }
    },

    onSettled: async (_data, _error, variables) => {
      await options.onSettled(variables.ids);
    },
  });
}
