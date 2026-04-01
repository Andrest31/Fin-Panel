import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Chip,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
  alpha,
} from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { useEffect, useMemo, useState } from 'react';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import type { OperationsFilterValues } from '../model/types';

type OperationsFiltersProps = {
  value: OperationsFilterValues;
  onChange: (nextValue: OperationsFilterValues) => void;
  onReset: () => void;
};

const presetDefinitions: Array<{
  key: OperationsFilterValues['preset'];
  label: string;
}> = [
  { key: 'all', label: 'All cases' },
  { key: 'high_risk', label: 'High risk' },
  { key: 'manual_review', label: 'Manual review' },
  { key: 'escalated', label: 'Escalated' },
  { key: 'sla_breached', label: 'SLA breached' },
  { key: 'active', label: 'Active queue' },
];

function applyPreset(
  preset: OperationsFilterValues['preset'],
  value: OperationsFilterValues,
): OperationsFilterValues {
  const base = {
    ...value,
    page: 1,
    preset,
  };

  if (preset === 'all') {
    return {
      ...base,
      status: 'all',
      riskLevel: 'all',
      queue: 'all',
      priority: 'all',
      slaState: 'all',
      activeOnly: true,
    };
  }

  if (preset === 'high_risk') {
    return {
      ...base,
      status: 'all',
      riskLevel: 'high',
      queue: 'all',
      priority: 'high',
      slaState: 'all',
      activeOnly: true,
    };
  }

  if (preset === 'manual_review') {
    return {
      ...base,
      status: 'all',
      queue: 'manual_review',
      riskLevel: 'all',
      priority: 'all',
      slaState: 'all',
      activeOnly: true,
    };
  }

  if (preset === 'escalated') {
    return {
      ...base,
      status: 'flagged',
      queue: 'senior_review',
      riskLevel: 'all',
      priority: 'high',
      slaState: 'all',
      activeOnly: true,
    };
  }

  if (preset === 'sla_breached') {
    return {
      ...base,
      status: 'all',
      riskLevel: 'all',
      queue: 'all',
      priority: 'all',
      slaState: 'breached',
      activeOnly: true,
    };
  }

  return {
    ...base,
    status: 'all',
    riskLevel: 'all',
    queue: 'all',
    priority: 'all',
    slaState: 'all',
    activeOnly: true,
  };
}

