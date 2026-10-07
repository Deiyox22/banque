import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';
import type { Prospect } from '../types/database';

export interface ReponseRecente {
  id: string;
  date: string;
  contenu: string | null;
  prospect: Pick<Prospect, 'id' | 'nom' | 'statut'>;
}

export function useAujourdhui() {
  const [aFinaliser, setAFinaliser] = useState<Prospect[]>([]);
  const [aContacter, setAContacter] = useState<Prospect[]>([]);
  const [relances, setRelances] = useState<Prospect[]>([]);
  const [nouvellesReponses, setNouvellesReponses] = useState<ReponseRecente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    const aujourdhui = new Date().toISOString().slice(0, 10);
    const debutJour = `${aujourdhui}T00:00:00.000Z`;

    const [prospectsResult, reponsesResult] = await Promise.all([
      supabase.from('prospects').select('*').order('created_at', { ascending: false }),
      supabase
        .from('activities')
        .select('id, date, contenu, prospect:prospects(id, nom, statut)')
        .eq('type', 'réponse_reçue')
        .gte('date', debutJour)
        .order('date', { ascending: false }),
    ]);

    if (prospectsResult.error) {
      setError(prospectsResult.error.message);
      setLoading(false);
      return;
    }
    if (reponsesResult.error) {
      setError(reponsesResult.error.message);
      setLoading(false);
      return;
    }

    const prospects = prospectsResult.data ?? [];
    setAFinaliser(prospects.filter((p) => p.statut === 'À contacter'));
    setAContacter(prospects.filter((p) => p.statut === 'Maquette prête'));
    setRelances(
      prospects
        .filter((p) => p.prochaine_relance && p.prochaine_relance <= aujourdhui)
        .sort((a, b) => (a.prochaine_relance ?? '').localeCompare(b.prochaine_relance ?? ''))
    );
    setNouvellesReponses((reponsesResult.data ?? []) as unknown as ReponseRecente[]);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { aFinaliser, aContacter, relances, nouvellesReponses, loading, error, refetch };
}
