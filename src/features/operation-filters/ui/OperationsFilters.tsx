import { Button, MenuItem, Paper, Stack, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import type { OperationsFilterValues } from '../model/types';

type OperationsFiltersProps = {
  value: OperationsFilterValues;
  onChange: (nextValue: OperationsFilterValues) => void;
  onReset: () => void;
};

export function OperationsFilters({ value, onChange, onReset }: OperationsFiltersProps) {
  const searchDebounceMs = import.meta.env.MODE === 'test' ? 0 : 400;

  const [searchInput, setSearchInput] = useState(value.search);
  const debouncedSearch = useDebouncedValue(searchInput, searchDebounceMs);

  useEffect(() => {
    setSearchInput(value.search);
  }, [value.search]);

  useEffect(() => {
    if (debouncedSearch !== value.search) {
      onChange({
        ...value,
        page: 1,
        search: debouncedSearch,
      });
    }
  }, [debouncedSearch, onChange, value]);

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            label="Search merchant"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            fullWidth
          />

          <TextField
            select
            label="Status"
            value={value.status}
            onChange={(event) =>
              onChange({
                ...value,
                page: 1,
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
                page: 1,
                riskLevel: event.target.value as OperationsFilterValues['riskLevel'],
              })
            }
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="high">High</MenuItem>
          </TextField>
        </Stack>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            select
            label="Sort by"
            value={value.sortBy}
            onChange={(event) =>
              onChange({
                ...value,
                page: 1,
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
                page: 1,
                order: event.target.value as OperationsFilterValues['order'],
              })
            }
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="desc">Desc</MenuItem>
            <MenuItem value="asc">Asc</MenuItem>
          </TextField>

          <TextField
            select
            label="Payment method"
            value={value.paymentMethod}
            onChange={(event) =>
              onChange({
                ...value,
                page: 1,
                paymentMethod: event.target.value as OperationsFilterValues['paymentMethod'],
              })
            }
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="card">Card</MenuItem>
            <MenuItem value="sbp">SBP</MenuItem>
          </TextField>

          <TextField
            select
            label="Country"
            value={value.country}
            onChange={(event) =>
              onChange({
                ...value,
                page: 1,
                country: event.target.value as OperationsFilterValues['country'],
              })
            }
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="RU">RU</MenuItem>
          </TextField>
        </Stack>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            label="Min amount"
            value={value.minAmount}
            onChange={(event) =>
              onChange({
                ...value,
                page: 1,
                minAmount: event.target.value,
              })
            }
            type="number"
            fullWidth
          />

          <TextField
            label="Max amount"
            value={value.maxAmount}
            onChange={(event) =>
              onChange({
                ...value,
                page: 1,
                maxAmount: event.target.value,
              })
            }
            type="number"
            fullWidth
          />

          <TextField
            label="Date from"
            value={value.dateFrom}
            onChange={(event) =>
              onChange({
                ...value,
                page: 1,
                dateFrom: event.target.value,
              })
            }
            type="date"
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <TextField
            label="Date to"
            value={value.dateTo}
            onChange={(event) =>
              onChange({
                ...value,
                page: 1,
                dateTo: event.target.value,
              })
            }
            type="date"
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Stack>

        <Stack direction="row" justifyContent="flex-end">
          <Button variant="text" onClick={onReset}>
            Reset filters
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}