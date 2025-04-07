import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6B46C1', // Roxo médio
      light: '#9F7AEA', // Roxo claro
      dark: '#4C1D95', // Roxo escuro
      contrastText: '#FFFFFF', // Texto branco para contraste com o fundo roxo
    },
    secondary: {
      main: '#E9D8FD', // Roxo bem claro, quase branco com toque roxo
      light: '#F3E8FF', // Roxo lavanda claro
      dark: '#B794F4', // Roxo lavanda médio
      contrastText: '#44337A', // Roxo escuro para contraste com fundo claro
    },
    background: {
      default: '#F9FAFB', // Branco levemente acinzentado para o fundo
      paper: '#FFFFFF', // Branco para cards e componentes
    },
    text: {
      primary: '#2D3748', // Quase preto para texto principal
      secondary: '#718096', // Cinza para texto secundário
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});

export default theme; 