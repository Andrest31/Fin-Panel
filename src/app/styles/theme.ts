import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0f62fe',
    },
    background: {
      default: '#f7f9fc',
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: 'Inter, Arial, sans-serif',
    h4: {
      fontWeight: 700,
    },
  },
});
