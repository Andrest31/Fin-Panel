import {
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
};

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function OperationsTable({ operations }: OperationsTableProps) {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
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
          {operations.map((operation) => (
            <TableRow
              key={operation.id}
              hover
              sx={{
                cursor: 'pointer',
                '&:last-child td, &:last-child th': { border: 0 },
              }}
            >
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
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}