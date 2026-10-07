import { useState, type FormEvent } from 'react';
import { TYPE_ACTIVITE_LABELS, ISSUE_ACTIVITE_LABELS } from '../lib/activiteLabels';
import type { SaisieActivite } from '../lib/useActivities';
import type { IssueActivite, TypeActivite } from '../types/database';

export function ActiviteForm({
  onAjouter,
}: {
  onAjouter: (saisie: SaisieActivite) => Promise<{ error: string | null }>;
}) {
  const [type, setType] = useState<TypeActivite>('mail_envoyé');
  const [issue, setIssue] = useState<IssueActivite>('intéressé');
  const [canal, setCanal] = useState('');
  const [contenu, setContenu] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEnvoi(true);
    setErreur(null);

    const { error } = await onAjouter({
      type,
      issue: type === 'réponse_reçue' ? issue : null,
      canal: canal.trim() || null,
      contenu: contenu.trim() || null,
    });

    setEnvoi(false);
    if (error) {
      setErreur(error);
      return;
    }
    setCanal('');
    setContenu('');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm font-medium">
          Type
          <select
            value={type}
            onChange={(event) => setType(event.target.value as TypeActivite)}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
          >
            {Object.entries(TYPE_ACTIVITE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium">
          Canal (optionnel)
          <input
            type="text"
            value={canal}
            onChange={(event) => setCanal(event.target.value)}
            placeholder="téléphone, mail…"
            className="mt-1 block w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
        </label>
      </div>

      {type === 'réponse_reçue' && (
        <label className="block text-sm font-medium">
          Issue
          <select
            value={issue}
            onChange={(event) => setIssue(event.target.value as IssueActivite)}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
          >
            {Object.entries(ISSUE_ACTIVITE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="block text-sm font-medium">
        Contenu (optionnel)
        <textarea
          value={contenu}
          onChange={(event) => setContenu(event.target.value)}
          rows={2}
          className="mt-1 block w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
          placeholder="Détails…"
        />
      </label>

      {erreur && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {erreur}
        </p>
      )}

      <button
        type="submit"
        disabled={envoi}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 disabled:opacity-60"
      >
        {envoi ? 'Ajout…' : "Ajouter l'activité"}
      </button>
    </form>
  );
}
