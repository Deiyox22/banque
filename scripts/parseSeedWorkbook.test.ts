import { describe, expect, it } from 'vitest';
import { mergeProspectData } from './parseSeedWorkbook';

describe('mergeProspectData', () => {
  it('fusionne les deux feuilles par numéro de ligne', () => {
    const maquettes = [
      {
        'N°': 1,
        Entreprise: 'Armor Façade',
        Activité: 'Peinture',
        Téléphone: '06 62 64 39 70',
        'E-mail': 'armorfacade22@laposte.net',
        Priorité: 'Haute',
        'Site actuel': 'Site Wix',
        'Maquette (cliquer pour ouvrir)': 'maquette-armor-facade.html',
        'Parcours démo': 'Demande de devis',
        'Identité reprise': 'Mascotte, bleu et rouge',
        'À valider avec le client': 'Photos de chantier à ajouter',
      },
    ];
    const prospects = [
      {
        'N°': 1,
        Entreprise: 'Armor Façade',
        Activité: 'Peinture, ravalement',
        Localisation: 'Louargat (22540)',
        Téléphone: '06 62 64 39 70',
        Email: 'armorfacade22@laposte.net',
        'Site web': 'Site Wix',
        Priorité: 'Haute',
        Opportunité: 'Présence Wix gratuite',
        'Accroche (brouillon)': "Votre savoir-faire mérite mieux qu'un site en wixsite.com.",
        Notes: 'Page Facebook : 366 followers.',
      },
    ];

    const [result] = mergeProspectData(maquettes, prospects);

    expect(result.nom).toBe('Armor Façade');
    expect(result.localisation).toBe('Louargat (22540)');
    expect(result.opportunite).toBe('Présence Wix gratuite');
    expect(result.accroche).toContain('wixsite.com');
    expect(result.priorite).toBe('Haute');
    expect(result.mockup.nom_fichier).toBe('maquette-armor-facade.html');
    expect(result.mockup.parcours_demo).toBe('Demande de devis');
  });

  it("retombe sur la feuille Maquettes quand Prospects n'a pas la donnée", () => {
    const maquettes = [
      {
        'N°': 6,
        Entreprise: 'TDB Rénovation',
        Téléphone: '06 15 60 32 53',
        'E-mail': '',
        Priorité: 'Haute',
        'Maquette (cliquer pour ouvrir)': 'maquette-tdb-renovation.html',
      },
    ];
    const prospects = [
      {
        'N°': 6,
        Entreprise: 'TDB Rénovation',
        Téléphone: '',
        Email: '',
        Priorité: 'Haute',
      },
    ];

    const [result] = mergeProspectData(maquettes, prospects);

    expect(result.telephone).toBe('06 15 60 32 53');
    expect(result.email).toBeNull();
  });

  it('produit tout de même une fiche si la ligne Prospects correspondante est absente', () => {
    const maquettes = [
      {
        'N°': 99,
        Entreprise: 'Sans fiche prospect',
        'Maquette (cliquer pour ouvrir)': 'maquette-sans-fiche.html',
      },
    ];

    const [result] = mergeProspectData(maquettes, []);

    expect(result.nom).toBe('Sans fiche prospect');
    expect(result.localisation).toBeNull();
    expect(result.opportunite).toBeNull();
    expect(result.priorite).toBe('Moyenne');
  });

  it('ignore les lignes sans nom d’entreprise', () => {
    const maquettes = [
      { 'N°': '', Entreprise: '', 'Maquette (cliquer pour ouvrir)': '' },
      {
        'N°': 1,
        Entreprise: 'Seule ligne valide',
        'Maquette (cliquer pour ouvrir)': 'maquette-valide.html',
      },
    ];

    const result = mergeProspectData(maquettes, []);

    expect(result).toHaveLength(1);
    expect(result[0].nom).toBe('Seule ligne valide');
  });

  it('lève une erreur si une ligne valide n’a pas de fichier de maquette', () => {
    const maquettes = [{ 'N°': 1, Entreprise: 'Sans fichier', 'Maquette (cliquer pour ouvrir)': '' }];

    expect(() => mergeProspectData(maquettes, [])).toThrow(/aucun nom de fichier/);
  });
});
