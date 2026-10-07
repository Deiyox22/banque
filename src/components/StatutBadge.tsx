import type { StatutProspect } from '../types/database';

export const STATUTS: StatutProspect[] = [
  'À contacter',
  'Maquette prête',
  'Envoyée',
  'Vue',
  'Relancée',
  'Intéressé',
  'RDV pris',
  'Gagné',
  'Refus',
  'Sans réponse',
];

const STYLES: Record<StatutProspect, string> = {
  'À contacter': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  'Maquette prête': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  Envoyée: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  Vue: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300',
  Relancée: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  Intéressé: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  'RDV pris': 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
  Gagné: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
  Refus: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  'Sans réponse': 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
};

export function StatutBadge({ statut }: { statut: StatutProspect }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STYLES[statut]}`}>
      {statut}
    </span>
  );
}
