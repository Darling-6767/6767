import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
interface ThemeContextType { dark: boolean; toggle: () => void; }
const ThemeContext = createContext<ThemeContextType>({ dark: false, toggle: () => {} });
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('lang_app_dark');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  useEffect(() => {
    localStorage.setItem('lang_app_dark', String(dark));
    if (dark) document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark');
  }, [dark]);
  const toggle = () => setDark(!dark);
  return <ThemeContext.Provider value={{ dark, toggle }}>{children}</ThemeContext.Provider>;
}
export function useTheme() { return useContext(ThemeContext); }
