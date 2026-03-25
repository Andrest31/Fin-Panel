import type {
  GetOperationsResponse,
  OperationDetails,
  OperationStatus,
} from '@/entities/operation/api/getOperations';

export type DecisionPayload = {
  status: OperationStatus;
  reason: string;
  comment: string;
};

export type BulkDecisionVariables = DecisionPayload & {
  ids: string[];
};

export type BulkMutationContext = {
  previousOperationsLists: Array<[readonly unknown[], GetOperationsResponse | undefined]>;
  previousOperationDetails: Array<[string, OperationDetails | undefined]>;
};
