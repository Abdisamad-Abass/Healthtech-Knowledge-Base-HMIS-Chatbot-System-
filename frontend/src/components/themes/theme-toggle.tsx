'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const active = (mode: string) => {
    if (mode === 'system') return theme === 'system';
    return resolvedTheme === mode && theme !== 'system';
  };

  return (
    <div className="bg-card border-border flex items-center rounded-xl border p-1">
      <button
        onClick={() => setTheme('light')}
        className={`rounded-lg p-2 transition ${
          active('light') ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-accent'
        }`}
      >
        <Sun className="h-4 w-4" />
      </button>

      <button
        onClick={() => setTheme('dark')}
        className={`rounded-lg p-2 transition ${
          active('dark') ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-accent'
        }`}
      >
        <Moon className="h-4 w-4" />
      </button>

      <button
        onClick={() => setTheme('system')}
        className={`rounded-lg p-2 transition ${
          active('system')
            ? 'bg-primary text-primary-foreground'
            : 'text-foreground hover:bg-accent'
        }`}
      >
        <Monitor className="h-4 w-4" />
      </button>
    </div>
  );
}
