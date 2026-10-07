import { useEffect, useState } from 'react';
import { supabase } from './supabase';

// On récupère le contenu HTML nous-mêmes (plutôt que de pointer l'iframe
// directement sur l'URL signée) pour l'injecter ensuite via `srcdoc` :
// Supabase Storage renvoie une CSP stricte sur les fichiers qu'il sert, qui
// bloquerait les styles de la maquette si l'iframe chargeait l'URL en direct.
export function useMockupHtml(storagePath: string) {
  const [html, setHtml] = useState<string | null>(null);
  // URL signée exposée en plus du HTML : permet un lien "Ouvrir dans un
  // nouvel onglet" vers la vraie page, en dehors de l'iframe de l'app.
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setHtml(null);
    setUrl(null);
    setError(null);

    async function charger() {
      // URL signée générée à l'affichage, jamais stockée (elle expirerait).
      // Durée un peu généreuse (10 min) car le lien "Ouvrir" peut être
      // cliqué un moment après le chargement de la page.
      const { data, error: signError } = await supabase.storage
        .from('mockups')
        .createSignedUrl(storagePath, 600);
      if (!active) return;
      if (signError || !data) {
        setError(signError?.message ?? "Impossible de générer l'aperçu.");
        return;
      }
      setUrl(data.signedUrl);
      try {
        const response = await fetch(data.signedUrl);
        if (!response.ok) throw new Error('Téléchargement de la maquette impossible.');
        const text = await response.text();
        if (active) setHtml(text);
      } catch (fetchError) {
        if (active) setError((fetchError as Error).message);
      }
    }

    charger();
    return () => {
      active = false;
    };
  }, [storagePath]);

  return { html, url, error };
}
