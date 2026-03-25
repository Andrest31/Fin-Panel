import { Alert, Box, Button, CircularProgress, Snackbar } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { getOperationById, type OperationStatus } from '@/entities/operation/api/getOperations';
import { DecisionDialog } from '@/features/operation-actions/ui/DecisionDialog';
import { CollaborationActionDialog } from '@/features/operation-collaboration/ui/CollaborationActionDialog';
import { OperationDetailsHeader } from './components/OperationDetailsHeader';
import { OperationDetailsMainColumn } from './components/OperationDetailsMainColumn';
import { OperationDetailsSidebar } from './components/OperationDetailsSidebar';
import { useOperationCollaborationMutation } from './hooks/useOperationCollaborationMutation';
import { useOperationDetailsRealtime } from './hooks/useOperationDetailsRealtime';
import { useOperationStatusMutation } from './hooks/useOperationStatusMutation';
import type { CollaborationAction } from './model/types';

export function OperationDetailsPage() {
  const { id = '' } = useParams();
  const queryClient = useQueryClient();

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [pendingStatus, setPendingStatus] = useState<OperationStatus | null>(null);
  const [pendingCollaborationAction, setPendingCollaborationAction] =
    useState<CollaborationAction | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['operation', id],
    queryFn: () => getOperationById(id),
    enabled: Boolean(id),
    refetchInterval: import.meta.env.MODE === 'test' ? false : 7000,
    refetchIntervalInBackground: true,
  });

  const {
    liveMessage,
    setLiveMessage,
    highlightedHistoryEventIdSet,
    highImpactFactors,
  } = useOperationDetailsRealtime(data);

  const statusMutation = useOperationStatusMutation({
    id,
    onSuccess: (status) => {
      setSuccessMessage(`Статус обновлён: ${status}`);
      setErrorMessage('');
      setPendingStatus(null);
    },
    onError: (message) => {
      setErrorMessage(message);
      setSuccessMessage('');
      setPendingStatus(null);
    },
    onConflict: async () => {
      await queryClient.invalidateQueries({ queryKey: ['operations'] });
      await queryClient.invalidateQueries({ queryKey: ['operation', id] });
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['operations'] });
      await queryClient.invalidateQueries({ queryKey: ['operation', id] });
    },
  });

  const collaborationMutation = useOperationCollaborationMutation({
    id,
    onSuccess: () => {
      setSuccessMessage('Collaboration workflow updated');
      setErrorMessage('');
      setPendingCollaborationAction(null);
    },
    onError: (message) => {
      setErrorMessage(message);
      setPendingCollaborationAction(null);
    },
    onConflict: async () => {
      await queryClient.invalidateQueries({ queryKey: ['operation', id] });
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['operations'] });
      await queryClient.invalidateQueries({ queryKey: ['operation', id] });
    },
  });

  return (
    <Box sx={{ p: 3 }}>
      <OperationDetailsHeader />

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

      {isLoading ? <CircularProgress /> : null}

      {isError ? (
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
      ) : null}

      {data ? (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, xl: 8 }}>
            <OperationDetailsMainColumn
              data={data}
              highImpactFactors={highImpactFactors}
              highlightedHistoryEventIdSet={highlightedHistoryEventIdSet}
            />
          </Grid>

          <Grid size={{ xs: 12, xl: 4 }}>
            <OperationDetailsSidebar
              data={data}
              isStatusPending={statusMutation.isPending}
              isCollaborationPending={collaborationMutation.isPending}
              onOpenDecision={setPendingStatus}
              onOpenCollaboration={setPendingCollaborationAction}
            />
          </Grid>
        </Grid>
      ) : null}

      <DecisionDialog
        open={Boolean(pendingStatus) && Boolean(data)}
        targetLabel={data?.merchant ?? 'operation'}
        status={pendingStatus}
        isPending={statusMutation.isPending}
        onClose={() => {
          if (!statusMutation.isPending) {
            setPendingStatus(null);
          }
        }}
        onSubmit={({ reason, comment }) => {
          if (!pendingStatus) return;

          statusMutation.mutate({
            status: pendingStatus,
            reason,
            comment,
          });
        }}
      />

      <CollaborationActionDialog
        open={Boolean(pendingCollaborationAction)}
        action={pendingCollaborationAction}
        isPending={collaborationMutation.isPending}
        onClose={() => {
          if (!collaborationMutation.isPending) {
            setPendingCollaborationAction(null);
          }
        }}
        onSubmit={(payload) => {
          if (!pendingCollaborationAction) return;

          collaborationMutation.mutate({
            action: pendingCollaborationAction,
            ...payload,
          });
        }}
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
