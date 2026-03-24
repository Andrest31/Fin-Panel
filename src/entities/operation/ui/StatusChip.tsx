import Chip from '@mui/material/Chip';
import type { OperationStatus } from '../api/getOperations';

type StatusChipProps = {
  status: OperationStatus;
};

function getStatusLabel(status: OperationStatus) {
  switch (status) {
    case 'new':
      return 'new';
    case 'in_review':
      return 'in review';
    case 'approved':
      return 'approved';
    case 'blocked':
      return 'blocked';
    case 'flagged':
      return 'flagged';
    default:
      return status;
  }
}

function getStatusColor(status: OperationStatus): 'default' | 'success' | 'warning' | 'error' {
  switch (status) {
    case 'approved':
      return 'success';
    case 'in_review':
      return 'warning';
    case 'blocked':
    case 'flagged':
      return 'error';
    default:
      return 'default';
  }
}

export function StatusChip({ status }: StatusChipProps) {
  return <Chip label={getStatusLabel(status)} color={getStatusColor(status)} size="small" />;
}