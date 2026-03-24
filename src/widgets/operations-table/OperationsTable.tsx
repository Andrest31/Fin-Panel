import {
  Checkbox,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import type { Operation } from '@/entities/operation/api/getOperations';
import { RiskLevelChip } from '@/entities/operation/ui/RiskLevelChip';
import { StatusChip } from '@/entities/operation/ui/StatusChip';

type OperationsTableProps = {
  operations: Operation[];
  selectedIds: string[];
  onToggleOne: (id: string) => void;
  onToggleAll: (ids: string[]) => void;
};

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function OperationsTable({
  operations,
  selectedIds,
  onToggleOne,
  onToggleAll,
}: OperationsTableProps) {
  const allIds = operations.map((operation) => operation.id);
  const selectedSet = new Set(selectedIds);

  const selectedOnPageCount = allIds.filter((id) => selectedSet.has(id)).length;
  const allSelected = operations.length > 0 && selectedOnPageCount === operations.length;
  const indeterminate =
    selectedOnPageCount > 0 && selectedOnPageCount < operations.length;

  const handleToggleAll = () => {
    onToggleAll(allIds);
  };

  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{
        maxHeight: 620,
      }}
    >
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                checked={allSelected}
                indeterminate={indeterminate}
                onChange={handleToggleAll}
              />
            </TableCell>
            <TableCell>Merchant</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Risk</TableCell>
            <TableCell>Location</TableCell>
            <TableCell>Payment</TableCell>
            <TableCell>Updated</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {operations.map((operation) => {
            const isSelected = selectedSet.has(operation.id);

            return (
              <TableRow
                key={operation.id}
                hover
                selected={isSelected}
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                }}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={isSelected}
                    onChange={() => onToggleOne(operation.id)}
                  />
                </TableCell>

                <TableCell>
                  <Typography
                    component={RouterLink}
                    to={`/operations/${operation.id}`}
                    sx={{
                      color: 'inherit',
                      textDecoration: 'none',
                      fontWeight: 500,
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    {operation.merchant}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {operation.id}
                  </Typography>
                </TableCell>

                <TableCell>{formatAmount(operation.amount, operation.currency)}</TableCell>

                <TableCell>
                  <StatusChip status={operation.status} />
                </TableCell>

                <TableCell>
                  <RiskLevelChip riskLevel={operation.riskLevel} />
                </TableCell>

                <TableCell>
                  {operation.country} / {operation.city}
                </TableCell>

                <TableCell>{operation.paymentMethod}</TableCell>

                <TableCell>{new Date(operation.updatedAt).toLocaleString()}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}