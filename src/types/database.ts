// Types alignés sur supabase/schema.sql. À remplacer par
// `supabase gen types typescript` une fois le projet Supabase lié
// (voir README.md) — en attendant, à tenir à jour à la main.

export type Priorite = 'Haute' | 'Moyenne' | 'Basse';

export type StatutProspect =
  | 'À contacter'
  | 'Maquette prête'
  | 'Envoyée'
  | 'Vue'
  | 'Relancée'
  | 'Intéressé'
  | 'RDV pris'
  | 'Gagné'
  | 'Refus'
  | 'Sans réponse';

export type TypeActivite =
  | 'mail_envoyé'
  | 'sms_envoyé'
  | 'appel'
  | 'réponse_reçue'
  | 'relance'
  | 'rdv'
  | 'note';

export type IssueActivite = 'intéressé' | 'pas_intéressé' | 'à_rappeler' | 'sans_réponse';

export type CanalTemplate = 'sms' | 'mail';

export interface Prospect {
  id: string;
  user_id: string;
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
  prochaine_relance: string | null; // date ISO (yyyy-mm-dd)
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Mockup {
  id: string;
  user_id: string;
  prospect_id: string;
  nom_fichier: string;
  version: number;
  storage_path: string;
  parcours_demo: string | null;
  identite_reprise: string | null;
  a_valider: string | null;
  created_at: string;
}

export interface Activity {
  id: string;
  user_id: string;
  prospect_id: string;
  mockup_id: string | null;
  type: TypeActivite;
  canal: string | null;
  contenu: string | null;
  date: string; // timestamptz ISO
  issue: IssueActivite | null;
  created_at: string;
}

export interface Template {
  id: string;
  user_id: string;
  nom: string;
  canal: CanalTemplate;
  objet: string | null;
  corps: string;
  created_at: string;
  updated_at: string;
}

export interface Settings {
  user_id: string;
  delai_relance_jours: number;
  signature: string | null;
  created_at: string;
  updated_at: string;
}
