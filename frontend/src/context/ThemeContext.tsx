import React, { createContext, useState, useContext, ReactNode } from 'react';
import { lightTheme, darkTheme, ThemeColors } from '../theme/colors';

type ThemeType = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeType;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeType>('light');

  const colors = theme === 'light' ? lightTheme : darkTheme;

  function toggleTheme() {
    setThemeState(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  }

  function setTheme(newTheme: ThemeType) {
    setThemeState(newTheme);
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colors,
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
}
