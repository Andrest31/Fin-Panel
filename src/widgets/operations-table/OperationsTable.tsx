import {
  Box,
  Checkbox,
  Chip,
  Link,
  Paper,
  Stack,
  Typography,
  alpha,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import type { Operation } from '@/entities/operation/api/getOperations';

type OperationsTableProps = {
  operations: Operation[];
  selectedIds: string[];
  onToggleOne: (id: string) => void;
  onToggleAll: (idsOnPage: string[]) => void;
  highlightedIds?: string[];
};

const ROW_HEIGHT = 76;
const OVERSCAN = 8;
const VIEWPORT_HEIGHT = 620;

function getRiskChipColor(riskLevel: Operation['riskLevel']) {
  if (riskLevel === 'high') return 'error';
  if (riskLevel === 'medium') return 'warning';
  return 'success';
}

function getStatusChipColor(status: Operation['status']) {
  if (status === 'approved') return 'success';
  if (status === 'blocked' || status === 'flagged') return 'error';
  if (status === 'in_review') return 'warning';
  return 'default';
}

function getPriorityChipColor(priority: Operation['priority']) {
  if (priority === 'critical') return 'error';
  if (priority === 'high') return 'warning';
  if (priority === 'medium') return 'info';
  return 'default';
}

function getSlaChipColor(slaState: Operation['slaState']) {
  if (slaState === 'breached') return 'error';
  if (slaState === 'at_risk') return 'warning';
  if (slaState === 'healthy') return 'success';
  return 'default';
}

function formatQueueLabel(queue: Operation['queue']) {
  if (queue === 'manual_review') return 'Manual review';
  if (queue === 'senior_review') return 'Senior review';
  if (queue === 'customer_confirmation') return 'Customer check';
  return 'Compliance';
}

function formatSlaLabel(operation: Operation) {
  if (operation.slaState === 'resolved') return 'Resolved';
  if (!operation.slaDeadline) return 'No deadline';
  if (operation.slaState === 'breached') return 'Breached';
  if (operation.slaState === 'at_risk') return 'At risk';
  return new Date(operation.slaDeadline).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function OperationsTable({
  operations,
  selectedIds,
  onToggleOne,
  onToggleAll,
  highlightedIds = [],
}: OperationsTableProps) {
  const [scrollTop, setScrollTop] = useState(0);

  const highlightedSet = useMemo(() => new Set(highlightedIds), [highlightedIds]);

  const allSelected =
    operations.length > 0 && operations.every((operation) => selectedIds.includes(operation.id));

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
    const endIndex = Math.min(
      operations.length,
      Math.ceil((scrollTop + VIEWPORT_HEIGHT) / ROW_HEIGHT) + OVERSCAN,
    );

    return { startIndex, endIndex };
  }, [operations.length, scrollTop]);

  const visibleRows = operations.slice(visibleRange.startIndex, visibleRange.endIndex);
  const totalHeight = operations.length * ROW_HEIGHT;

  return (
    <Paper
      sx={{
        overflow: 'hidden',
        borderRadius: 6,
        bgcolor: alpha('#ffffff', 0.74),
        backdropFilter: 'blur(14px)',
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '52px 1.7fr 0.95fr 1fr 1fr 1.1fr 1fr 1fr',
          alignItems: 'center',
          gap: 2,
          px: 2,
          py: 1.5,
          position: 'sticky',
          top: 0,
          zIndex: 2,
          bgcolor: alpha('#f8faff', 0.92),
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Checkbox
          size="small"
          checked={allSelected}
          indeterminate={selectedIds.length > 0 && !allSelected}
          onChange={() => onToggleAll(operations.map((operation) => operation.id))}
        />
        <Typography variant="subtitle2">Operation</Typography>
        <Typography variant="subtitle2">Amount</Typography>
        <Typography variant="subtitle2">Workflow</Typography>
        <Typography variant="subtitle2">Risk</Typography>
        <Typography variant="subtitle2">Queue / SLA</Typography>
        <Typography variant="subtitle2">Customer</Typography>
        <Typography variant="subtitle2">Updated</Typography>
      </Box>

      <Box
        sx={{
          height: VIEWPORT_HEIGHT,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
        onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
      >
        <Box sx={{ position: 'relative', height: totalHeight }}>
          {visibleRows.map((operation, index) => {
            const absoluteIndex = visibleRange.startIndex + index;
            const top = absoluteIndex * ROW_HEIGHT;
            const isSelected = selectedIds.includes(operation.id);
            const isHighlighted = highlightedSet.has(operation.id);

            return (
              <Box
                key={operation.id}
                sx={{
                  position: 'absolute',
                  top,
                  left: 0,
                  right: 0,
                  height: ROW_HEIGHT,
                  display: 'grid',
                  gridTemplateColumns: '52px 1.7fr 0.95fr 1fr 1fr 1.1fr 1fr 1fr',
                  alignItems: 'center',
                  gap: 2,
                  px: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  bgcolor: isHighlighted
                    ? alpha('#f59e0b', 0.12)
                    : isSelected
                      ? alpha('#5b6cff', 0.08)
                      : 'transparent',
                  transition: 'background-color 240ms ease',
                }}
              >
                <Checkbox
                  size="small"
                  checked={isSelected}
                  onChange={() => onToggleOne(operation.id)}
                />

                <Stack spacing={0.35} sx={{ minWidth: 0 }}>
                  <Link
                    component={RouterLink}
                    to={`/operations/${operation.id}`}
                    underline="none"
                    color="inherit"
                    sx={{
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      '&:hover': {
                        color: 'primary.main',
                      },
                    }}
                  >
                    {operation.merchant}
                  </Link>

                  <Typography variant="caption" color="text.secondary" noWrap>
                    {operation.id}
                  </Typography>
                </Stack>

                <Stack spacing={0.35}>
                  <Typography variant="body2" fontWeight={600}>
                    {operation.amount} {operation.currency}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {operation.paymentMethod.toUpperCase()}
                  </Typography>
                </Stack>

                <Stack spacing={0.6}>
                  <Chip
                    size="small"
                    label={operation.status}
                    color={getStatusChipColor(operation.status)}
                  />
                  <Chip
                    size="small"
                    variant="outlined"
                    label={operation.priority}
                    color={getPriorityChipColor(operation.priority)}
                  />
                </Stack>

                <Stack spacing={0.6}>
                  <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                    <Chip
                      size="small"
                      label={operation.riskLevel}
                      color={getRiskChipColor(operation.riskLevel)}
                    />
                    <Chip size="small" variant="outlined" label={`score ${operation.riskScore}`} />
                  </Stack>

                  {isHighlighted ? <Chip size="small" color="warning" label="new event" /> : null}
                </Stack>

                <Stack spacing={0.6} sx={{ minWidth: 0 }}>
                  <Chip size="small" variant="outlined" label={formatQueueLabel(operation.queue)} />
                  <Chip
                    size="small"
                    color={getSlaChipColor(operation.slaState)}
                    label={`SLA: ${formatSlaLabel(operation)}`}
                  />
                </Stack>

                <Stack spacing={0.35} sx={{ minWidth: 0 }}>
                  <Typography variant="body2" noWrap>
                    {operation.customerId}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {operation.country}, {operation.city}
                  </Typography>
                </Stack>

                <Typography variant="body2" color="text.secondary" noWrap>
                  {new Date(operation.updatedAt).toLocaleString()}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Paper>
  );
}