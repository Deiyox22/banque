import { describe, expect, it } from 'vitest';
import { calculerStatistiques } from './statistiques';
import type { Activity, Prospect, StatutProspect, TypeActivite } from '../types/database';

let compteur = 0;

function prospect(statut: StatutProspect, createdAt = '2026-01-01T00:00:00.000Z'): Prospect {
  compteur += 1;
  return {
    id: `prospect-${compteur}`,
    user_id: 'user-1',
    nom: `Prospect ${compteur}`,
    activite: null,
    localisation: null,
    telephone: null,
    email: null,
    site_actuel: null,
    priorite: 'Moyenne',
    opportunite: null,
    accroche: null,
    statut,
    prochaine_relance: null,
    notes: null,
    created_at: createdAt,
    updated_at: createdAt,
  };
}

function activite(prospectId: string, type: TypeActivite, date: string): Activity {
  compteur += 1;
  return {
    id: `activite-${compteur}`,
    user_id: 'user-1',
    prospect_id: prospectId,
    mockup_id: null,
    type,
    canal: null,
    contenu: null,
    date,
    issue: null,
    created_at: date,
  };
}

describe('calculerStatistiques', () => {
  it("calcule l'entonnoir à partir du statut courant des prospects", () => {
    const prospects = [
      prospect('À contacter'),
      prospect('Maquette prête'),
      prospect('Envoyée'),
      prospect('Vue'),
      prospect('Intéressé'),
      prospect('RDV pris'),
      prospect('Gagné'),
      prospect('Refus'),
    ];
    const resultat = calculerStatistiques(prospects, []);

    // contactés : tout sauf "À contacter" et "Maquette prête" -> 6
    expect(resultat.entonnoir.contactes).toBe(6);
    // vus : Vue, Intéressé, RDV pris, Gagné -> 4
    expect(resultat.entonnoir.vus).toBe(4);
    // intéressés : Intéressé, RDV pris, Gagné -> 3
    expect(resultat.entonnoir.interesses).toBe(3);
    expect(resultat.entonnoir.gagnes).toBe(1);
  });

  it('taux de réponse = prospects avec réponse / prospects contactés', () => {
    const p1 = prospect('Envoyée');
    const p2 = prospect('Vue');
    const p3 = prospect('À contacter'); // pas contacté, exclu du dénominateur
    const activities = [activite(p1.id, 'mail_envoyé', '2026-01-01T00:00:00.000Z'), activite(p2.id, 'réponse_reçue', '2026-01-02T00:00:00.000Z')];

    const resultat = calculerStatistiques([p1, p2, p3], activities);
    expect(resultat.entonnoir.contactes).toBe(2);
    expect(resultat.entonnoir.reponses).toBe(1);
    expect(resultat.tauxReponse).toBeCloseTo(0.5);
  });

  it('taux de réponse = null si personne n\'a été contacté', () => {
    const resultat = calculerStatistiques([prospect('À contacter')], []);
    expect(resultat.tauxReponse).toBeNull();
  });

  it('délai moyen de réponse = écart entre le premier contact et la première réponse', () => {
    const p1 = prospect('Vue');
    const activities = [
      activite(p1.id, 'mail_envoyé', '2026-01-01T00:00:00.000Z'),
      activite(p1.id, 'réponse_reçue', '2026-01-04T00:00:00.000Z'),
    ];
    const resultat = calculerStatistiques([p1], activities);
    expect(resultat.delaiMoyenReponseJours).toBeCloseTo(3);
  });

  it('délai moyen = null si aucune réponse mesurable', () => {
    const p1 = prospect('Envoyée');
    const resultat = calculerStatistiques([p1], [activite(p1.id, 'mail_envoyé', '2026-01-01T00:00:00.000Z')]);
    expect(resultat.delaiMoyenReponseJours).toBeNull();
  });

  it('prospects sans réponse depuis 10+ jours : actif, sans réponse, dernier contact ancien', () => {
    const ancien = new Date();
    ancien.setDate(ancien.getDate() - 15);
    const recent = new Date();
    recent.setDate(recent.getDate() - 2);

    const p1 = prospect('Envoyée'); // ancien contact, pas de réponse -> doit apparaître
    const p2 = prospect('Envoyée'); // contact récent -> ne doit pas apparaître
    const p3 = prospect('Vue'); // ancien contact MAIS a répondu -> exclu
    const p4 = prospect('Refus'); // statut non actif -> exclu même si ancien

    const activities = [
      activite(p1.id, 'mail_envoyé', ancien.toISOString()),
      activite(p2.id, 'mail_envoyé', recent.toISOString()),
      activite(p3.id, 'mail_envoyé', ancien.toISOString()),
      activite(p3.id, 'réponse_reçue', ancien.toISOString()),
      activite(p4.id, 'mail_envoyé', ancien.toISOString()),
    ];

    const resultat = calculerStatistiques([p1, p2, p3, p4], activities);
    const ids = resultat.sansReponseDepuis10Jours.map((entree) => entree.prospect.id);
    expect(ids).toEqual([p1.id]);
    expect(resultat.sansReponseDepuis10Jours[0].joursDepuisDernierContact).toBeGreaterThanOrEqual(10);
  });

  it('répartition par statut et par type d\'activité dénombre correctement', () => {
    const p1 = prospect('Envoyée');
    const p2 = prospect('Envoyée');
    const p3 = prospect('Vue');
    const resultat = calculerStatistiques(
      [p1, p2, p3],
      [activite(p1.id, 'mail_envoyé', '2026-01-01T00:00:00.000Z'), activite(p2.id, 'mail_envoyé', '2026-01-01T00:00:00.000Z'), activite(p3.id, 'note', '2026-01-01T00:00:00.000Z')]
    );

    const envoyee = resultat.repartitionStatut.find((r) => r.statut === 'Envoyée');
    expect(envoyee?.nombre).toBe(2);
    const mail = resultat.repartitionTypeActivite.find((r) => r.type === 'mail_envoyé');
    expect(mail?.nombre).toBe(2);
  });
});
