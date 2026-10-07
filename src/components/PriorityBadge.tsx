import type { Priorite } from '../types/database';

const STYLES: Record<Priorite, string> = {
  Haute: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  Moyenne: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  Basse: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
};

export function PriorityBadge({ priorite }: { priorite: Priorite }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${STYLES[priorite]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {priorite}
    </span>
  );
}
