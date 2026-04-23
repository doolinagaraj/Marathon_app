import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// Premium color palette - Dark theme with neon accents
const primaryColors = {
  main: '#00d4ff', // Electric blue
  light: '#33ddff',
  dark: '#00a8cc',
  contrastText: '#0a0a0a',
};

const secondaryColors = {
  main: '#ff6b35', // Energetic orange
  light: '#ff8555',
  dark: '#e55520',
  contrastText: '#ffffff',
};

// Create the premium dark theme
let theme = createTheme({
  palette: {
    mode: 'dark',
    primary: primaryColors,
    secondary: secondaryColors,
    background: {
      default: '#0a0a0a',
      paper: 'rgba(20, 20, 25, 0.95)',
    },
    success: {
      main: '#00ff88',
      light: '#33ff99',
      dark: '#00cc6a',
    },
    warning: {
      main: '#ffaa00',
      light: '#ffbb33',
      dark: '#cc8800',
    },
    error: {
      main: '#ff3366',
      light: '#ff5588',
      dark: '#cc2255',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
      disabled: 'rgba(255, 255, 255, 0.4)',
    },
  },
  typography: {
    fontFamily: '"Inter", "Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '3rem',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2.5rem',
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    // Premium glassmorphic card style
    MuiCard: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 48px rgba(0, 212, 255, 0.2)',
            borderColor: 'rgba(0, 212, 255, 0.3)',
          },
        },
      },
    },
    // Gradient buttons with glow
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 24px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          textTransform: 'none',
          fontSize: '1rem',
        },
        contained: {
          background: 'linear-gradient(135deg, #00d4ff 0%, #00a8cc 100%)',
          boxShadow: '0 4px 16px rgba(0, 212, 255, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #33ddff 0%, #00d4ff 100%)',
            boxShadow: '0 6px 24px rgba(0, 212, 255, 0.5)',
            transform: 'translateY(-2px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        outlined: {
          borderWidth: '2px',
          borderColor: 'rgba(0, 212, 255, 0.5)',
          '&:hover': {
            borderColor: '#00d4ff',
            backgroundColor: 'rgba(0, 212, 255, 0.1)',
            boxShadow: '0 0 20px rgba(0, 212, 255, 0.2)',
          },
        },
      },
    },
    // Floating label inputs
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              boxShadow: '0 0 20px rgba(0, 212, 255, 0.2)',
            },
          },
        },
      },
    },
    // Premium app bar
    MuiAppBar: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(10, 10, 10, 0.9)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    // Modern paper component
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

// Make typography responsive
theme = responsiveFontSizes(theme);

export default theme;
