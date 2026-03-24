import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './AppShell';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { OperationDetailsPage } from '../pages/operation-details/OperationDetailsPage';
import { OperationsListPage } from '../pages/operations-list/OperationsListPage';

const queryClient = new QueryClient();

const theme = createTheme({
  palette: {
    mode: 'light',
  },
  shape: {
    borderRadius: 10,
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route element={<AppShell />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/operations" element={<OperationsListPage />} />
              <Route path="/operations/:id" element={<OperationDetailsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}