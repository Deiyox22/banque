import { useState } from 'react';
import { useTemplates } from '../lib/useTemplates';
import { remplirTemplate } from '../lib/templates';
import { lienAffichageMaquette } from '../lib/mockupViewerUrl';
import type { SaisieActivite } from '../lib/useActivities';
import type { Mockup, Prospect } from '../types/database';

export function PreparerMessage({
  prospect,
  mockup,
  signature,
  onEnregistrerEnvoi,
}: {
  prospect: Prospect;
  mockup: Mockup | null;
  signature: string | null;
  onEnregistrerEnvoi: (saisie: SaisieActivite) => Promise<{ error: string | null }>;
}) {
  const { templates, loading: templatesLoading } = useTemplates();
  const [templateId, setTemplateId] = useState('');
  const [texte, setTexte] = useState('');
  const [statut, setStatut] = useState<'idle' | 'prêt'>('idle');
  const [erreur, setErreur] = useState<string | null>(null);
  const [copie, setCopie] = useState(false);
  const [enregistre, setEnregistre] = useState(false);

  const template = templates.find((t) => t.id === templateId) ?? null;

  function genererTexte(id: string) {
    setTemplateId(id);
    setCopie(false);
    setEnregistre(false);
    setErreur(null);

    const modele = templates.find((t) => t.id === id);
    if (!modele) {
      setStatut('idle');
      setTexte('');
      return;
    }

    const rempli = remplirTemplate(modele.corps, {
      nom: prospect.nom,
      activité: prospect.activite,
      lien_maquette: mockup ? lienAffichageMaquette(mockup.id) : '',
      ma_signature: signature,
    });

    setTexte(rempli);
    setStatut('prêt');
  }

  async function handleCopier() {
    await navigator.clipboard.writeText(texte);
    setCopie(true);
  }

  async function handleEnregistrerEnvoi() {
    if (!template) return;
    const { error } = await onEnregistrerEnvoi({
      type: template.canal === 'mail' ? 'mail_envoyé' : 'sms_envoyé',
      issue: null,
      canal: template.canal,
      contenu: texte,
    });
    if (error) {
      setErreur(error);
      return;
    }
    setEnregistre(true);
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <label className="block text-sm font-medium">
        Modèle
        <select
          value={templateId}
          onChange={(event) => genererTexte(event.target.value)}
          disabled={templatesLoading}
          className="mt-1 block w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
        >
          <option value="">— Choisir un modèle —</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nom} ({t.canal})
            </option>
          ))}
        </select>
      </label>

      {erreur && (
        <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
          {erreur}
        </p>
      )}

      {statut === 'prêt' && (
        <>
          <textarea
            readOnly
            value={texte}
            rows={6}
            className="mt-3 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleCopier}
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white focus:outline-2 focus:outline-offset-2 focus:outline-sky-500"
            >
              {copie ? 'Copié ✓' : 'Copier'}
            </button>
            <button
              type="button"
              onClick={handleEnregistrerEnvoi}
              disabled={enregistre}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium focus:outline-2 focus:outline-offset-2 focus:outline-sky-500 disabled:opacity-60 dark:border-slate-700"
            >
              {enregistre ? 'Envoi enregistré ✓' : "Enregistrer l'envoi"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
