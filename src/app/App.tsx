import { CssBaseline, ThemeProvider, alpha, createTheme } from '@mui/material';
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
    primary: {
      main: '#5b6cff',
      light: '#8190ff',
      dark: '#4452dd',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#7c4dff',
    },
    background: {
      default: '#f3f5fb',
      paper: '#ffffff',
    },
    success: {
      main: '#1f9d72',
    },
    warning: {
      main: '#f59e0b',
    },
    error: {
      main: '#ef4444',
    },
    info: {
      main: '#3b82f6',
    },
    text: {
      primary: '#172033',
      secondary: '#677489',
    },
    divider: 'rgba(103, 116, 137, 0.14)',
  },
  shape: {
    borderRadius: 20,
  },
  typography: {
    fontFamily: 'Inter, Arial, sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h5: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h6: {
      fontWeight: 700,
    },
    subtitle2: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background:
            'radial-gradient(circle at top left, rgba(91,108,255,0.12), transparent 28%), radial-gradient(circle at top right, rgba(124,77,255,0.10), transparent 24%), #f3f5fb',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
      defaultProps: {
        elevation: 0,
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          boxShadow: '0 18px 50px rgba(23, 32, 51, 0.08)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          paddingInline: 16,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 600,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          backgroundColor: alpha('#ffffff', 0.72),
          '& fieldset': {
            borderColor: 'rgba(103, 116, 137, 0.14)',
          },
          '&:hover fieldset': {
            borderColor: 'rgba(91, 108, 255, 0.25)',
          },
          '&.Mui-focused fieldset': {
            borderWidth: 1,
            borderColor: '#5b6cff',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: 'none',
          backdropFilter: 'blur(14px)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'rgba(255,255,255,0.72)',
          backdropFilter: 'blur(18px)',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        toolbar: {
          paddingInline: 8,
        },
      },
    },
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