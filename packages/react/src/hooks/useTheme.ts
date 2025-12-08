import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark';

/**
 * Hook for managing dark mode.
 * 
 * @example
 * ```tsx
 * function App() {
 *   const { theme, isDark, toggle, setTheme } = useTheme();
 * 
 *   return (
 *     <div data-theme={theme}>
 *       <Button onClick={toggle}>
 *         {isDark ? 'Light Mode' : 'Dark Mode'}
 *       </Button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTheme(defaultTheme: Theme = 'light') {
    const [theme, setThemeState] = useState<Theme>(() => {
        if (typeof window === 'undefined') return defaultTheme;

        const stored = localStorage.getItem('theme') as Theme | null;
        if (stored) return stored;

        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }

        return defaultTheme;
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggle = useCallback(() => {
        setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
    }, []);

    const setTheme = useCallback((newTheme: Theme) => {
        setThemeState(newTheme);
    }, []);

    return {
        theme,
        isDark: theme === 'dark',
        isLight: theme === 'light',
        toggle,
        setTheme,
    };
}

export default useTheme;
