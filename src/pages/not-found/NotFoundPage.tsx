import { Button, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <Stack spacing={2} alignItems="flex-start">
      <Typography variant="h4">404</Typography>
      <Typography color="text.secondary">Страница не найдена.</Typography>
      <Button component={Link} to="/" variant="contained">
        На главную
      </Button>
    </Stack>
  );
}
