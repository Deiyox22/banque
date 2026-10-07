import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';
import type { CanalTemplate, Template } from '../types/database';

export interface SaisieTemplate {
  nom: string;
  canal: CanalTemplate;
  objet: string | null;
  corps: string;
}

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase.from('templates').select('*').order('nom');
    if (fetchError) setError(fetchError.message);
    else {
      setTemplates(data ?? []);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const creer = useCallback(
    async (saisie: SaisieTemplate) => {
      const { error } = await supabase.from('templates').insert(saisie);
      if (!error) await refetch();
      return { error: error?.message ?? null };
    },
    [refetch]
  );

  const modifier = useCallback(
    async (id: string, saisie: SaisieTemplate) => {
      const { error } = await supabase.from('templates').update(saisie).eq('id', id);
      if (!error) await refetch();
      return { error: error?.message ?? null };
    },
    [refetch]
  );

  const supprimer = useCallback(
    async (id: string) => {
      const { error } = await supabase.from('templates').delete().eq('id', id);
      if (!error) await refetch();
      return { error: error?.message ?? null };
    },
    [refetch]
  );

  return { templates, loading, error, creer, modifier, supprimer, refetch };
}
