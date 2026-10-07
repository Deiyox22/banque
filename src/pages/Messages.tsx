import { useState, type FormEvent } from 'react';
import { useTemplates } from '../lib/useTemplates';
import type { CanalTemplate, Template } from '../types/database';

const MOTS_DESINSCRIPTION = ['désinscri', 'désabonn', 'opt-out', 'opt out', 'stop'];

function contientPhraseDesinscription(corps: string) {
  const texte = corps.toLowerCase();
  return MOTS_DESINSCRIPTION.some((mot) => texte.includes(mot));
}

export function Messages() {
  const { templates, loading, error, creer, modifier, supprimer } = useTemplates();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nom, setNom] = useState('');
  const [canal, setCanal] = useState<CanalTemplate>('sms');
  const [objet, setObjet] = useState('');
  const [corps, setCorps] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  function resetForm() {
    setEditingId(null);
    setNom('');
    setCanal('sms');
    setObjet('');
    setCorps('');
    setFormError(null);
  }

  function startEdit(template: Template) {
    setEditingId(template.id);
    setNom(template.nom);
    setCanal(template.canal);
    setObjet(template.objet ?? '');
    setCorps(template.corps);
    setFormError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    // Exigence du PRD : un modèle mail doit toujours inclure une phrase de
    // désinscription.
    if (canal === 'mail' && !contientPhraseDesinscription(corps)) {
      setFormError(
        "Un modèle mail doit inclure une phrase de désinscription (ex. : « Répondez STOP pour ne plus recevoir de messages »)."
      );
      return;
    }

    setEnvoi(true);
    const payload = { nom, canal, objet: canal === 'mail' ? objet.trim() || null : null, corps };
    const { error: saveError } = editingId ? await modifier(editingId, payload) : await creer(payload);
    setEnvoi(false);

    if (saveError) {
      setFormError(saveError);
      return;
    }
    resetForm();
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Supprimer ce modèle ?')) return;
    await supprimer(id);
    if (editingId === id) resetForm();
  }

  return (
    <div>
      <h1 className="text-lg font-semibold">Messages</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
        <h2 className="text-sm font-semibold">{editingId ? 'Modifier le modèle' : 'Nouveau modèle'}</h2>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-medium">
            Nom
            <input
              type="text"
              required
              value={nom}
              onChange={(event) => setNom(event.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
          </label>

          <label className="block text-sm font-medium">
            Canal
            <select
              value={canal}
              onChange={(event) => setCanal(event.target.value as CanalTemplate)}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="sms">SMS</option>
              <option value="mail">Mail</option>
            </select>
          </label>
        </div>

        {canal === 'mail' && (
          <label className="block text-sm font-medium">
            Objet
            <input
              type="text"
              value={objet}
              onChange={(event) => setObjet(event.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
          </label>
        )}

        <label className="block text-sm font-medium">
          Corps
          <textarea
            required
            rows={5}
            value={corps}
            onChange={(event) => setCorps(event.target.value)}
            placeholder="Bonjour {{nom}}, ..."
            className="mt-1 block w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Variables disponibles : {'{{nom}}'}, {'{{activité}}'}, {'{{lien_maquette}}'}, {'{{ma_signature}}'}.
            {canal === 'mail' && ' Une phrase de désinscription est obligatoire pour les mails.'}
          </p>
        </label>

        {formError && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {formError}
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={envoi}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 disabled:opacity-60"
          >
            {envoi ? 'Enregistrement…' : editingId ? 'Enregistrer' : 'Créer le modèle'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 dark:border-slate-700"
            >
              Annuler
            </button>
          )}
        </div>
      </form>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {loading ? (
        <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">Chargement…</p>
      ) : templates.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          Aucun modèle pour le moment.
        </p>
      ) : (
        <ul className="mt-6 space-y-2">
          {templates.map((template) => (
            <li key={template.id} className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{template.nom}</p>
                  <p className="text-xs uppercase text-slate-500 dark:text-slate-400">{template.canal}</p>
                </div>
                <div className="flex shrink-0 gap-3">
                  <button
                    type="button"
                    onClick={() => startEdit(template)}
                    className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(template.id)}
                    className="text-xs font-medium text-red-600 hover:underline dark:text-red-400"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
              {template.objet && (
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Objet : {template.objet}</p>
              )}
              <p className="mt-1 whitespace-pre-wrap text-sm">{template.corps}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
