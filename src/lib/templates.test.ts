import { describe, expect, it } from 'vitest';
import { remplirTemplate } from './templates';

describe('remplirTemplate', () => {
  it('remplace toutes les variables présentes', () => {
    const resultat = remplirTemplate('Bonjour {{nom}}, voici votre maquette : {{lien_maquette}}. {{ma_signature}}', {
      nom: 'Armor Façade',
      activité: 'Façadier',
      lien_maquette: 'https://exemple.test/maquette',
      ma_signature: 'Anthony — ELS Tech',
    });
    expect(resultat).toBe(
      'Bonjour Armor Façade, voici votre maquette : https://exemple.test/maquette. Anthony — ELS Tech'
    );
  });

  it('variable manquante -> remplacée par une chaîne vide, pas de {{...}} résiduel', () => {
    const resultat = remplirTemplate('Bonjour {{nom}}, activité : {{activité}}.', {
      nom: 'Armor Façade',
      activité: null,
    });
    expect(resultat).toBe('Bonjour Armor Façade, activité : .');
    expect(resultat).not.toMatch(/\{\{.*\}\}/);
  });

  it('plusieurs occurrences de la même variable sont toutes remplacées', () => {
    const resultat = remplirTemplate('{{nom}} ! Merci {{nom}}, à bientôt {{nom}}.', { nom: 'Vulcain' });
    expect(resultat).toBe('Vulcain ! Merci Vulcain, à bientôt Vulcain.');
  });

  it('signature absente -> {{ma_signature}} remplacé par une chaîne vide', () => {
    const resultat = remplirTemplate('Cordialement, {{ma_signature}}', { ma_signature: null });
    expect(resultat).toBe('Cordialement, ');
    expect(resultat).not.toMatch(/\{\{.*\}\}/);
  });

  it('variable inconnue -> également remplacée par une chaîne vide (jamais de résidu)', () => {
    const resultat = remplirTemplate('Bonjour {{prenom}}', { nom: 'Armor' });
    expect(resultat).toBe('Bonjour ');
  });

  it('corps sans aucune variable -> renvoyé tel quel', () => {
    const resultat = remplirTemplate('Un message simple, sans variable.', {});
    expect(resultat).toBe('Un message simple, sans variable.');
  });
});
