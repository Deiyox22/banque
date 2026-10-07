import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

// Page publique (pas d'authentification requise) : c'est elle que le lien
// {{lien_maquette}} partagé avec un prospect pointe réellement, plutôt que
// l'URL Supabase brute (voir src/lib/mockupViewerUrl.ts). On récupère le
// contenu nous-mêmes via `fetch` puis on l'injecte en `srcdoc` — Supabase
// Storage sert ce fichier en text/plain avec une CSP verrouillée, ce qui
// empêcherait son rendu si l'iframe pointait directement sur l'URL signée.
export function VoirMaquette() {
  const [searchParams] = useSearchParams();
  const url = searchParams.get('u');
  const [html, setHtml] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setErreur('Lien invalide.');
      return;
    }

    let active = true;
    fetch(url)
      .then((reponse) => {
        if (!reponse.ok) throw new Error();
        return reponse.text();
      })
      .then((texte) => {
        if (active) setHtml(texte);
      })
      .catch(() => {
        if (active) setErreur('Ce lien a expiré ou est invalide. Demandez un nouveau lien à votre contact.');
      });

    return () => {
      active = false;
    };
  }, [url]);

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
