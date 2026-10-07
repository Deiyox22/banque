import { TYPE_ACTIVITE_LABELS, ISSUE_ACTIVITE_LABELS } from '../lib/activiteLabels';
import { formatDate } from '../lib/formatDate';
import type { Activity } from '../types/database';

export function JournalActivites({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Aucune activité pour le moment.</p>;
  }

  return (
    <ul className="space-y-2">
      {activities.map((activite) => (
        <li key={activite.id} className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="font-medium">{TYPE_ACTIVITE_LABELS[activite.type]}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">{formatDate(activite.date)}</span>
          </div>
          {activite.issue && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Issue : {ISSUE_ACTIVITE_LABELS[activite.issue]}
            </p>
          )}
          {activite.canal && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Canal : {activite.canal}</p>
          )}
          {activite.contenu && <p className="mt-1 text-sm">{activite.contenu}</p>}
        </li>
      ))}
    </ul>
  );
}
