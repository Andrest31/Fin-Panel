import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import type { OperationStatus } from '@/entities/operation/api/getOperations';

type DecisionDialogProps = {
  open: boolean;
  targetLabel: string;
  status: OperationStatus | null;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (payload: { reason: string; comment: string }) => void;
};

function getReasonOptions(status: OperationStatus | null) {
  if (status === 'approved') {
    return [
      { value: 'trusted_pattern', label: 'Trusted pattern' },
      { value: 'known_customer', label: 'Known customer' },
      { value: 'risk_false_positive', label: 'False positive' },
    ];
  }

  if (status === 'in_review') {
    return [
      { value: 'needs_manual_check', label: 'Needs manual check' },
      { value: 'merchant_pattern', label: 'Merchant pattern' },
      { value: 'suspicious_behavior', label: 'Suspicious behavior' },
    ];
  }

  if (status === 'blocked') {
    return [
      { value: 'stolen_card_signal', label: 'Stolen card signal' },
      { value: 'velocity_spike', label: 'Velocity spike' },
      { value: 'new_device_high_risk', label: 'New device high risk' },
    ];
  }

  if (status === 'flagged') {
    return [
      { value: 'risk_recheck', label: 'Risk re-check required' },
      { value: 'queue_breach', label: 'Queue SLA breach' },
      { value: 'analyst_escalation', label: 'Analyst escalation' },
    ];
  }

  return [];
}

function getDefaultComment(status: OperationStatus | null) {
  if (status === 'approved') return 'Signals reviewed, operation looks legitimate.';
  if (status === 'in_review') return 'Additional analyst verification required.';
  if (status === 'blocked') return 'Operation blocked due to fraud indicators.';
  if (status === 'flagged') return 'Case flagged for stricter queue routing and re-check.';
  return '';
}

function getWorkflowHint(status: OperationStatus | null) {
  if (status === 'approved') {
    return 'Resolved state. SLA will be cleared and the case will move out of active review.';
  }
  if (status === 'blocked') {
    return 'Highest-severity outcome. The case will be routed to compliance tracking.';
  }
  if (status === 'in_review') {
    return 'Manual review state. The case stays active with queue and SLA enforcement.';
  }
  if (status === 'flagged') {
    return 'Escalated review state. Use it when more scrutiny is needed before final action.';
  }
  return '';
}

export function DecisionDialog({
  open,
  targetLabel,
  status,
  isPending,
  onClose,
  onSubmit,
}: DecisionDialogProps) {
  const reasonOptions = useMemo(() => getReasonOptions(status), [status]);
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (open) {
      setReason(reasonOptions[0]?.value ?? '');
      setComment(getDefaultComment(status));
      setSubmitted(false);
    }
  }, [open, reasonOptions, status]);

  const reasonError = submitted && reason.trim().length === 0;
  const commentError = submitted && comment.trim().length < 3;

  const handleSubmit = () => {
    setSubmitted(true);

    if (reason.trim().length === 0 || comment.trim().length < 3) {
      return;
    }

    onSubmit({
      reason: reason.trim(),
      comment: comment.trim(),
    });
  };

  return (
    <Dialog open={open} onClose={isPending ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Decision for {targetLabel}</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {status ? <Alert severity="info">{getWorkflowHint(status)}</Alert> : null}

          <TextField
            select
            label="Reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            error={reasonError}
            helperText={reasonError ? 'Reason is required' : ' '}
            fullWidth
          >
            {reasonOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Comment"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            error={commentError}
            helperText={commentError ? 'At least 3 characters required' : ' '}
            multiline
            minRows={3}
            fullWidth
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isPending}>
          Cancel
        </Button>

        <Button onClick={handleSubmit} variant="contained" disabled={isPending}>
          {isPending ? 'Saving...' : 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}