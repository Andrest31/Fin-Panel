import {
  Box,
  Checkbox,
  Chip,
  Link,
  Paper,
  Stack,
  Typography,
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

const ROW_HEIGHT = 68;
const OVERSCAN = 8;
const VIEWPORT_HEIGHT = 560;

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
    <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '52px 1.6fr 1fr 1fr 1fr 1fr 1.1fr',
          alignItems: 'center',
          gap: 2,
          px: 2,
          py: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
          position: 'sticky',
          top: 0,
          zIndex: 2,
          bgcolor: 'background.paper',
        }}
      >
        <Checkbox
          size="small"
          checked={allSelected}
          indeterminate={selectedIds.length > 0 && !allSelected}
          onChange={() => onToggleAll(operations.map((operation) => operation.id))}
        />
        <Typography variant="subtitle2">Merchant</Typography>
        <Typography variant="subtitle2">Amount</Typography>
        <Typography variant="subtitle2">Status</Typography>
        <Typography variant="subtitle2">Risk</Typography>
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
                  gridTemplateColumns: '52px 1.6fr 1fr 1fr 1fr 1fr 1.1fr',
                  alignItems: 'center',
                  gap: 2,
                  px: 2,
                  borderBottom: 1,
                  borderColor: 'divider',
                  bgcolor: isHighlighted
                    ? 'rgba(255, 193, 7, 0.12)'
                    : isSelected
                      ? 'action.selected'
                      : 'background.paper',
                  transition: 'background-color 300ms ease',
                }}
              >
                <Checkbox
                  size="small"
                  checked={isSelected}
                  onChange={() => onToggleOne(operation.id)}
                />

                <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                  <Link
                    component={RouterLink}
                    to={`/operations/${operation.id}`}
                    underline="hover"
                    color="inherit"
                    sx={{
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {operation.merchant}
                  </Link>

                  <Typography variant="caption" color="text.secondary" noWrap>
                    {operation.id}
                  </Typography>
                </Stack>

                <Typography variant="body2">
                  {operation.amount} {operation.currency}
                </Typography>

                <Chip
                  size="small"
                  label={operation.status}
                  color={getStatusChipColor(operation.status)}
                />

                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    size="small"
                    label={operation.riskLevel}
                    color={getRiskChipColor(operation.riskLevel)}
                  />
                  <Chip size="small" variant="outlined" label={operation.riskScore} />
                  {isHighlighted ? <Chip size="small" color="warning" label="new" /> : null}
                </Stack>

                <Typography variant="body2" noWrap>
                  {operation.customerId}
                </Typography>

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