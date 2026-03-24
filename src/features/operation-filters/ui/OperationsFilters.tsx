import { Button, MenuItem, Paper, Stack, TextField } from '@mui/material';
import type { OperationsFilterValues } from '../model/types';

type OperationsFiltersProps = {
  value: OperationsFilterValues;
  onChange: (nextValue: OperationsFilterValues) => void;
  onReset: () => void;
};

export function OperationsFilters({ value, onChange, onReset }: OperationsFiltersProps) {
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <TextField
          label="Search merchant"
          value={value.search}
          onChange={(event) =>
            onChange({
              ...value,
              search: event.target.value,
            })
          }
          fullWidth
        />

        <TextField
          select
          label="Status"
          value={value.status}
          onChange={(event) =>
            onChange({
              ...value,
              status: event.target.value as OperationsFilterValues['status'],
            })
          }
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="new">New</MenuItem>
          <MenuItem value="in_review">In review</MenuItem>
          <MenuItem value="approved">Approved</MenuItem>
          <MenuItem value="blocked">Blocked</MenuItem>
          <MenuItem value="flagged">Flagged</MenuItem>
        </TextField>

        <TextField
          select
          label="Risk level"
          value={value.riskLevel}
          onChange={(event) =>
            onChange({
              ...value,
              riskLevel: event.target.value as OperationsFilterValues['riskLevel'],
            })
          }
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="low">Low</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="high">High</MenuItem>
        </TextField>

        <TextField
          select
          label="Sort by"
          value={value.sortBy}
          onChange={(event) =>
            onChange({
              ...value,
              sortBy: event.target.value as OperationsFilterValues['sortBy'],
            })
          }
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="createdAt">Created at</MenuItem>
          <MenuItem value="amount">Amount</MenuItem>
          <MenuItem value="merchant">Merchant</MenuItem>
        </TextField>

        <TextField
          select
          label="Order"
          value={value.order}
          onChange={(event) =>
            onChange({
              ...value,
              order: event.target.value as OperationsFilterValues['order'],
            })
          }
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="desc">Desc</MenuItem>
          <MenuItem value="asc">Asc</MenuItem>
        </TextField>

        <Button variant="outlined" onClick={onReset}>
          Reset
        </Button>
      </Stack>
    </Paper>
  );
}