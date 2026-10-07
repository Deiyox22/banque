import type { Priorite, Prospect, StatutProspect } from '../types/database';

export const COLONNES_CSV = [
  'id',
  'nom',
  'activite',
  'localisation',
  'telephone',
  'email',
  'site_actuel',
  'priorite',
  'opportunite',
  'accroche',
  'statut',
  'prochaine_relance',
  'notes',
] as const;

type ColonneCsv = (typeof COLONNES_CSV)[number];

const PRIORITES_VALIDES: Priorite[] = ['Haute', 'Moyenne', 'Basse'];
const STATUTS_VALIDES: StatutProspect[] = [
  'À contacter',
  'Maquette prête',
  'Envoyée',
  'Vue',
  'Relancée',
  'Intéressé',
  'RDV pris',
  'Gagné',
  'Refus',
  'Sans réponse',
];
const DATE_ISO = /^\d{4}-\d{2}-\d{2}$/;

export interface LigneImportProspect {
  id: string | null;
  nom: string;
  activite: string | null;
  localisation: string | null;
  telephone: string | null;
  email: string | null;
  site_actuel: string | null;
  priorite: Priorite;
  opportunite: string | null;
  accroche: string | null;
  statut: StatutProspect;
  prochaine_relance: string | null;
  notes: string | null;
}

function echapperChampCsv(valeur: string): string {
  if (/[",\r\n]/.test(valeur)) {
    return `"${valeur.replace(/"/g, '""')}"`;
  }
  return valeur;
}

/** Sérialise des prospects en CSV (UTF-8, en-tête inclus). Fonction pure. */
export function prospectsVersCsv(prospects: Prospect[]): string {
  const lignes = [COLONNES_CSV.join(',')];

  for (const p of prospects) {
    const valeurs: Record<ColonneCsv, string> = {
      id: p.id,
      nom: p.nom,
      activite: p.activite ?? '',
      localisation: p.localisation ?? '',
      telephone: p.telephone ?? '',
      email: p.email ?? '',
      site_actuel: p.site_actuel ?? '',
      priorite: p.priorite,
      opportunite: p.opportunite ?? '',
      accroche: p.accroche ?? '',
      statut: p.statut,
      prochaine_relance: p.prochaine_relance ?? '',
      notes: p.notes ?? '',
    };
    lignes.push(COLONNES_CSV.map((colonne) => echapperChampCsv(valeurs[colonne])).join(','));
  }

  return lignes.join('\r\n');
}

/** Analyse un texte CSV (RFC 4180 : champs entre guillemets, virgules et retours à la ligne échappés). */
function parserCsv(contenu: string): string[][] {
  const lignes: string[][] = [];
  let ligne: string[] = [];
  let champ = '';
  let dansGuillemets = false;

  for (let i = 0; i < contenu.length; i++) {
    const car = contenu[i];

    if (dansGuillemets) {
      if (car === '"') {
        if (contenu[i + 1] === '"') {
          champ += '"';
          i++;
        } else {
          dansGuillemets = false;
        }
      } else {
        champ += car;
      }
      continue;
    }

    if (car === '"') {
      dansGuillemets = true;
    } else if (car === ',') {
      ligne.push(champ);
      champ = '';
    } else if (car === '\r') {
      // ignoré : traité avec le \n qui suit (ou en fin de champ sinon)
    } else if (car === '\n') {
      ligne.push(champ);
      lignes.push(ligne);
      ligne = [];
      champ = '';
    } else {
      champ += car;
    }
  }

  if (champ.length > 0 || ligne.length > 0) {
    ligne.push(champ);
    lignes.push(ligne);
  }

  return lignes.filter((l) => !(l.length === 1 && l[0].trim() === ''));
}

function mapperLigne(entetes: string[], valeurs: string[]): LigneImportProspect | null {
  const obtenir = (colonne: string) => {
    const index = entetes.indexOf(colonne);
    return index === -1 ? '' : (valeurs[index] ?? '').trim();
  };

  const nom = obtenir('nom');
  if (!nom) return null;

  const prioriteBrute = obtenir('priorite') as Priorite;
  const priorite = PRIORITES_VALIDES.includes(prioriteBrute) ? prioriteBrute : 'Moyenne';

  const statutBrut = obtenir('statut') as StatutProspect;
  const statut = STATUTS_VALIDES.includes(statutBrut) ? statutBrut : 'À contacter';

  const prochaineRelanceBrute = obtenir('prochaine_relance');
  const prochaine_relance = DATE_ISO.test(prochaineRelanceBrute) ? prochaineRelanceBrute : null;

  return {
    id: obtenir('id') || null,
    nom,
    activite: obtenir('activite') || null,
    localisation: obtenir('localisation') || null,
    telephone: obtenir('telephone') || null,
    email: obtenir('email') || null,
    site_actuel: obtenir('site_actuel') || null,
    priorite,
    opportunite: obtenir('opportunite') || null,
    accroche: obtenir('accroche') || null,
    statut,
    prochaine_relance,
    notes: obtenir('notes') || null,
  };
}

/**
 * Analyse un CSV de prospects (en-tête obligatoire). Une ligne sans `nom`
 * est ignorée. Une `priorite`/`statut` invalide retombe sur une valeur par
 * défaut plutôt que d'échouer — fonction pure, sans effet de bord Supabase.
 */
export function parserProspectsCsv(contenu: string): LigneImportProspect[] {
  const lignes = parserCsv(contenu);
  if (lignes.length === 0) return [];

  const [entete, ...reste] = lignes;
  const entetes = entete.map((colonne) => colonne.trim());

  return reste
    .map((valeurs) => mapperLigne(entetes, valeurs))
    .filter((ligne): ligne is LigneImportProspect => ligne !== null);
}
