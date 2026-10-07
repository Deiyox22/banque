import * as XLSX from 'xlsx';
import { readFileSync } from 'node:fs';
import type { Priorite } from '../src/types/database';

// Le classeur de seed a 3 feuilles : "Maquettes" (une ligne par maquette déjà
// construite), "Prospects" (données de prospection plus riches : localisation,
// opportunité, accroche) et "Légende" (notes d'usage, ignorée ici). Les deux
// premières partagent le même numéro de ligne (colonne N°) pour un même
// prospect — c'est la clé de fusion.

interface MaquetteRow {
  'N°': string | number;
  Entreprise: string;
  Activité?: string;
  Téléphone?: string;
  'E-mail'?: string;
  Priorité?: string;
  'Site actuel'?: string;
  'Maquette (cliquer pour ouvrir)'?: string;
  'Parcours démo'?: string;
  'Identité reprise'?: string;
  'À valider avec le client'?: string;
}

interface ProspectRow {
  'N°': string | number;
  Entreprise: string;
  Activité?: string;
  Localisation?: string;
  Téléphone?: string;
  Email?: string;
  'Site web'?: string;
  Priorité?: string;
  Opportunité?: string;
  'Accroche (brouillon)'?: string;
  Notes?: string;
}

export interface MergedProspect {
  numero: string;
  nom: string;
  activite: string | null;
  localisation: string | null;
  telephone: string | null;
  email: string | null;
  site_actuel: string | null;
  priorite: Priorite;
  opportunite: string | null;
  accroche: string | null;
  notes: string | null;
  mockup: {
    nom_fichier: string;
    parcours_demo: string | null;
    identite_reprise: string | null;
    a_valider: string | null;
  };
}

function normalise(value: string | number | undefined | null): string | null {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text.length ? text : null;
}

function normalisePriorite(value: string | number | undefined | null): Priorite {
  const text = normalise(value);
  if (text === 'Haute' || text === 'Moyenne' || text === 'Basse') return text;
  return 'Moyenne';
}

export function readWorkbook(filePath: string): XLSX.WorkBook {
  // XLSX.readFile n'est exposé que sur l'export par défaut en ESM (bizarrerie
  // d'interop CJS/ESM du paquet xlsx) ; on lit le buffer nous-mêmes et on
  // utilise XLSX.read, qui est un export nommé stable.
  const buffer = readFileSync(filePath);
  return XLSX.read(buffer, { type: 'buffer' });
}

export function parseMaquettesSheet(workbook: XLSX.WorkBook): MaquetteRow[] {
  const sheet = workbook.Sheets['Maquettes'];
  if (!sheet) throw new Error('Feuille "Maquettes" introuvable dans le classeur de seed.');
  return XLSX.utils.sheet_to_json<MaquetteRow>(sheet, { defval: '' });
}

export function parseProspectsSheet(workbook: XLSX.WorkBook): ProspectRow[] {
  const sheet = workbook.Sheets['Prospects'];
  if (!sheet) throw new Error('Feuille "Prospects" introuvable dans le classeur de seed.');
  return XLSX.utils.sheet_to_json<ProspectRow>(sheet, { defval: '' });
}

/**
 * Fusionne les deux feuilles par numéro de ligne. La feuille "Prospects" est
 * prioritaire pour les champs qu'elle seule porte (localisation, opportunité,
 * accroche, notes) ; pour les champs présents dans les deux (téléphone,
 * email, activité, priorité), on préfère "Prospects" et on retombe sur
 * "Maquettes" si la valeur y est vide.
 */
export function mergeProspectData(
  maquettes: MaquetteRow[],
  prospects: ProspectRow[]
): MergedProspect[] {
  const prospectsByNumero = new Map(
    prospects.map((row) => [String(row['N°']).trim(), row])
  );

  return maquettes
    .filter((row) => normalise(row.Entreprise))
    .map((maquetteRow) => {
      const numero = String(maquetteRow['N°']).trim();
      const prospectRow = prospectsByNumero.get(numero);

      const nomFichier = normalise(maquetteRow['Maquette (cliquer pour ouvrir)']);
      if (!nomFichier) {
        throw new Error(
          `Ligne ${numero} (${maquetteRow.Entreprise}) : aucun nom de fichier de maquette renseigné.`
        );
      }

      return {
        numero,
        nom: String(maquetteRow.Entreprise).trim(),
        activite: normalise(prospectRow?.Activité) ?? normalise(maquetteRow.Activité),
        localisation: normalise(prospectRow?.Localisation),
        telephone: normalise(prospectRow?.Téléphone) ?? normalise(maquetteRow.Téléphone),
        email: normalise(prospectRow?.Email) ?? normalise(maquetteRow['E-mail']),
        site_actuel: normalise(maquetteRow['Site actuel']) ?? normalise(prospectRow?.['Site web']),
        priorite: normalisePriorite(prospectRow?.Priorité ?? maquetteRow.Priorité),
        opportunite: normalise(prospectRow?.Opportunité),
        accroche: normalise(prospectRow?.['Accroche (brouillon)']),
        notes: normalise(prospectRow?.Notes),
        mockup: {
          nom_fichier: nomFichier,
          parcours_demo: normalise(maquetteRow['Parcours démo']),
          identite_reprise: normalise(maquetteRow['Identité reprise']),
          a_valider: normalise(maquetteRow['À valider avec le client']),
        },
      };
    });
}
