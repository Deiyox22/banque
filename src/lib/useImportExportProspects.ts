import { useCallback, useState } from 'react';
import { supabase } from './supabase';
import { prospectsVersCsv, parserProspectsCsv } from './csv';
import type { Prospect } from '../types/database';

export interface ResultatImport {
  crees: number;
  misAJour: number;
}

export function useImportExportProspects() {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exporter = useCallback(async () => {
    setExporting(true);
    setError(null);

    const { data, error: fetchError } = await supabase.from('prospects').select('*').order('nom');
    setExporting(false);
    if (fetchError) {
      setError(fetchError.message);
      return;
    }

    const csv = prospectsVersCsv((data ?? []) as Prospect[]);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const lien = document.createElement('a');
    lien.href = url;
    lien.download = `prospects-${new Date().toISOString().slice(0, 10)}.csv`;
    lien.click();
    URL.revokeObjectURL(url);
  }, []);

  const importer = useCallback(async (contenu: string): Promise<ResultatImport | null> => {
    setImporting(true);
    setError(null);

    const lignes = parserProspectsCsv(contenu);
    let crees = 0;
    let misAJour = 0;

    for (const ligne of lignes) {
      const payload = {
        nom: ligne.nom,
        activite: ligne.activite,
        localisation: ligne.localisation,
        telephone: ligne.telephone,
        email: ligne.email,
        site_actuel: ligne.site_actuel,
        priorite: ligne.priorite,
        opportunite: ligne.opportunite,
        accroche: ligne.accroche,
        statut: ligne.statut,
        prochaine_relance: ligne.prochaine_relance,
        notes: ligne.notes,
      };

      // Rapprochement par id d'abord (export puis réimport = round-trip
      // exact, sans doublon), par nom ensuite (même convention que
      // scripts/seed.ts) pour permettre d'ajouter des prospects à la main.
      let existingId: string | null = null;
      if (ligne.id) {
        const { data } = await supabase.from('prospects').select('id').eq('id', ligne.id).maybeSingle();
        existingId = data?.id ?? null;
      }
      if (!existingId) {
        const { data } = await supabase.from('prospects').select('id').ilike('nom', ligne.nom).maybeSingle();
        existingId = data?.id ?? null;
      }

      if (existingId) {
        const { error: updateError } = await supabase.from('prospects').update(payload).eq('id', existingId);
        if (updateError) {
          setError(updateError.message);
          setImporting(false);
          return null;
        }
        misAJour += 1;
      } else {
        const { error: insertError } = await supabase.from('prospects').insert(payload);
        if (insertError) {
          setError(insertError.message);
          setImporting(false);
          return null;
        }
        crees += 1;
      }
    }

    setImporting(false);
    return { crees, misAJour };
  }, []);

  return { exporter, importer, exporting, importing, error };
}
