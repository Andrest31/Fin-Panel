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

export type MutationContext = {
  previousOperation?: OperationDetails;
  previousOperationsLists: Array<[readonly unknown[], GetOperationsResponse | undefined]>;
};

export type CollaborationAction = 'assign' | 'escalate' | 'add_note';
