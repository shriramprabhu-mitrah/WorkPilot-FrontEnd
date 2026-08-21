'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { WpButton } from '@/src/app/components/common/button';

export const ThemeToggle = () => {
  // resolvedTheme is undefined on the server and during hydration,
  // which is the correct signal to use instead of a manual mounted flag.
  const { resolvedTheme, setTheme } = useTheme();

  // During SSR / before hydration resolvedTheme is undefined — render a
  // stable placeholder with the same dimensions to avoid layout shift.
  if (!resolvedTheme) {
    return (
      <WpButton
        variant="ghost"
        size="sm"
        className="!p-1.5 text-gray-500 hidden md:flex"
        aria-label="Toggle theme"
        disabled
      >
        <span className="w-[17px] h-[17px] block" />
      </WpButton>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <WpButton
      variant="ghost"
      size="sm"
      className="!p-1.5 text-gray-500 dark:text-slate-300 hidden md:flex"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun size={17} /> : <Moon size={17} />}
    </WpButton>
  );
};
