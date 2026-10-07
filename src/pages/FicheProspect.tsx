import { useState, type ChangeEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useProspect } from '../lib/useProspect';
import { useActivities } from '../lib/useActivities';
import { useSettings } from '../lib/useSettings';
import { PriorityBadge } from '../components/PriorityBadge';
import { StatutBadge, STATUTS } from '../components/StatutBadge';
import { MockupPreview } from '../components/MockupPreview';
import { ActiviteForm } from '../components/ActiviteForm';
import { JournalActivites } from '../components/JournalActivites';
import { PreparerMessage } from '../components/PreparerMessage';
import { ContactCard } from '../components/ContactCard';
import { formatDate, toDateInputValue } from '../lib/formatDate';
import type { StatutProspect } from '../types/database';

export function FicheProspect() {
  const { id } = useParams<{ id: string }>();
  const { prospect, mockups, loading, error, update, refetch } = useProspect(id);
  const { activities, ajouterActivite } = useActivities(id);
  const { delaiRelanceJours, signature } = useSettings();
  const [notes, setNotes] = useState('');
  const [notesDirty, setNotesDirty] = useState(false);

  async function handleAjouterActivite(saisie: Parameters<typeof ajouterActivite>[0]) {
    if (!prospect) return { error: 'Prospect introuvable.' };
    const { error } = await ajouterActivite(saisie, prospect.statut, delaiRelanceJours);
    if (!error) await refetch();
    return { error };
  }

  // Garde `notes` synchronisé avec les données chargées, sauf pendant une
  // saisie en cours (on ne veut pas écraser ce que la personne est en train
  // d'écrire si un refetch arrive).
  if (prospect && !notesDirty && notes !== (prospect.notes ?? '')) {
    setNotes(prospect.notes ?? '');
  }

  function handleNotesChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setNotes(event.target.value);
    setNotesDirty(true);
  }

  async function handleNotesBlur() {
    if (!prospect) return;
    setNotesDirty(false);
    if (notes !== (prospect.notes ?? '')) {
      await update({ notes: notes || null });
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Chargement…</p>;
  }

  if (error || !prospect) {
    return (
      <div>
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error ?? 'Ce prospect est introuvable.'}
        </p>
        <Link to="/pipeline" className="mt-4 inline-block text-sm font-medium text-sky-600 hover:underline dark:text-sky-400">
          ← Retour au pipeline
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/pipeline" className="text-sm font-medium text-sky-600 hover:underline dark:text-sky-400">
        ← Retour au pipeline
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">{prospect.nom}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{prospect.activite ?? '—'}</p>
          {prospect.localisation && (
            <p className="text-sm text-slate-500 dark:text-slate-400">{prospect.localisation}</p>
          )}
        </div>
        <PriorityBadge priorite={prospect.priorite} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <StatutBadge statut={prospect.statut} />
        <select
          value={prospect.statut}
          onChange={(event) => update({ statut: event.target.value as StatutProspect })}
          className="rounded-lg border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-800"
          aria-label="Changer le statut"
        >
          {STATUTS.map((statut) => (
            <option key={statut} value={statut}>
              {statut}
            </option>
          ))}
        </select>
      </div>

      <ContactCard prospect={prospect} />

      <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-slate-500 dark:text-slate-400">Site actuel</dt>
          <dd>{prospect.site_actuel ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-slate-500 dark:text-slate-400">Prochaine relance</dt>
          <dd>
            <input
              type="date"
              value={toDateInputValue(prospect.prochaine_relance)}
              onChange={(event) => update({ prochaine_relance: event.target.value || null })}
              className="rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-800"
              aria-label="Modifier la date de prochaine relance"
            />
          </dd>
        </div>
      </dl>

      {prospect.opportunite && (
        <div className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm dark:bg-slate-900">
          <p className="font-medium">Opportunité</p>
          <p className="mt-1 text-slate-600 dark:text-slate-300">{prospect.opportunite}</p>
        </div>
      )}

      {prospect.accroche && (
        <div className="mt-3 rounded-lg bg-slate-50 px-4 py-3 text-sm dark:bg-slate-900">
          <p className="font-medium">Accroche (brouillon)</p>
          <p className="mt-1 text-slate-600 dark:text-slate-300">{prospect.accroche}</p>
        </div>
      )}

      <label className="mt-6 block text-sm font-medium">
        Notes
        <textarea
          value={notes}
          onChange={handleNotesChange}
          onBlur={handleNotesBlur}
          rows={4}
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-2 focus:outline-offset-2 focus:outline-sky-500 dark:border-slate-700 dark:bg-slate-800"
          placeholder="Ajoutez une note…"
        />
      </label>

      <div className="mt-6">
        <h2 className="text-sm font-semibold">Maquette</h2>
        {mockups.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Aucune maquette pour ce prospect.</p>
        ) : (
          <>
            <div className="mt-2">
              <MockupPreview storagePath={mockups[0].storage_path} />
            </div>
            <ul className="mt-4 space-y-2">
              {mockups.map((mockup) => (
                <li
                  key={mockup.id}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{mockup.nom_fichier}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">v{mockup.version}</span>
                  </div>
                  {mockup.parcours_demo && (
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Parcours démo : {mockup.parcours_demo}
                    </p>
                  )}
                  {mockup.a_valider && (
                    <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">À valider : {mockup.a_valider}</p>
                  )}
                  <p className="mt-1 text-xs text-slate-400">Ajoutée le {formatDate(mockup.created_at)}</p>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-semibold">Préparer un message</h2>
        <div className="mt-2">
          <PreparerMessage
            prospect={prospect}
            mockup={mockups[0] ?? null}
            signature={signature}
            onEnregistrerEnvoi={handleAjouterActivite}
          />
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-semibold">Ajouter une activité</h2>
        <div className="mt-2">
          <ActiviteForm onAjouter={handleAjouterActivite} />
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-semibold">Journal</h2>
        <div className="mt-2">
          <JournalActivites activities={activities} />
        </div>
      </div>
    </div>
  );
}
