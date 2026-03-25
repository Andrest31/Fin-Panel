import { Box, Chip, Stack, Typography } from '@mui/material';

type Props = {
  isRefreshing: boolean;
};

export function DashboardHeader({ isRefreshing }: Props) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-start', md: 'center' }}
      sx={{ mb: 3 }}
    >
      <Box>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Fraud Monitoring Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Сводка по потоку операций, рискам и последним изменениям.
        </Typography>
      </Box>

      {isRefreshing ? <Chip label="Refreshing..." color="warning" /> : null}
    </Stack>
  );
}
