import { describe, expect, it } from 'vitest';
import { prospectsVersCsv, parserProspectsCsv } from './csv';
import type { Prospect } from '../types/database';

function prospect(overrides: Partial<Prospect> = {}): Prospect {
  return {
    id: 'id-1',
    user_id: 'user-1',
    nom: 'Armor Façade',
    activite: 'Façadier',
    localisation: null,
    telephone: '0600000000',
    email: null,
    site_actuel: null,
    priorite: 'Haute',
    opportunite: null,
    accroche: null,
    statut: 'Envoyée',
    prochaine_relance: '2026-02-01',
    notes: null,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('CSV prospects : export puis import redonnent les mêmes données', () => {
  it('round-trip simple', () => {
    const prospects = [prospect()];
    const csv = prospectsVersCsv(prospects);
    const importe = parserProspectsCsv(csv);

    expect(importe).toHaveLength(1);
    expect(importe[0]).toEqual({
      id: 'id-1',
      nom: 'Armor Façade',
      activite: 'Façadier',
      localisation: null,
      telephone: '0600000000',
      email: null,
      site_actuel: null,
      priorite: 'Haute',
      opportunite: null,
      accroche: null,
      statut: 'Envoyée',
      prochaine_relance: '2026-02-01',
      notes: null,
    });
  });

  it('gère les champs contenant des virgules, guillemets et retours à la ligne', () => {
    const prospects = [
      prospect({
        nom: 'Boucherie "Chez Tata", Trévé',
        notes: 'Ligne 1\nLigne 2, avec virgule',
      }),
    ];
    const csv = prospectsVersCsv(prospects);
    const importe = parserProspectsCsv(csv);

    expect(importe[0].nom).toBe('Boucherie "Chez Tata", Trévé');
    expect(importe[0].notes).toBe('Ligne 1\nLigne 2, avec virgule');
  });

  it('plusieurs prospects : aucun doublon, chacun retrouvé par son id', () => {
    const prospects = [
      prospect({ id: 'id-1', nom: 'Armor Façade' }),
      prospect({ id: 'id-2', nom: 'Vulcain Chauffage' }),
    ];
    const importe = parserProspectsCsv(prospectsVersCsv(prospects));
    expect(importe.map((p) => p.id)).toEqual(['id-1', 'id-2']);
    expect(new Set(importe.map((p) => p.id)).size).toBe(2);
  });
});

describe('parserProspectsCsv : robustesse', () => {
  it('ignore une ligne sans nom', () => {
    const csv = 'id,nom,priorite,statut\n1,,Haute,Envoyée\n2,Vulcain,Haute,Envoyée';
    const importe = parserProspectsCsv(csv);
    expect(importe).toHaveLength(1);
    expect(importe[0].nom).toBe('Vulcain');
  });

  it('priorite ou statut invalide retombe sur une valeur par défaut', () => {
    const csv = 'nom,priorite,statut\nTest,Inconnue,StatutBidon';
    const importe = parserProspectsCsv(csv);
    expect(importe[0].priorite).toBe('Moyenne');
    expect(importe[0].statut).toBe('À contacter');
  });

  it('date de relance invalide -> null plutôt que de planter', () => {
    const csv = 'nom,prochaine_relance\nTest,pas-une-date';
    const importe = parserProspectsCsv(csv);
    expect(importe[0].prochaine_relance).toBeNull();
  });

  it('renvoie un tableau vide pour un contenu vide', () => {
    expect(parserProspectsCsv('')).toEqual([]);
  });
});
