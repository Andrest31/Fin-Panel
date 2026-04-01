import {
  AppBar,
  Box,
  Chip,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
  alpha,
} from '@mui/material';
import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom';
import { MockScenarioSwitcher } from '@/features/mock-scenarios/ui/MockScenarioSwitcher';

const drawerWidth = 292;

const navItems = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    description: 'Overview, metrics and live flow',
  },
  {
    label: 'Operations',
    to: '/operations',
    description: 'Queues, SLA and analyst actions',
  },
];

export function AppShell() {
  const location = useLocation();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: alpha('#ffffff', 0.58),
        }}
      >
        <Toolbar sx={{ minHeight: 76 }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={1.5}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
            sx={{ width: '100%' }}
          >
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Fraud operations workspace
              </Typography>
              <Typography variant="h6">Fin-Panel</Typography>
            </Box>

            <Chip
              label="Live monitoring"
              color="primary"
              variant="filled"
              sx={{ bgcolor: alpha('#5b6cff', 0.12), color: 'primary.main' }}
            />
          </Stack>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            px: 2.5,
            py: 2,
          },
        }}
      >
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <Box
            sx={{
              px: 1.5,
              py: 1.5,
              borderRadius: 4,
              bgcolor: alpha('#5b6cff', 0.08),
            }}
          >
            <Typography variant="subtitle2" color="primary.main">
              Anti-fraud control center
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Review suspicious transactions, track queues and keep SLA under control.
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ px: 1.5, display: 'block', mb: 1 }}>
              Navigation
            </Typography>

            <List sx={{ p: 0 }}>
              {navItems.map((item) => {
                const selected = location.pathname.startsWith(item.to);

                return (
                  <ListItemButton
                    key={item.to}
                    component={RouterLink}
                    to={item.to}
                    selected={selected}
                    sx={{
                      mb: 1,
                      borderRadius: 3,
                      alignItems: 'flex-start',
                      px: 1.5,
                      py: 1.25,
                      '&.Mui-selected': {
                        bgcolor: alpha('#5b6cff', 0.10),
                        color: 'primary.main',
                      },
                      '&.Mui-selected:hover': {
                        bgcolor: alpha('#5b6cff', 0.14),
                      },
                    }}
                  >
                    <ListItemText
                      primary={item.label}
                      secondary={item.description}
                      primaryTypographyProps={{ fontWeight: 700, fontSize: 15 }}
                      secondaryTypographyProps={{ fontSize: 12.5, lineHeight: 1.4 }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Box>

          <Box
            sx={{
              mt: 'auto',
              p: 1.5,
              borderRadius: 4,
              bgcolor: alpha('#ffffff', 0.72),
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Mock environment
            </Typography>
            <MockScenarioSwitcher />
          </Box>
        </Stack>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: `${drawerWidth}px`,
          minWidth: 0,
        }}
      >
        <Toolbar sx={{ minHeight: 76 }} />
        <Outlet />
      </Box>
    </Box>
  );
}