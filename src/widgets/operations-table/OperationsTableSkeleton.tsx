import {
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

type OperationsTableSkeletonProps = {
  rows?: number;
};

export function OperationsTableSkeleton({
  rows = 6,
}: OperationsTableSkeletonProps) {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Skeleton variant="rounded" width={20} height={20} />
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
          {Array.from({ length: rows }).map((_, index) => (
            <TableRow key={index}>
              <TableCell padding="checkbox">
                <Skeleton variant="rounded" width={20} height={20} />
              </TableCell>
              <TableCell>
                <Skeleton variant="text" width="60%" height={28} />
                <Skeleton variant="text" width="40%" height={20} />
              </TableCell>
              <TableCell>
                <Skeleton variant="text" width="70%" height={24} />
              </TableCell>
              <TableCell>
                <Skeleton variant="rounded" width={90} height={24} />
              </TableCell>
              <TableCell>
                <Skeleton variant="rounded" width={70} height={24} />
              </TableCell>
              <TableCell>
                <Skeleton variant="text" width="75%" height={24} />
              </TableCell>
              <TableCell>
                <Skeleton variant="text" width="55%" height={24} />
              </TableCell>
              <TableCell>
                <Skeleton variant="text" width="85%" height={24} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}