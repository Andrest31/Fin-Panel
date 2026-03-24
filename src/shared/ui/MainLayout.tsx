import { AppBar, Box, Button, Container, Stack, Toolbar, Typography } from '@mui/material';
import { Link, Outlet, useLocation } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/operations', label: 'Operations' },
];

export function MainLayout() {
  const location = useLocation();

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AppBar position="static" color="inherit" elevation={0}>
        <Toolbar sx={{ borderBottom: '1px solid #e5e7eb' }}>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Fin Panel
          </Typography>
          <Stack direction="row" spacing={1}>
            {navItems.map((item) => (
              <Button
                key={item.to}
                component={Link}
                to={item.to}
                variant={location.pathname === item.to ? 'contained' : 'text'}
              >
                {item.label}
              </Button>
            ))}
          </Stack>
        </Toolbar>
      </AppBar>
      <Container sx={{ py: 4 }} maxWidth="xl">
        <Outlet />
      </Container>
    </Box>
  );
}
