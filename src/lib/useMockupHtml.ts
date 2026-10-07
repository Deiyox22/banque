import { useEffect, useState } from 'react';

const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/voir-maquette`;

// On récupère le contenu HTML via l'Edge Function `voir-maquette` (plutôt
// que directement depuis Supabase Storage) pour l'injecter ensuite via
// `srcdoc` : Storage renvoie une CSP stricte sur les fichiers qu'il sert,
// qui empêcherait le rendu si l'iframe pointait dessus en direct. L'Edge
// Function sert aussi de base au lien public `/voir/:id` (voir
// src/lib/mockupViewerUrl.ts) : un seul chemin de lecture pour l'aperçu
// interne et pour ce que voit le prospect.
export function useMockupHtml(mockupId: string) {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setHtml(null);
    setError(null);

    fetch(`${FUNCTIONS_URL}?id=${mockupId}`, {
      headers: {
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
    })
      .then((reponse) => {
        if (!reponse.ok) throw new Error("Impossible de charger l'aperçu.");
        return reponse.text();
      })
      .then((texte) => {
        if (active) setHtml(texte);
      })
      .catch((fetchError: Error) => {
        if (active) setError(fetchError.message);
      });

    return () => {
      active = false;
    };
  }, [mockupId]);

  return { html, error };
}
