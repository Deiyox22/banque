import type { Activity, Prospect, StatutProspect, TypeActivite } from '../types/database';

const STATUTS_CONTACTES: StatutProspect[] = [
  'Envoyée',
  'Vue',
  'Relancée',
  'Intéressé',
  'RDV pris',
  'Gagné',
  'Refus',
  'Sans réponse',
];
const STATUTS_VUS: StatutProspect[] = ['Vue', 'Relancée', 'Intéressé', 'RDV pris', 'Gagné'];
const STATUTS_INTERESSES: StatutProspect[] = ['Intéressé', 'RDV pris', 'Gagné'];
const STATUTS_ACTIFS: StatutProspect[] = ['Envoyée', 'Vue', 'Relancée'];

const TYPES_CONTACT: TypeActivite[] = ['mail_envoyé', 'sms_envoyé', 'appel', 'relance'];
const JOURS_SANS_REPONSE_SEUIL = 10;

export interface Entonnoir {
  contactes: number;
  vus: number;
  reponses: number;
  interesses: number;
  gagnes: number;
}

export interface ProspectSansReponse {
  prospect: Prospect;
  joursDepuisDernierContact: number;
}

export interface Statistiques {
  entonnoir: Entonnoir;
  /** 0..1, `null` si personne n'a encore été contacté. */
  tauxReponse: number | null;
  /** `null` si aucune réponse n'est mesurable (aucun contact + réponse sur le même prospect). */
  delaiMoyenReponseJours: number | null;
  repartitionStatut: { statut: StatutProspect; nombre: number }[];
  repartitionTypeActivite: { type: TypeActivite; nombre: number }[];
  sansReponseDepuis10Jours: ProspectSansReponse[];
}

function joursEntre(dateDebut: string, dateFin: string): number {
  const debut = new Date(dateDebut).getTime();
  const fin = new Date(dateFin).getTime();
  return (fin - debut) / (1000 * 60 * 60 * 24);
}

/**
 * Calcule les statistiques de l'écran Statistiques à partir des prospects et
 * du journal d'activités. Fonction pure, sans effet de bord Supabase (même
 * logique que `src/lib/activityRules.ts`) : le hook appelant fait les
 * requêtes et lui passe les données brutes.
 *
 * L'entonnoir est dérivé du statut courant des prospects (pas d'historique
 * de statuts conservé) : un prospect « Vue » puis refusé plus tard
 * disparaît du palier « vus » une fois passé en « Refus ». Les métriques
 * basées sur le journal (taux de réponse, délai moyen) restent exactes
 * puisqu'elles s'appuient sur les activités réellement enregistrées.
 */
export function calculerStatistiques(prospects: Prospect[], activities: Activity[]): Statistiques {
  const aujourdhui = new Date().toISOString();

  const contactes = prospects.filter((p) => STATUTS_CONTACTES.includes(p.statut));
  const vus = prospects.filter((p) => STATUTS_VUS.includes(p.statut));
  const interesses = prospects.filter((p) => STATUTS_INTERESSES.includes(p.statut));
  const gagnes = prospects.filter((p) => p.statut === 'Gagné');

  const activitesParProspect = new Map<string, Activity[]>();
  for (const activite of activities) {
    const liste = activitesParProspect.get(activite.prospect_id) ?? [];
    liste.push(activite);
    activitesParProspect.set(activite.prospect_id, liste);
  }

  const prospectsAvecReponse = new Set(
    activities.filter((a) => a.type === 'réponse_reçue').map((a) => a.prospect_id)
  );

  const tauxReponse = contactes.length > 0 ? prospectsAvecReponse.size / contactes.length : null;

  const delais: number[] = [];
  for (const liste of activitesParProspect.values()) {
    const premierContact = liste
      .filter((a) => TYPES_CONTACT.includes(a.type))
      .sort((a, b) => a.date.localeCompare(b.date))[0];
    const premiereReponse = liste
      .filter((a) => a.type === 'réponse_reçue')
      .sort((a, b) => a.date.localeCompare(b.date))[0];
    if (premierContact && premiereReponse && premiereReponse.date >= premierContact.date) {
      delais.push(joursEntre(premierContact.date, premiereReponse.date));
    }
  }
  const delaiMoyenReponseJours =
    delais.length > 0 ? delais.reduce((somme, jours) => somme + jours, 0) / delais.length : null;

  const repartitionStatutMap = new Map<StatutProspect, number>();
  for (const prospect of prospects) {
    repartitionStatutMap.set(prospect.statut, (repartitionStatutMap.get(prospect.statut) ?? 0) + 1);
  }
  const repartitionStatut = Array.from(repartitionStatutMap.entries()).map(([statut, nombre]) => ({
    statut,
    nombre,
  }));

  const repartitionTypeMap = new Map<TypeActivite, number>();
  for (const activite of activities) {
    repartitionTypeMap.set(activite.type, (repartitionTypeMap.get(activite.type) ?? 0) + 1);
  }
  const repartitionTypeActivite = Array.from(repartitionTypeMap.entries()).map(([type, nombre]) => ({
    type,
    nombre,
  }));

  const sansReponseDepuis10Jours: ProspectSansReponse[] = [];
  for (const prospect of prospects) {
    if (!STATUTS_ACTIFS.includes(prospect.statut)) continue;
    if (prospectsAvecReponse.has(prospect.id)) continue;

    const liste = (activitesParProspect.get(prospect.id) ?? [])
      .filter((a) => TYPES_CONTACT.includes(a.type))
      .sort((a, b) => b.date.localeCompare(a.date));
    const dateReference = liste[0]?.date ?? prospect.created_at;
    const jours = joursEntre(dateReference, aujourdhui);

    if (jours >= JOURS_SANS_REPONSE_SEUIL) {
      sansReponseDepuis10Jours.push({ prospect, joursDepuisDernierContact: Math.floor(jours) });
    }
  }
  sansReponseDepuis10Jours.sort((a, b) => b.joursDepuisDernierContact - a.joursDepuisDernierContact);

  return {
    entonnoir: {
      contactes: contactes.length,
      vus: vus.length,
      reponses: prospectsAvecReponse.size,
      interesses: interesses.length,
      gagnes: gagnes.length,
    },
    tauxReponse,
    delaiMoyenReponseJours,
    repartitionStatut,
    repartitionTypeActivite,
    sansReponseDepuis10Jours,
  };
}
