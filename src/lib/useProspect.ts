import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';
import type { Mockup, Prospect } from '../types/database';

export function useProspect(id: string | undefined) {
  const [prospect, setProspect] = useState<Prospect | null>(null);
  const [mockups, setMockups] = useState<Mockup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);

    const [prospectResult, mockupsResult] = await Promise.all([
      supabase.from('prospects').select('*').eq('id', id).single(),
      supabase.from('mockups').select('*').eq('prospect_id', id).order('version', { ascending: false }),
    ]);

    if (prospectResult.error) setError(prospectResult.error.message);
    else setProspect(prospectResult.data);

    if (mockupsResult.error) setError(mockupsResult.error.message);
    else setMockups(mockupsResult.data ?? []);

    setLoading(false);
  }, [id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const update = useCallback(
    async (changes: Partial<Prospect>) => {
      if (!id) return;
      const previous = prospect;
      setProspect((current) => (current ? { ...current, ...changes } : current));

      const { error: updateError } = await supabase.from('prospects').update(changes).eq('id', id);
      if (updateError) {
        setError(updateError.message);
        setProspect(previous);
      }
    },
    [id, prospect]
  );

  return { prospect, mockups, loading, error, update, refetch };
}
