import { describe, expect, it } from 'vitest';
import { analyserTelephone, lienRechercheFacebook } from './contact';

describe('analyserTelephone', () => {
  it('détecte "Via Facebook (Nom)" et extrait le nom de la page', () => {
    const resultat = analyserTelephone('Via Facebook (Tata Aude)', 'Boucherie de Trévé');
    expect(resultat).toEqual({ viaFacebook: true, nomFacebook: 'Tata Aude' });
  });

  it('détecte "Via Facebook" sans nom -> retombe sur le nom de l\'entreprise', () => {
    const resultat = analyserTelephone('Via Facebook', 'Vulcain Chauffage');
    expect(resultat).toEqual({ viaFacebook: true, nomFacebook: 'Vulcain Chauffage' });
  });

  it('insensible à la casse et aux espaces superflus', () => {
    const resultat = analyserTelephone('  via facebook (SK2H)  ', 'SK2H');
    expect(resultat).toEqual({ viaFacebook: true, nomFacebook: 'SK2H' });
  });

  it('un vrai numéro de téléphone -> pas Facebook', () => {
    const resultat = analyserTelephone('06 62 64 39 70', 'Armor Façade');
    expect(resultat).toEqual({ viaFacebook: false, nomFacebook: null });
  });

  it('téléphone absent -> pas Facebook', () => {
    const resultat = analyserTelephone(null, 'Armor Façade');
    expect(resultat).toEqual({ viaFacebook: false, nomFacebook: null });
  });
});

describe('lienRechercheFacebook', () => {
  it('encode correctement le nom dans l\'URL de recherche', () => {
    expect(lienRechercheFacebook('Tata Aude')).toBe('https://www.facebook.com/search/top?q=Tata%20Aude');
  });
});
