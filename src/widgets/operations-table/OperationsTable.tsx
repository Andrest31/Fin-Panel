import { Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Link } from 'react-router-dom';
import { Operation } from '@/entities/operation/model/types';

interface OperationsTableProps {
  items: Operation[];
}

export function OperationsTable({ items }: OperationsTableProps) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Merchant</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Risk</TableCell>
            <TableCell>Country</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} hover>
              <TableCell>
                <Link to={`/operations/${item.id}`}>{item.id}</Link>
              </TableCell>
              <TableCell>{item.merchant}</TableCell>
              <TableCell>{item.amount.toLocaleString('ru-RU')} {item.currency}</TableCell>
              <TableCell>{item.status}</TableCell>
              <TableCell>
                <Chip label={`${item.riskLevel} · ${item.score}`} size="small" />
              </TableCell>
              <TableCell>{item.country}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
