import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';

const DELAI_RELANCE_PAR_DEFAUT = 4;

export function useParametres() {
  const [delaiRelanceJours, setDelaiRelanceJours] = useState(DELAI_RELANCE_PAR_DEFAUT);
  const [signature, setSignature] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from('settings')
      .select('delai_relance_jours, signature')
      .maybeSingle();

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setDelaiRelanceJours(data?.delai_relance_jours ?? DELAI_RELANCE_PAR_DEFAUT);
      setSignature(data?.signature ?? '');
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const enregistrer = useCallback(
    async (changes: { delai_relance_jours: number; signature: string | null }) => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        return { error: userError?.message ?? 'Utilisateur introuvable.' };
      }

      const { error: upsertError } = await supabase
        .from('settings')
        .upsert({ user_id: userData.user.id, ...changes }, { onConflict: 'user_id' });

      if (upsertError) return { error: upsertError.message };
      await refetch();
      return { error: null };
    },
    [refetch]
  );

  return { delaiRelanceJours, signature, loading, error, enregistrer };
}
