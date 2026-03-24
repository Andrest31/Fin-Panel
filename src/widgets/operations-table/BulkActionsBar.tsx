import { Button, Paper, Stack, Typography } from '@mui/material';
import type { OperationStatus } from '@/entities/operation/api/getOperations';

type BulkActionsBarProps = {
  selectedCount: number;
  isPending: boolean;
  onApply: (status: OperationStatus) => void;
  onReset: () => void;
};

export function BulkActionsBar({
  selectedCount,
  isPending,
  onApply,
  onReset,
}: BulkActionsBarProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        mb: 2,
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', md: 'center' }}
        justifyContent="space-between"
      >
        <Typography variant="body1">Выбрано операций: {selectedCount}</Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button
            variant="contained"
            disabled={isPending}
            onClick={() => onApply('approved')}
          >
            Approve
          </Button>

          <Button
            variant="outlined"
            color="warning"
            disabled={isPending}
            onClick={() => onApply('in_review')}
          >
            Send to review
          </Button>

          <Button
            variant="outlined"
            color="error"
            disabled={isPending}
            onClick={() => onApply('blocked')}
          >
            Block
          </Button>

          <Button variant="text" disabled={isPending} onClick={onReset}>
            Reset
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}