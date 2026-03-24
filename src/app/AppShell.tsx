import {
  AppBar,
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom';
import { MockScenarioSwitcher } from '@/features/mock-scenarios/ui/MockScenarioSwitcher';

const drawerWidth = 240;

const navItems = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Operations', to: '/operations' },
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
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Fin-Panel
          </Typography>
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
            borderRight: 1,
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <Toolbar>
          <Typography variant="h6">Anti-Fraud</Typography>
        </Toolbar>

        <Box sx={{ px: 2, pb: 2 }}>
          <MockScenarioSwitcher />
        </Box>

        <Divider />

        <Box sx={{ overflow: 'auto', flexGrow: 1, pt: 1 }}>
          <List>
            {navItems.map((item) => {
              const selected = location.pathname.startsWith(item.to);

              return (
                <ListItemButton
                  key={item.to}
                  component={RouterLink}
                  to={item.to}
                  selected={selected}
                >
                  <ListItemText primary={item.label} />
                </ListItemButton>
              );
            })}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, ml: `${drawerWidth}px` }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}