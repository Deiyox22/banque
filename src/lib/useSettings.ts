import { useEffect, useState } from 'react';
import { supabase } from './supabase';

const DELAI_RELANCE_PAR_DEFAUT = 4;

// Aucune ligne `settings` n'existe tant que l'écran Paramètres (J6) ne permet
// pas d'en créer une : on retombe sur le délai par défaut du schéma, et une
// signature vide, si la ligne n'existe pas encore.
export function useSettings() {
  const [delaiRelanceJours, setDelaiRelanceJours] = useState(DELAI_RELANCE_PAR_DEFAUT);
  const [signature, setSignature] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    supabase
      .from('settings')
      .select('delai_relance_jours, signature')
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        setDelaiRelanceJours(data?.delai_relance_jours ?? DELAI_RELANCE_PAR_DEFAUT);
        setSignature(data?.signature ?? null);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { delaiRelanceJours, signature, loading };
}
