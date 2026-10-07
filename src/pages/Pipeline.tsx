import { useState } from 'react';
import { useProspects } from '../lib/useProspects';
import { PipelineTable } from '../components/PipelineTable';
import { PipelineKanban } from '../components/PipelineKanban';

export function Pipeline() {
  const { prospects, loading, error, updateStatut } = useProspects();
  const [vue, setVue] = useState<'tableau' | 'kanban'>('kanban');

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Pipeline</h1>
        <div className="flex rounded-lg border border-slate-300 p-0.5 text-sm dark:border-slate-700">
          <button
            type="button"
            onClick={() => setVue('kanban')}
            className={`rounded-md px-3 py-1.5 font-medium focus:outline-2 focus:outline-offset-2 focus:outline-sky-500 ${
              vue === 'kanban' ? 'bg-sky-600 text-white' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Kanban
          </button>
          <button
            type="button"
            onClick={() => setVue('tableau')}
            className={`rounded-md px-3 py-1.5 font-medium focus:outline-2 focus:outline-offset-2 focus:outline-sky-500 ${
              vue === 'tableau' ? 'bg-sky-600 text-white' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Tableau
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Chargement…</p>
      ) : prospects.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          Aucun prospect pour le moment.
        </p>
      ) : vue === 'kanban' ? (
        <PipelineKanban prospects={prospects} onStatutChange={updateStatut} />
      ) : (
        <PipelineTable prospects={prospects} />
      )}
    </div>
  );
}
