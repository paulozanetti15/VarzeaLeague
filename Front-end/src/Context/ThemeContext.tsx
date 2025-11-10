import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import lightTheme from '../theme';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    } else {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    }
    
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const muiTheme = useMemo(() => {
    if (theme === 'dark') {
      return createTheme({
        ...lightTheme,
        palette: {
          mode: 'dark',
          primary: {
            main: '#4d94ff',
            light: '#6ba4ff',
            dark: '#2196f3',
            contrastText: '#FFFFFF',
          },
          secondary: {
            main: '#78909C',
            light: '#a7c0cd',
            dark: '#4f5b62',
            contrastText: '#FFFFFF',
          },
          background: {
            default: '#1a1a1a',
            paper: '#2d2d2d',
          },
          text: {
            primary: '#e9ecef',
            secondary: '#adb5bd',
          },
          error: {
            main: '#f87171',
          },
          warning: {
            main: '#fb923c',
          },
          info: {
            main: '#4d94ff',
          },
          success: {
            main: '#4ade80',
          },
          grey: {
            50: '#fafafa',
            100: '#f5f5f5',
            200: '#e5e5e5',
            300: '#d4d4d4',
            400: '#a3a3a3',
            500: '#737373',
            600: '#525252',
            700: '#404040',
            800: '#262626',
            900: '#171717',
          },
        },
      });
    }
    return lightTheme;
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <MuiThemeProvider theme={muiTheme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