export function OperationsFilters({ value, onChange, onReset }: OperationsFiltersProps) {
  const searchDebounceMs = import.meta.env.MODE === 'test' ? 0 : 400;

  const [searchInput, setSearchInput] = useState(value.search);
  const [expanded, setExpanded] = useState(false);
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

  const activeFiltersCount = useMemo(() => {
    return [
      value.status !== 'all',
      value.riskLevel !== 'all',
      value.queue !== 'all',
      value.priority !== 'all',
      value.slaState !== 'all',
      value.paymentMethod !== 'all',
      value.country !== 'all',
      value.minAmount !== '',
      value.maxAmount !== '',
      value.dateFrom !== '',
      value.dateTo !== '',
      value.search.trim() !== '',
      value.activeOnly !== true,
    ].filter(Boolean).length;
  }, [value]);

  return (
    <Accordion
      expanded={expanded}
      onChange={(_, nextExpanded) => setExpanded(nextExpanded)}
      disableGutters
      elevation={0}
      sx={{
        borderRadius: '24px !important',
        overflow: 'hidden',
        bgcolor: alpha('#ffffff', 0.74),
        backdropFilter: 'blur(16px)',
        '&::before': {
          display: 'none',
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreRoundedIcon />}
        sx={{
          px: 2.5,
          py: 1.25,
        }}
      >
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          spacing={1.5}
          alignItems={{ xs: 'flex-start', lg: 'center' }}
          justifyContent="space-between"
          sx={{ width: '100%' }}
        >
          <div>
            <Typography variant="h6">Queue controls</Typography>
            <Typography variant="body2" color="text.secondary">
              Fast triage, queue routing and SLA-first filtering.
            </Typography>
          </div>

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
            <Chip
              label={`${activeFiltersCount} filters`}
              sx={{ bgcolor: alpha('#5b6cff', 0.08), color: 'primary.main' }}
            />
            <FormControlLabel
              sx={{ m: 0 }}
              onClick={(event) => event.stopPropagation()}
              onFocus={(event) => event.stopPropagation()}
              control={
                <Switch
                  checked={value.activeOnly}
                  onChange={(event) =>
                    onChange({
                      ...value,
                      page: 1,
                      activeOnly: event.target.checked,
                    })
                  }
                />
              }
              label="Only active cases"
            />
            <Button
              variant="text"
              onClick={(event) => {
                event.stopPropagation();
                onReset();
              }}
            >
              Reset
            </Button>
          </Stack>
        </Stack>
      </AccordionSummary>

      <AccordionDetails sx={{ px: 2.5, pb: 2.5, pt: 0 }}>
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {presetDefinitions.map((preset) => {
              const selected = value.preset === preset.key;

              return (
                <Chip
                  key={preset.key}
                  label={preset.label}
                  clickable
                  color={selected ? 'primary' : 'default'}
                  variant={selected ? 'filled' : 'outlined'}
                  onClick={() => onChange(applyPreset(preset.key, value))}
                  sx={{
                    bgcolor: selected ? undefined : alpha('#ffffff', 0.55),
                  }}
                />
              );
            })}
          </Stack>

          <Stack direction={{ xs: 'column', xl: 'row' }} spacing={2}>
            <TextField
              label="Search merchant or operation ID"
              placeholder="T-Bank, coffee shop, op_..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              fullWidth
            />

            <TextField
              select
              label="Queue"
              value={value.queue}
              onChange={(event) =>
                onChange({
                  ...value,
                  page: 1,
                  preset: 'all',
                  queue: event.target.value as OperationsFilterValues['queue'],
                })
              }
              sx={{ minWidth: 190 }}
            >
              <MenuItem value="all">All queues</MenuItem>
              <MenuItem value="manual_review">Manual review</MenuItem>
              <MenuItem value="senior_review">Senior review</MenuItem>
              <MenuItem value="compliance">Compliance</MenuItem>
              <MenuItem value="customer_confirmation">Customer confirmation</MenuItem>
            </TextField>

            <TextField
              select
              label="Priority"
              value={value.priority}
              onChange={(event) =>
                onChange({
                  ...value,
                  page: 1,
                  preset: 'all',
                  priority: event.target.value as OperationsFilterValues['priority'],
                })
              }
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="all">All priorities</MenuItem>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
            </TextField>

            <TextField
              select
              label="SLA"
              value={value.slaState}
              onChange={(event) =>
                onChange({
                  ...value,
                  page: 1,
                  preset: 'all',
                  slaState: event.target.value as OperationsFilterValues['slaState'],
                })
              }
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="all">All SLA states</MenuItem>
              <MenuItem value="healthy">Healthy</MenuItem>
              <MenuItem value="at_risk">At risk</MenuItem>
              <MenuItem value="breached">Breached</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
            </TextField>
          </Stack>

          <Stack direction={{ xs: 'column', xl: 'row' }} spacing={2}>
            <TextField
              select
              label="Status"
              value={value.status}
              onChange={(event) =>
                onChange({
                  ...value,
                  page: 1,
                  preset: 'all',
                  status: event.target.value as OperationsFilterValues['status'],
                })
              }
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="all">All statuses</MenuItem>
              <MenuItem value="new">New</MenuItem>
              <MenuItem value="in_review">In review</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="blocked">Blocked</MenuItem>
              <MenuItem value="flagged">Flagged</MenuItem>
            </TextField>

            <TextField
              select
              label="Risk"
              value={value.riskLevel}
              onChange={(event) =>
                onChange({
                  ...value,
                  page: 1,
                  preset: 'all',
                  riskLevel: event.target.value as OperationsFilterValues['riskLevel'],
                })
              }
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="all">All risk levels</MenuItem>
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
                  page: 1,
                  sortBy: event.target.value as OperationsFilterValues['sortBy'],
                })
              }
              sx={{ minWidth: 170 }}
            >
              <MenuItem value="createdAt">Created at</MenuItem>
              <MenuItem value="amount">Amount</MenuItem>
              <MenuItem value="merchant">Merchant</MenuItem>
              <MenuItem value="riskScore">Risk score</MenuItem>
              <MenuItem value="priority">Priority</MenuItem>
              <MenuItem value="slaDeadline">SLA deadline</MenuItem>
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
              label="Payment"
              value={value.paymentMethod}
              onChange={(event) =>
                onChange({
                  ...value,
                  page: 1,
                  preset: 'all',
                  paymentMethod: event.target.value as OperationsFilterValues['paymentMethod'],
                })
              }
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="all">All methods</MenuItem>
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
                  preset: 'all',
                  country: event.target.value as OperationsFilterValues['country'],
                })
              }
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="RU">RU</MenuItem>
            </TextField>
          </Stack>

          <Stack direction={{ xs: 'column', xl: 'row' }} spacing={2}>
            <TextField
              label="Min amount"
              value={value.minAmount}
              onChange={(event) =>
                onChange({
                  ...value,
                  page: 1,
                  preset: 'all',
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
                  preset: 'all',
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
                  preset: 'all',
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
                  preset: 'all',
                  dateTo: event.target.value,
                })
              }
              type="date"
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Stack>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}