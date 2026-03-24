import { MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import {
  getMockDataVolume,
  getMockDataVolumeLabel,
  getMockScenario,
  setMockDataVolume,
  setMockScenario,
  type MockDataVolume,
  type MockScenario,
} from '@/shared/lib/mockScenario';

const scenarioOptions: Array<{ value: MockScenario; label: string }> = [
  { value: 'normal', label: 'Normal' },
  { value: 'slow', label: 'Slow response' },
  { value: 'flaky', label: 'Flaky random errors' },
  { value: 'rate_limit', label: '429 rate limit' },
  { value: 'server_error', label: '500 server error' },
  { value: 'conflict', label: '409 conflict' },
];

const volumeOptions: MockDataVolume[] = ['small', 'medium', 'large', 'xlarge'];

export function MockScenarioSwitcher() {
  const [scenario, setScenarioState] = useState<MockScenario>('normal');
  const [volume, setVolumeState] = useState<MockDataVolume>('medium');

  useEffect(() => {
    setScenarioState(getMockScenario());
    setVolumeState(getMockDataVolume());
  }, []);

  const handleScenarioChange = (value: MockScenario) => {
    setScenarioState(value);
    setMockScenario(value);
    window.dispatchEvent(new CustomEvent('mock-scenario-changed', { detail: value }));
  };

  const handleVolumeChange = (value: MockDataVolume) => {
    setVolumeState(value);
    setMockDataVolume(value);
    window.dispatchEvent(new CustomEvent('mock-volume-changed', { detail: value }));
  };

  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        <Typography variant="body2" color="text.secondary">
          Mock controls
        </Typography>

        <TextField
          select
          size="small"
          label="Scenario"
          value={scenario}
          onChange={(event) => handleScenarioChange(event.target.value as MockScenario)}
          fullWidth
        >
          {scenarioOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          size="small"
          label="Data volume"
          value={volume}
          onChange={(event) => handleVolumeChange(event.target.value as MockDataVolume)}
          fullWidth
        >
          {volumeOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {getMockDataVolumeLabel(option)}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
    </Paper>
  );
}