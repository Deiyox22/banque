// Certains prospects n'ont pas de numéro exploitable : le classeur source
// indique alors "Via Facebook" (parfois suivi du nom de la page entre
// parenthèses) dans la colonne téléphone. On le détecte ici pour proposer
// une vraie action (recherche Facebook) plutôt que des boutons
// Appeler/SMS cassés sur un texte qui n'est pas un numéro.
const VIA_FACEBOOK = /^via facebook\s*(?:\(([^)]+)\))?\s*$/i;

export interface InfosContact {
  viaFacebook: boolean;
  nomFacebook: string | null;
}

export function analyserTelephone(telephone: string | null, nomEntreprise: string): InfosContact {
  if (!telephone) return { viaFacebook: false, nomFacebook: null };
  const correspondance = telephone.trim().match(VIA_FACEBOOK);
  if (!correspondance) return { viaFacebook: false, nomFacebook: null };
  return { viaFacebook: true, nomFacebook: correspondance[1]?.trim() || nomEntreprise };
}

export function lienRechercheFacebook(nom: string): string {
  return `https://www.facebook.com/search/top?q=${encodeURIComponent(nom)}`;
}
