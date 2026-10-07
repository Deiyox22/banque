import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { applyActivityToProspect } from './activityRules';
import type { Activity, IssueActivite, StatutProspect, TypeActivite } from '../types/database';

export interface SaisieActivite {
  type: TypeActivite;
  issue: IssueActivite | null;
  canal: string | null;
  contenu: string | null;
}

export function useActivities(prospectId: string | undefined) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!prospectId) return;
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from('activities')
      .select('*')
      .eq('prospect_id', prospectId)
      .order('date', { ascending: false });

    if (fetchError) setError(fetchError.message);
    else {
      setActivities(data ?? []);
      setError(null);
    }
    setLoading(false);
  }, [prospectId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const ajouterActivite = useCallback(
    async (saisie: SaisieActivite, statutActuel: StatutProspect, delaiRelanceJours: number) => {
      if (!prospectId) return { error: 'Prospect introuvable.' };

      const date = new Date().toISOString();

      const { error: insertError } = await supabase.from('activities').insert({
        prospect_id: prospectId,
        type: saisie.type,
        canal: saisie.canal,
        contenu: saisie.contenu,
        issue: saisie.issue,
        date,
      });
      if (insertError) return { error: insertError.message };

      // Règle métier pure (src/lib/activityRules.ts) : on lit le résultat et
      // on fait l'update Supabase ici, côté appelant.
      const resultat = applyActivityToProspect(statutActuel, { type: saisie.type, issue: saisie.issue, date }, delaiRelanceJours);

      const changes: Record<string, unknown> = { statut: resultat.statut };
      if (resultat.prochaine_relance !== undefined) changes.prochaine_relance = resultat.prochaine_relance;

      const { error: updateError } = await supabase.from('prospects').update(changes).eq('id', prospectId);
      if (updateError) return { error: updateError.message };

      await refetch();
      return { error: null };
    },
    [prospectId, refetch]
  );

  return { activities, loading, error, ajouterActivite, refetch };
}
