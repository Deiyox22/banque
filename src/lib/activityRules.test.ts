import { describe, expect, it } from 'vitest';
import { applyActivityToProspect } from './activityRules';

describe('applyActivityToProspect', () => {
  it('envoi initial (mail) depuis "À contacter" -> Envoyée, relance à J+N', () => {
    const resultat = applyActivityToProspect(
      'À contacter',
      { type: 'mail_envoyé', date: '2026-01-10T09:00:00.000Z' },
      4
    );
    expect(resultat).toEqual({ statut: 'Envoyée', prochaine_relance: '2026-01-14' });
  });

  it('envoi initial (sms) depuis "Maquette prête" -> Envoyée', () => {
    const resultat = applyActivityToProspect(
      'Maquette prête',
      { type: 'sms_envoyé', date: '2026-01-10T09:00:00.000Z' },
      4
    );
    expect(resultat.statut).toBe('Envoyée');
  });

  it('relance explicite depuis "Envoyée" -> Relancée, nouvelle relance à J+N', () => {
    const resultat = applyActivityToProspect(
      'Envoyée',
      { type: 'relance', date: '2026-01-14T09:00:00.000Z' },
      4
    );
    expect(resultat).toEqual({ statut: 'Relancée', prochaine_relance: '2026-01-18' });
  });

  it('appel depuis un statut déjà contacté -> Relancée (pas Envoyée)', () => {
    const resultat = applyActivityToProspect(
      'Vue',
      { type: 'appel', date: '2026-01-14T09:00:00.000Z' },
      4
    );
    expect(resultat.statut).toBe('Relancée');
  });

  it('réponse reçue, issue "intéressé" -> Intéressé, relance programmée', () => {
    const resultat = applyActivityToProspect(
      'Envoyée',
      { type: 'réponse_reçue', issue: 'intéressé', date: '2026-01-15T09:00:00.000Z' },
      5
    );
    expect(resultat).toEqual({ statut: 'Intéressé', prochaine_relance: '2026-01-20' });
  });

  it('réponse reçue, issue "pas_intéressé" -> Refus, pas de relance', () => {
    const resultat = applyActivityToProspect(
      'Envoyée',
      { type: 'réponse_reçue', issue: 'pas_intéressé', date: '2026-01-15T09:00:00.000Z' },
      4
    );
    expect(resultat).toEqual({ statut: 'Refus', prochaine_relance: null });
  });

  it('réponse reçue, issue "à_rappeler" -> Relancée, relance programmée', () => {
    const resultat = applyActivityToProspect(
      'Envoyée',
      { type: 'réponse_reçue', issue: 'à_rappeler', date: '2026-01-15T09:00:00.000Z' },
      4
    );
    expect(resultat).toEqual({ statut: 'Relancée', prochaine_relance: '2026-01-19' });
  });

  it('réponse reçue, issue "sans_réponse" -> Sans réponse, pas de relance', () => {
    const resultat = applyActivityToProspect(
      'Relancée',
      { type: 'réponse_reçue', issue: 'sans_réponse', date: '2026-01-15T09:00:00.000Z' },
      4
    );
    expect(resultat).toEqual({ statut: 'Sans réponse', prochaine_relance: null });
  });

  it('rdv -> RDV pris, pas de relance automatique', () => {
    const resultat = applyActivityToProspect(
      'Intéressé',
      { type: 'rdv', date: '2026-01-16T09:00:00.000Z' },
      4
    );
    expect(resultat).toEqual({ statut: 'RDV pris', prochaine_relance: null });
  });

  it('note simple -> aucun impact sur le statut ni la relance', () => {
    const resultat = applyActivityToProspect(
      'Relancée',
      { type: 'note', date: '2026-01-16T09:00:00.000Z' },
      4
    );
    expect(resultat).toEqual({ statut: 'Relancée', prochaine_relance: undefined });
  });
});
