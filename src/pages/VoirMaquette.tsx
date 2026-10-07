import { useParams } from 'react-router-dom';
import { useMockupHtml } from '../lib/useMockupHtml';

// Page publique (pas d'authentification requise) : c'est elle que le lien
// {{lien_maquette}} partagé avec un prospect pointe réellement (voir
// src/lib/mockupViewerUrl.ts), via l'Edge Function `voir-maquette` qui sert
// le contenu avec les bons en-têtes.
export function VoirMaquette() {
  const { id } = useParams<{ id: string }>();
  const { html, error } = useMockupHtml(id ?? '');
  const erreur = !id ? 'Lien invalide.' : error ? 'Ce lien est invalide. Demandez un nouveau lien à votre contact.' : null;

  if (erreur) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 text-center">
        <p className="text-sm text-slate-600">{erreur}</p>
      </main>
    );
  }

  if (!html) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-500">Chargement…</p>
      </main>
    );
  }

  return (
    // allow-scripts seul (jamais allow-same-origin avec du HTML non fiable),
    // comme partout ailleurs dans l'app : voir CLAUDE.md.
    <iframe sandbox="allow-scripts" title="Maquette" srcDoc={html} className="h-screen w-screen border-0" />
  );
}
