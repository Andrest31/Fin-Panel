import { MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import {
  getMockScenario,
  setMockScenario,
  type MockScenario,
} from '@/shared/lib/mockScenario';

const options: Array<{ value: MockScenario; label: string }> = [
  { value: 'normal', label: 'Normal' },
  { value: 'slow', label: 'Slow response' },
  { value: 'flaky', label: 'Flaky random errors' },
  { value: 'rate_limit', label: '429 rate limit' },
  { value: 'server_error', label: '500 server error' },
  { value: 'conflict', label: '409 conflict' },
];

export function MockScenarioSwitcher() {
  const [scenario, setScenario] = useState<MockScenario>('normal');

  useEffect(() => {
    setScenario(getMockScenario());
  }, []);

  const handleChange = (value: MockScenario) => {
    setScenario(value);
    setMockScenario(value);
    window.dispatchEvent(new CustomEvent('mock-scenario-changed', { detail: value }));
  };

  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        <Typography variant="body2" color="text.secondary">
          Mock API scenario
        </Typography>

        <TextField
          select
          size="small"
          label="Scenario"
          value={scenario}
          onChange={(event) => handleChange(event.target.value as MockScenario)}
          fullWidth
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
    </Paper>
  );
}