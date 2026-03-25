import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import { useEffect, useState } from 'react';
import type {
  CasePriority,
  CaseQueue,
  CollaboratorRole,
} from '@/entities/operation/api/getOperations';

type CollaborationAction = 'assign' | 'escalate' | 'add_note';

type CollaborationActionDialogProps = {
  open: boolean;
  action: CollaborationAction | null;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    assigneeId?: string;
    assigneeName?: string;
    assigneeRole?: CollaboratorRole;
    queue?: CaseQueue;
    priority?: CasePriority;
    reason: string;
    note: string;
  }) => void;
};

const roleOptions: Array<{ value: CollaboratorRole; label: string }> = [
  { value: 'fraud_analyst', label: 'Fraud analyst' },
  { value: 'senior_analyst', label: 'Senior analyst' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'support', label: 'Support' },
];

const queueOptions: Array<{ value: CaseQueue; label: string }> = [
  { value: 'manual_review', label: 'Manual review' },
  { value: 'senior_review', label: 'Senior review' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'customer_confirmation', label: 'Customer confirmation' },
];

const priorityOptions: Array<{ value: CasePriority; label: string }> = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

function getDialogTitle(action: CollaborationAction | null) {
  if (action === 'assign') return 'Reassign case';
  if (action === 'escalate') return 'Escalate case';
  return 'Add collaboration note';
}

export function CollaborationActionDialog({
  open,
  action,
  isPending,
  onClose,
  onSubmit,
}: CollaborationActionDialogProps) {
  const [assigneeId, setAssigneeId] = useState('spec_01');
  const [assigneeName, setAssigneeName] = useState('Irina Petrova');
  const [assigneeRole, setAssigneeRole] = useState<CollaboratorRole>('fraud_analyst');
  const [queue, setQueue] = useState<CaseQueue>('manual_review');
  const [priority, setPriority] = useState<CasePriority>('high');
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!open) return;

    if (action === 'assign') {
      setAssigneeId('spec_02');
      setAssigneeName('Dmitry Sokolov');
      setAssigneeRole('fraud_analyst');
      setQueue('manual_review');
      setPriority('high');
      setReason('');
      setNote('');
      return;
    }

    if (action === 'escalate') {
      setAssigneeId('spec_03');
      setAssigneeName('Anna Voronina');
      setAssigneeRole('compliance');
      setQueue('compliance');
      setPriority('critical');
      setReason('');
      setNote('');
      return;
    }

    setReason('');
    setNote('');
  }, [action, open]);

  const showAssignmentFields = action === 'assign' || action === 'escalate';

  return (
    <Dialog open={open} onClose={isPending ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{getDialogTitle(action)}</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {showAssignmentFields ? (
            <>
              <TextField
                label="Assignee name"
                value={assigneeName}
                onChange={(event) => setAssigneeName(event.target.value)}
                fullWidth
              />

              <TextField
                label="Assignee id"
                value={assigneeId}
                onChange={(event) => setAssigneeId(event.target.value)}
                fullWidth
              />

              <TextField
                select
                label="Role"
                value={assigneeRole}
                onChange={(event) => setAssigneeRole(event.target.value as CollaboratorRole)}
                fullWidth
              >
                {roleOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Queue"
                value={queue}
                onChange={(event) => setQueue(event.target.value as CaseQueue)}
                fullWidth
              >
                {queueOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Priority"
                value={priority}
                onChange={(event) => setPriority(event.target.value as CasePriority)}
                fullWidth
              >
                {priorityOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </>
          ) : null}

          <TextField
            label="Reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            fullWidth
          />

          <TextField
            label="Note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
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

        <Button
          variant="contained"
          disabled={isPending || reason.trim().length < 1 || note.trim().length < 3}
          onClick={() =>
            onSubmit({
              assigneeId: showAssignmentFields ? assigneeId : undefined,
              assigneeName: showAssignmentFields ? assigneeName : undefined,
              assigneeRole: showAssignmentFields ? assigneeRole : undefined,
              queue: showAssignmentFields ? queue : undefined,
              priority: showAssignmentFields ? priority : undefined,
              reason: reason.trim(),
              note: note.trim(),
            })
          }
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}