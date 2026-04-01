import {
  Button,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {
  getAvailableDecisionStatuses,
  type DecisionAction,
} from '@/entities/operation/lib/decisioning';
import type { OperationDetails, OperationStatus } from '@/entities/operation/api/getOperations';
import type { CollaborationAction } from '../model/types';
import {
  formatSlaLabel,
  formatWorkflowStage,
  getPriorityColor,
  getRiskColor,
  getSlaChipColor,
} from '../lib/presentation';

type Props = {
  data: OperationDetails;
  isStatusPending: boolean;
  isCollaborationPending: boolean;
  onOpenDecision: (status: OperationStatus) => void;
  onOpenCollaboration: (action: CollaborationAction) => void;
};

const actionLabels: Record<DecisionAction, string> = {
  approved: 'Approve',
  in_review: 'Send to review',
  blocked: 'Block operation',
  flagged: 'Flag for escalation',
};

const actionVariants: Record<DecisionAction, 'contained' | 'outlined'> = {
  approved: 'contained',
  in_review: 'outlined',
  blocked: 'outlined',
  flagged: 'outlined',
};

const actionColors: Record<DecisionAction, 'primary' | 'warning' | 'error'> = {
  approved: 'primary',
  in_review: 'warning',
  blocked: 'error',
  flagged: 'warning',
};

export function OperationDetailsSidebar({
  data,
  isStatusPending,
  isCollaborationPending,
  onOpenDecision,
  onOpenCollaboration,
}: Props) {
  const availableActions = getAvailableDecisionStatuses(data.status);

  return (
    <Stack spacing={3}>
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Case ownership
          </Typography>

          <Stack spacing={1.5} sx={{ mb: 3 }}>
            <Chip
              label={data.assignee ? `${data.assignee.name} • ${data.assignee.role}` : 'Unassigned'}
              color={data.assignee ? 'info' : 'default'}
            />
            <Chip label={`Stage: ${formatWorkflowStage(data.status)}`} variant="outlined" />
            <Chip label={`Queue: ${data.queue}`} variant="outlined" />
            <Chip label={`Priority: ${data.priority}`} color={getPriorityColor(data.priority)} />
            <Chip label={formatSlaLabel(data.slaDeadline)} color={getSlaChipColor(data.slaDeadline)} />
            <Chip
              label={
                data.slaDeadline
                  ? `Deadline: ${new Date(data.slaDeadline).toLocaleString()}`
                  : 'Deadline: not required'
              }
              variant="outlined"
            />
          </Stack>

          <Stack spacing={1}>
            <Button
              variant="contained"
              onClick={() => onOpenCollaboration('assign')}
              disabled={isCollaborationPending}
            >
              Reassign case
            </Button>

            <Button
              variant="outlined"
              color="warning"
              onClick={() => onOpenCollaboration('escalate')}
              disabled={isCollaborationPending}
            >
              Escalate
            </Button>

            <Button
              variant="outlined"
              onClick={() => onOpenCollaboration('add_note')}
              disabled={isCollaborationPending}
            >
              Add note
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Decision workflow
          </Typography>

          <Stack spacing={1} sx={{ mb: 3 }}>
            <Chip label={`Risk level: ${data.riskLevel}`} color={getRiskColor(data.riskLevel)} />
            <Chip label={`Risk score: ${data.riskScore}/100`} />
            <Chip label={`Flags: ${data.flagReasons.length}`} />
          </Stack>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Flag reasons
          </Typography>

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 3 }}>
            {data.flagReasons.length > 0 ? (
              data.flagReasons.map((reason) => <Chip key={reason} label={reason} variant="outlined" />)
            ) : (
              <Typography variant="body2">No active flags</Typography>
            )}
          </Stack>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Allowed next actions
          </Typography>

          <Stack spacing={1}>
            {availableActions.map((action) => (
              <Button
                key={action}
                variant={actionVariants[action]}
                color={actionColors[action]}
                disabled={isStatusPending}
                onClick={() => onOpenDecision(action)}
              >
                {actionLabels[action]}
              </Button>
            ))}

            {availableActions.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No workflow transitions available from the current state.
              </Typography>
            ) : null}
          </Stack>

          {isStatusPending ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Updating operation status...
            </Typography>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Collaboration notes
          </Typography>

          <List>
            {data.collaborationNotes.map((note, index) => (
              <ListItem
                key={note.id}
                disableGutters
                divider={index < data.collaborationNotes.length - 1}
              >
                <ListItemText
                  primary={`${note.author} • ${note.role}`}
                  secondary={`${new Date(note.createdAt).toLocaleString()} — ${note.text}`}
                />
              </ListItem>
            ))}

            {data.collaborationNotes.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No collaboration notes yet.
              </Typography>
            ) : null}
          </List>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Related operations
          </Typography>

          <List>
            {data.relatedOperations.map((operation) => (
              <ListItem
                key={operation.id}
                component={RouterLink}
                to={`/operations/${operation.id}`}
                sx={{
                  px: 0,
                  color: 'inherit',
                  textDecoration: 'none',
                  alignItems: 'flex-start',
                }}
              >
                <ListItemText
                  primary={
                    <Stack
                      direction={{ xs: 'column', md: 'row' }}
                      spacing={1}
                      alignItems={{ xs: 'flex-start', md: 'center' }}
                    >
                      <Typography variant="subtitle2">{operation.merchant}</Typography>
                      <Chip size="small" label={operation.relation} variant="outlined" />
                      <Chip size="small" label={operation.status} />
                    </Stack>
                  }
                  secondary={`${operation.amount} ${operation.currency} • ${new Date(
                    operation.createdAt,
                  ).toLocaleString()}`}
                />
              </ListItem>
            ))}

            {data.relatedOperations.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No related operations found.
              </Typography>
            ) : null}
          </List>
        </CardContent>
      </Card>
    </Stack>
  );
}