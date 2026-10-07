import { useDarkMode } from '../lib/useDarkMode';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { sombre, basculer } = useDarkMode();

  return (
    <button
      type="button"
      onClick={basculer}
      aria-pressed={sombre}
      className={`rounded-lg px-3 py-2 text-left text-sm text-slate-500 hover:bg-slate-100 focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 dark:text-slate-400 dark:hover:bg-slate-800 ${className}`}
    >
      {sombre ? '☀️ Mode clair' : '🌙 Mode sombre'}
    </button>
  );
}
