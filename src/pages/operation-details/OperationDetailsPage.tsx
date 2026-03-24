import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  getOperationById,
  updateOperationStatus,
  type Operation,
  type OperationDetails,
  type OperationStatus,
} from '@/entities/operation/api/getOperations';
import {
  applyOptimisticDecisionToOperation,
  applyOptimisticDecisionToOperationDetails,
} from '@/entities/operation/lib/optimisticUpdates';
import { DecisionDialog } from '@/features/operation-actions/ui/DecisionDialog';

function getRiskColor(riskLevel: 'low' | 'medium' | 'high') {
  if (riskLevel === 'high') return 'error';
  if (riskLevel === 'medium') return 'warning';
  return 'success';
}

function getStatusColor(status: 'new' | 'in_review' | 'approved' | 'blocked' | 'flagged') {
  if (status === 'approved') return 'success';
  if (status === 'blocked' || status === 'flagged') return 'error';
  if (status === 'in_review') return 'warning';
  return 'default';
}

type DecisionPayload = {
  status: OperationStatus;
  reason: string;
  comment: string;
};

type MutationContext = {
  previousOperation?: OperationDetails;
  previousOperations?: Operation[];
};

export function OperationDetailsPage() {
  const { id = '' } = useParams();
  const queryClient = useQueryClient();

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [pendingStatus, setPendingStatus] = useState<OperationStatus | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['operation', id],
    queryFn: () => getOperationById(id),
    enabled: Boolean(id),
  });

  const statusMutation = useMutation({
    mutationFn: (payload: DecisionPayload) => updateOperationStatus(id, payload),

    onMutate: async (payload): Promise<MutationContext> => {
      await queryClient.cancelQueries({ queryKey: ['operation', id] });
      await queryClient.cancelQueries({ queryKey: ['operations'] });

      const previousOperation = queryClient.getQueryData<OperationDetails>(['operation', id]);
      const previousOperations = queryClient.getQueryData<Operation[]>(['operations']);

      if (previousOperation) {
        queryClient.setQueryData<OperationDetails>(
          ['operation', id],
          applyOptimisticDecisionToOperationDetails(previousOperation, payload),
        );
      }

      if (previousOperations) {
        queryClient.setQueryData<Operation[]>(
          ['operations'],
          previousOperations.map((operation) =>
            operation.id === id
              ? applyOptimisticDecisionToOperation(operation, payload)
              : operation,
          ),
        );
      }

      setErrorMessage('');

      return {
        previousOperation,
        previousOperations,
      };
    },

    onSuccess: (updatedOperation) => {
      queryClient.setQueryData(['operation', id], updatedOperation);
      setSuccessMessage(`Статус обновлён: ${updatedOperation.status}`);
      setPendingStatus(null);
    },

    onError: (mutationError, _payload, context) => {
      if (context?.previousOperation) {
        queryClient.setQueryData(['operation', id], context.previousOperation);
      }

      if (context?.previousOperations) {
        queryClient.setQueryData(['operations'], context.previousOperations);
      }

      setErrorMessage(
        mutationError instanceof Error ? mutationError.message : 'Не удалось обновить статус',
      );
      setSuccessMessage('');
    },

    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['operations'] });
      await queryClient.invalidateQueries({ queryKey: ['operation', id] });
    },
  });

  const handleOpenDecision = (status: OperationStatus) => {
    setPendingStatus(status);
  };

  const handleSubmitDecision = (payload: { reason: string; comment: string }) => {
    if (!pendingStatus) return;

    statusMutation.mutate({
      status: pendingStatus,
      reason: payload.reason,
      comment: payload.comment,
    });
  };

  const handleCloseDecision = () => {
    if (statusMutation.isPending) return;
    setPendingStatus(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={1} sx={{ mb: 3 }}>
        <Button
          component={RouterLink}
          to="/operations"
          variant="text"
          sx={{ alignSelf: 'flex-start', px: 0 }}
        >
          ← Back to queue
        </Button>

        <Typography variant="h4">Operation Details</Typography>
      </Stack>

      {isLoading && <CircularProgress />}

      {isError && (
        <Alert severity="error">
          {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
      )}

      {data && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card>
              <CardContent>
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={2}
                  justifyContent="space-between"
                  sx={{ mb: 2 }}
                >
                  <Box>
                    <Typography variant="h5">{data.merchant}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Operation ID: {data.id}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1}>
                    <Chip label={data.status} color={getStatusColor(data.status)} />
                    <Chip label={`risk: ${data.riskLevel}`} color={getRiskColor(data.riskLevel)} />
                  </Stack>
                </Stack>

                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Amount
                    </Typography>
                    <Typography variant="body1">
                      {data.amount} {data.currency}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Payment method
                    </Typography>
                    <Typography variant="body1">{data.paymentMethod}</Typography>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Customer ID
                    </Typography>
                    <Typography variant="body1">{data.customerId}</Typography>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Reviewer
                    </Typography>
                    <Typography variant="body1">{data.reviewer ?? 'Not assigned'}</Typography>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Country / city
                    </Typography>
                    <Typography variant="body1">
                      {data.country} / {data.city}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Device ID
                    </Typography>
                    <Typography variant="body1">{data.deviceId}</Typography>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      IP address
                    </Typography>
                    <Typography variant="body1">{data.ipAddress}</Typography>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Created at
                    </Typography>
                    <Typography variant="body1">
                      {new Date(data.createdAt).toLocaleString()}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Updated at
                    </Typography>
                    <Typography variant="body1">
                      {new Date(data.updatedAt).toLocaleString()}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  History
                </Typography>

                <List>
                  {data.history.map((event, index) => (
                    <ListItem
                      key={event.id}
                      divider={index < data.history.length - 1}
                      disableGutters
                    >
                      <ListItemText
                        primary={`${event.type} • ${event.actor}${event.reason ? ` • ${event.reason}` : ''}`}
                        secondary={`${new Date(event.timestamp).toLocaleString()} • ${event.comment}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Risk Summary
                </Typography>

                <Stack spacing={1} sx={{ mb: 3 }}>
                  <Chip
                    label={`Risk level: ${data.riskLevel}`}
                    color={getRiskColor(data.riskLevel)}
                  />
                  <Chip label={`Flags: ${data.flagReasons.length}`} />
                </Stack>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Flag reasons
                </Typography>

                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 3 }}>
                  {data.flagReasons.length > 0 ? (
                    data.flagReasons.map((reason) => (
                      <Chip key={reason} label={reason} variant="outlined" />
                    ))
                  ) : (
                    <Typography variant="body2">No active flags</Typography>
                  )}
                </Stack>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Actions
                </Typography>

                <Stack spacing={1}>
                  <Button
                    variant="contained"
                    disabled={statusMutation.isPending || data.status === 'approved'}
                    onClick={() => handleOpenDecision('approved')}
                  >
                    Approve
                  </Button>

                  <Button
                    variant="outlined"
                    color="warning"
                    disabled={statusMutation.isPending || data.status === 'in_review'}
                    onClick={() => handleOpenDecision('in_review')}
                  >
                    Send to review
                  </Button>

                  <Button
                    variant="outlined"
                    color="error"
                    disabled={statusMutation.isPending || data.status === 'blocked'}
                    onClick={() => handleOpenDecision('blocked')}
                  >
                    Block operation
                  </Button>
                </Stack>

                {statusMutation.isPending && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Updating operation status...
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <DecisionDialog
        open={Boolean(pendingStatus) && Boolean(data)}
        targetLabel={data?.merchant ?? 'operation'}
        status={pendingStatus}
        isPending={statusMutation.isPending}
        onClose={handleCloseDecision}
        onSubmit={handleSubmitDecision}
      />

      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage('')}
        message={successMessage}
      />

      <Snackbar
        open={Boolean(errorMessage)}
        autoHideDuration={4000}
        onClose={() => setErrorMessage('')}
        message={errorMessage}
      />
    </Box>
  );
}