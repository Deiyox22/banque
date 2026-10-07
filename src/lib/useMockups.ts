import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';
import type { Mockup, Prospect } from '../types/database';

export interface MockupAvecProspect extends Mockup {
  prospect: Pick<Prospect, 'id' | 'nom' | 'statut'>;
}

export function useMockups() {
  const [mockups, setMockups] = useState<MockupAvecProspect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);

    const { data, error: fetchError } = await supabase
      .from('mockups')
      .select('*, prospect:prospects(id, nom, statut)')
      .order('prospect_id', { ascending: true })
      .order('version', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    // Une carte par prospect : on ne garde que la dernière version de chaque
    // maquette (le tri ci-dessus place déjà cette version en tête de son groupe).
    const vues = new Set<string>();
    const dernieresVersions: MockupAvecProspect[] = [];
    for (const mockup of (data ?? []) as unknown as MockupAvecProspect[]) {
      if (vues.has(mockup.prospect_id)) continue;
      vues.add(mockup.prospect_id);
      dernieresVersions.push(mockup);
    }

    setMockups(dernieresVersions);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { mockups, loading, error, refetch };
}
