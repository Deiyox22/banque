import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';
import type { Prospect, StatutProspect } from '../types/database';

export function useProspects() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from('prospects')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setProspects(data ?? []);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const updateStatut = useCallback(
    async (id: string, statut: StatutProspect) => {
      const previous = prospects;
      setProspects((current) => current.map((p) => (p.id === id ? { ...p, statut } : p)));

      const { error: updateError } = await supabase.from('prospects').update({ statut }).eq('id', id);
      if (updateError) {
        setError(updateError.message);
        setProspects(previous);
      }
    },
    [prospects]
  );

  return { prospects, loading, error, refetch, updateStatut };
}
