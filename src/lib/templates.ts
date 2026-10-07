export interface VariablesTemplate {
  nom?: string | null;
  activité?: string | null;
  lien_maquette?: string | null;
  ma_signature?: string | null;
}

const MOTIF_VARIABLE = /\{\{\s*([^}]+?)\s*\}\}/g;

/**
 * Remplit les variables `{{nom}}`, `{{activité}}`, `{{lien_maquette}}`,
 * `{{ma_signature}}` d'un corps de modèle. Fonction pure, sans effet de
 * bord : le texte final ne contient jamais de `{{...}}` résiduel — une
 * variable manquante (ou inconnue) est simplement remplacée par une chaîne
 * vide plutôt que laissée telle quelle.
 */
export function remplirTemplate(corps: string, variables: VariablesTemplate): string {
  return corps.replace(MOTIF_VARIABLE, (_match, nomVariable: string) => {
    const valeur = (variables as Record<string, string | null | undefined>)[nomVariable];
    return valeur ?? '';
  });
}
