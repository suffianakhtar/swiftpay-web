import {
  createContext, useContext, useEffect, useMemo, useState, type ReactNode,
} from 'react';

export type Theme  = 'dark' | 'light';
export type Accent = string; // hex

interface ThemeContextValue {
  theme: Theme;
  accent: Accent;
  setTheme: (t: Theme) => void;
  setAccent: (a: Accent) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const THEME_KEY  = 'sp.theme';
const ACCENT_KEY = 'sp.accent';

export const ACCENT_PRESETS = [
  '#0ea5e9', // sky (default)
  '#22c55e', // green
  '#a855f7', // purple
  '#f59e0b', // amber
  '#ef4444', // rose
  '#0b5d3b', // forest
] as const;

function applyToDocument(theme: Theme, accent: Accent) {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  root.style.setProperty('--c-accent', accent);
  root.style.setProperty(
    '--c-accent-hi',
    `color-mix(in oklab, ${accent} 70%, white)`,
  );
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem(THEME_KEY) as Theme) ?? 'dark',
  );
  const [accent, setAccentState] = useState<Accent>(
    () => localStorage.getItem(ACCENT_KEY) ?? '#0ea5e9',
  );

  // Apply on every change
  useEffect(() => {
    applyToDocument(theme, accent);
  }, [theme, accent]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      accent,
      setTheme: (t) => {
        setThemeState(t);
        localStorage.setItem(THEME_KEY, t);
      },
      setAccent: (a) => {
        setAccentState(a);
        localStorage.setItem(ACCENT_KEY, a);
      },
      toggleTheme: () => {
        setThemeState((prev) => {
          const next = prev === 'dark' ? 'light' : 'dark';
          localStorage.setItem(THEME_KEY, next);
          return next;
        });
      },
    }),
    [theme, accent],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
