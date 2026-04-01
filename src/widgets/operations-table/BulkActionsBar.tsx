import { Button, Paper, Stack, Typography, alpha } from '@mui/material';
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
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 5,
        bgcolor: alpha('#ffffff', 0.72),
        backdropFilter: 'blur(14px)',
      }}
    >
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', lg: 'center' }}
        justifyContent="space-between"
      >
        <div>
          <Typography variant="subtitle1">Bulk workflow actions</Typography>
          <Typography variant="body2" color="text.secondary">
            Selected operations: {selectedCount}
          </Typography>
        </div>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} useFlexGap flexWrap="wrap">
          <Button variant="contained" disabled={isPending} onClick={() => onApply('approved')}>
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
            color="warning"
            disabled={isPending}
            onClick={() => onApply('flagged')}
          >
            Flag
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
            Clear selection
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}