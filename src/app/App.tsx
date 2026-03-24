import { AppBar, Box, Button, CssBaseline, Stack, ThemeProvider, Toolbar, createTheme } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes, Link as RouterLink, useLocation } from 'react-router-dom';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { OperationDetailsPage } from '../pages/operation-details/OperationDetailsPage';
import { OperationsListPage } from '../pages/operations-list/OperationsListPage';

const queryClient = new QueryClient();

const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

function AppNavigation() {
  const location = useLocation();

  const isDashboard = location.pathname.startsWith('/dashboard');
  const isOperations = location.pathname.startsWith('/operations');

  return (
    <AppBar position="static" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Toolbar>
        <Stack direction="row" spacing={1}>
          <Button
            component={RouterLink}
            to="/dashboard"
            variant={isDashboard ? 'contained' : 'text'}
          >
            Dashboard
          </Button>

          <Button
            component={RouterLink}
            to="/operations"
            variant={isOperations ? 'contained' : 'text'}
          >
            Operations
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <AppNavigation />
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/operations" element={<OperationsListPage />} />
              <Route path="/operations/:id" element={<OperationDetailsPage />} />
            </Routes>
          </Box>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}