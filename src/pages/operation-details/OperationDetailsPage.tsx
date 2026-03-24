import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  ApiError,
  getOperationById,
  updateOperationStatus,
  type GetOperationsResponse,
  type OperationDetails,
  type OperationRiskFactor,
  type OperationStatus,
} from '@/entities/operation/api/getOperations';
import {
  applyOptimisticDecisionToOperationDetails,
  applyOptimisticDecisionToOperationsResponse,
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

function getRecommendedActionColor(action: string) {
  if (action.toLowerCase().includes('block')) return 'error.main';
  if (action.toLowerCase().includes('manual')) return 'warning.main';
  return 'success.main';
}

function formatRiskFactorContribution(factor: OperationRiskFactor) {
  return `+${factor.contribution}`;
}

function getMutationErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.status === 409) {
    return 'Операция уже была обновлена другим аналитиком. Данные перечитаны.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Не удалось обновить статус';
}

type DecisionPayload = {
  status: OperationStatus;
  reason: string;
  comment: string;
};

type MutationContext = {
  previousOperation?: OperationDetails;
  previousOperationsLists: Array<[readonly unknown[], GetOperationsResponse | undefined]>;
};

export function OperationDetailsPage() {
  const { id = '' } = useParams();
  const queryClient = useQueryClient();

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [pendingStatus, setPendingStatus] = useState<OperationStatus | null>(null);
  const [liveMessage, setLiveMessage] = useState('');
  const [highlightedHistoryEventIds, setHighlightedHistoryEventIds] = useState<string[]>([]);

  const previousUpdatedAtRef = useRef<string | null>(null);
  const previousHistoryIdsRef = useRef<string[]>([]);
  const isFirstLivePassRef = useRef(true);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['operation', id],
    queryFn: () => getOperationById(id),
    enabled: Boolean(id),
    refetchInterval: import.meta.env.MODE === 'test' ? false : 7000,
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    if (!data) return;

    if (isFirstLivePassRef.current) {
      previousUpdatedAtRef.current = data.updatedAt;
      previousHistoryIdsRef.current = data.history.map((event) => event.id);
      isFirstLivePassRef.current = false;
      return;
    }

    const previousUpdatedAt = previousUpdatedAtRef.current;
    const previousHistoryIds = previousHistoryIdsRef.current;

    const freshHistoryIds = data.history
      .map((event) => event.id)
      .filter((id) => !previousHistoryIds.includes(id));

    if (previousUpdatedAt && previousUpdatedAt !== data.updatedAt) {
      setLiveMessage('Карточка операции обновилась в реальном времени.');
    }

    if (freshHistoryIds.length > 0) {
      setHighlightedHistoryEventIds(freshHistoryIds);

      const timeoutId = window.setTimeout(() => {
        setHighlightedHistoryEventIds((current) =>
          current.filter((eventId) => !freshHistoryIds.includes(eventId)),
        );
      }, 6000);

      previousUpdatedAtRef.current = data.updatedAt;
      previousHistoryIdsRef.current = data.history.map((event) => event.id);

      return () => window.clearTimeout(timeoutId);
    }

    previousUpdatedAtRef.current = data.updatedAt;
    previousHistoryIdsRef.current = data.history.map((event) => event.id);
  }, [data]);

  const highImpactFactors = useMemo(
    () => (data?.riskFactors ?? []).filter((factor) => factor.contribution >= 20),
    [data?.riskFactors],
  );

  const highlightedHistoryEventIdSet = useMemo(
    () => new Set(highlightedHistoryEventIds),
    [highlightedHistoryEventIds],
  );

  const statusMutation = useMutation({
    mutationFn: (payload: DecisionPayload) => updateOperationStatus(id, payload),

    onMutate: async (payload): Promise<MutationContext> => {
      await queryClient.cancelQueries({ queryKey: ['operation', id] });
      await queryClient.cancelQueries({ queryKey: ['operations'] });

      const previousOperation = queryClient.getQueryData<OperationDetails>(['operation', id]);
      const previousOperationsLists = queryClient.getQueriesData<GetOperationsResponse>({
        queryKey: ['operations'],
      });

      if (previousOperation) {
        queryClient.setQueryData<OperationDetails>(
          ['operation', id],
          applyOptimisticDecisionToOperationDetails(previousOperation, payload),
        );
      }

      previousOperationsLists.forEach(([queryKey, response]) => {
        if (!response) return;

        queryClient.setQueryData<GetOperationsResponse>(
          queryKey,
          applyOptimisticDecisionToOperationsResponse(response, [id], payload),
        );
      });

      setErrorMessage('');

      return {
        previousOperation,
        previousOperationsLists,
      };
    },

    onSuccess: (updatedOperation) => {
      queryClient.setQueryData(['operation', id], updatedOperation);
      setSuccessMessage(`Статус обновлён: ${updatedOperation.status}`);
      setPendingStatus(null);
    },

    onError: async (mutationError, _payload, context) => {
      if (context?.previousOperation) {
        queryClient.setQueryData(['operation', id], context.previousOperation);
      }

      context?.previousOperationsLists.forEach(([queryKey, response]) => {
        queryClient.setQueryData(queryKey, response);
      });

      setErrorMessage(getMutationErrorMessage(mutationError));
      setSuccessMessage('');
      setPendingStatus(null);

      if (mutationError instanceof ApiError && mutationError.status === 409) {
        await queryClient.invalidateQueries({ queryKey: ['operations'] });
        await queryClient.invalidateQueries({ queryKey: ['operation', id] });
      }
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

        <Typography variant="h4">Case Review</Typography>
        <Typography variant="body2" color="text.secondary">
          Экран расследования операции: explainable risk scoring, decision workflow, audit trail и live-обновления карточки.
        </Typography>
      </Stack>

      {liveMessage ? (
        <Alert
          severity="info"
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={() => setLiveMessage('')}>
              Hide
            </Button>
          }
        >
          {liveMessage}
        </Alert>
      ) : null}

      {isLoading && <CircularProgress />}

      {isError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => void refetch()}>
              Retry
            </Button>
          }
        >
          {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
      )}

      {data && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, xl: 8 }}>
            <Card>
              <CardContent>
                <Stack
                  direction={{ xs: 'column', lg: 'row' }}
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

                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip label={data.status} color={getStatusColor(data.status)} />
                    <Chip label={`risk: ${data.riskLevel}`} color={getRiskColor(data.riskLevel)} />
                    <Chip label={`score: ${data.riskScore}/100`} />
                    <Chip color="success" label="live" />
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
                      Updated at
                    </Typography>
                    <Typography variant="body1">
                      {new Date(data.updatedAt).toLocaleString()}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" color="text.secondary">
                      Analyst summary
                    </Typography>
                    <Typography variant="body1">{data.analystSummary}</Typography>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" color="text.secondary">
                      Recommended action
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: getRecommendedActionColor(data.recommendedAction), fontWeight: 600 }}
                    >
                      {data.recommendedAction}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Explainable risk scoring
                </Typography>

                <Stack spacing={2}>
                  {data.riskFactors.map((factor) => (
                    <Box key={factor.code}>
                      <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        justifyContent="space-between"
                        spacing={1}
                        sx={{ mb: 1 }}
                      >
                        <Box>
                          <Typography variant="subtitle2">{factor.label}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {factor.value}
                          </Typography>
                        </Box>

                        <Chip label={formatRiskFactorContribution(factor)} />
                      </Stack>

                      <LinearProgress
                        variant="determinate"
                        value={Math.min(100, factor.contribution * 2.5)}
                        color={factor.contribution >= 20 ? 'error' : 'warning'}
                        sx={{ height: 8, borderRadius: 999 }}
                      />
                    </Box>
                  ))}
                </Stack>

                <Divider sx={{ my: 3 }} />

                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  High-impact signals
                </Typography>

                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  {highImpactFactors.map((factor) => (
                    <Chip key={factor.code} color="error" label={factor.label} />
                  ))}

                  {highImpactFactors.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No high-impact risk factors.
                    </Typography>
                  ) : null}
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Audit trail
                </Typography>

                <List>
                  {data.history.map((event, index) => {
                    const isHighlighted = highlightedHistoryEventIdSet.has(event.id);

                    return (
                      <ListItem
                        key={event.id}
                        divider={index < data.history.length - 1}
                        disableGutters
                        alignItems="flex-start"
                        sx={{
                          px: 1,
                          borderRadius: 1,
                          bgcolor: isHighlighted ? 'rgba(255, 193, 7, 0.12)' : 'transparent',
                          transition: 'background-color 300ms ease',
                        }}
                      >
                        <ListItemText
                          primary={
                            <Stack
                              direction={{ xs: 'column', md: 'row' }}
                              spacing={1}
                              alignItems={{ xs: 'flex-start', md: 'center' }}
                            >
                              <Typography variant="subtitle2">{event.type}</Typography>
                              <Chip size="small" label={event.actor} />
                              {event.reason ? <Chip size="small" variant="outlined" label={event.reason} /> : null}
                              {isHighlighted ? <Chip size="small" color="warning" label="live" /> : null}
                            </Stack>
                          }
                          secondary={
                            <Stack spacing={1} sx={{ mt: 1 }}>
                              <Typography variant="body2">
                                {new Date(event.timestamp).toLocaleString()} — {event.comment}
                              </Typography>

                              {event.changes.length > 0 ? (
                                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                  {event.changes.map((change) => (
                                    <Chip
                                      key={`${event.id}_${change.field}`}
                                      size="small"
                                      variant="outlined"
                                      label={`${change.field}: ${change.before ?? '—'} → ${change.after ?? '—'}`}
                                    />
                                  ))}
                                </Stack>
                              ) : null}
                            </Stack>
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, xl: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Decision workflow
                </Typography>

                <Stack spacing={1} sx={{ mb: 3 }}>
                  <Chip
                    label={`Risk level: ${data.riskLevel}`}
                    color={getRiskColor(data.riskLevel)}
                  />
                  <Chip label={`Risk score: ${data.riskScore}/100`} />
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
                  Analyst actions
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

            <Card sx={{ mt: 3 }}>
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
                        secondary={`${operation.amount} ${operation.currency} • ${new Date(operation.createdAt).toLocaleString()}`}
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