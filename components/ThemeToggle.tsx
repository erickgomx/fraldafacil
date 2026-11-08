'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  size?: 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

export default function ThemeToggle({
  size = 'md',
  showLabel = false,
  className = '',
}: ThemeToggleProps) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hasDarkClass = document.documentElement.classList.contains('dark');
    setIsDark(hasDarkClass);
  }, []);

  const toggleTheme = () => {
    const nextState = !isDark;
    setIsDark(nextState);

    if (nextState) {
      document.documentElement.classList.add('dark');
      try {
        localStorage.setItem('theme', 'dark');
      } catch {
        // Ignora erro em ambientes restritos de storage
      }
    } else {
      document.documentElement.classList.remove('dark');
      try {
        localStorage.setItem('theme', 'light');
      } catch {
        // Ignora erro em ambientes restritos de storage
      }
    }
  };

  if (!mounted) {
    // Placeholder com dimensões idênticas para evitar Content Layout Shift (CLS)
    return (
      <div
        className={`inline-flex items-center justify-center rounded-xl border border-warm-border/60 bg-cream-50/60 opacity-0 ${
          size === 'sm' ? 'w-8 h-8' : 'w-9 h-9 sm:w-10 sm:h-10'
        } ${className}`}
        aria-hidden="true"
      />
    );
  }

  const dimensions =
    size === 'sm'
      ? 'w-8 h-8 rounded-lg text-xs'
      : 'w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-xs sm:text-sm';

  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-4 h-4 sm:w-[18px] sm:h-[18px]';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      title={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
      className={`relative inline-flex items-center justify-center gap-2 border border-warm-border/80 hover:border-charcoal-400 bg-white/70 hover:bg-cream-100/70 text-charcoal-700 shadow-subtle backdrop-blur-md transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta active:scale-95 cursor-pointer group ${dimensions} ${className}`}
    >
      <div className="relative flex items-center justify-center">
        {isDark ? (
          <Sun
            className={`${iconSize} text-amber-400 transition-transform duration-500 ease-out rotate-0 scale-100 group-hover:rotate-45 group-hover:text-amber-300`}
            aria-hidden="true"
          />
        ) : (
          <Moon
            className={`${iconSize} text-charcoal-700 transition-transform duration-500 ease-out rotate-0 scale-100 group-hover:-rotate-12 group-hover:text-charcoal-900`}
            aria-hidden="true"
          />
        )}
      </div>

      {showLabel && (
        <span className="font-sans font-medium text-xs select-none">
          {isDark ? 'Claro' : 'Escuro'}
        </span>
      )}
    </button>
  );
}
