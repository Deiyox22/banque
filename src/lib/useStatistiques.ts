import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { calculerStatistiques, type Statistiques } from './statistiques';

export function useStatistiques() {
  const [statistiques, setStatistiques] = useState<Statistiques | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    const [prospectsResult, activitiesResult] = await Promise.all([
      supabase.from('prospects').select('*'),
      supabase.from('activities').select('*'),
    ]);

    if (prospectsResult.error) {
      setError(prospectsResult.error.message);
      setLoading(false);
      return;
    }
    if (activitiesResult.error) {
      setError(activitiesResult.error.message);
      setLoading(false);
      return;
    }

    setStatistiques(calculerStatistiques(prospectsResult.data ?? [], activitiesResult.data ?? []));
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { statistiques, loading, error, refetch };
}
