import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'system' | 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'light' | 'dark'; // What is currently rendered
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('garaad_theme') as Theme;
    return saved || 'system';
  });

  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('dark');

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('garaad_theme', newTheme);
  };

  useEffect(() => {
    const applyTheme = () => {
      const root = document.documentElement;
      let effectiveTheme: 'light' | 'dark' = 'dark';

      if (theme === 'system') {
        const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
        effectiveTheme = prefersLight ? 'light' : 'dark';
      } else {
        effectiveTheme = theme as 'light' | 'dark';
      }

      setActualTheme(effectiveTheme);

      if (effectiveTheme === 'light') {
        root.classList.add('light-mode');
        root.classList.remove('dark-mode');
      } else {
        root.classList.add('dark-mode');
        root.classList.remove('light-mode');
      }
    };

    applyTheme();

    // Listen for system theme changes if set to system
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
      const listener = () => applyTheme();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, actualTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
