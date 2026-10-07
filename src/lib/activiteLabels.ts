import type { IssueActivite, TypeActivite } from '../types/database';

export const TYPE_ACTIVITE_LABELS: Record<TypeActivite, string> = {
  mail_envoyé: 'Mail envoyé',
  sms_envoyé: 'SMS envoyé',
  appel: 'Appel',
  réponse_reçue: 'Réponse reçue',
  relance: 'Relance',
  rdv: 'RDV',
  note: 'Note',
};

export const ISSUE_ACTIVITE_LABELS: Record<IssueActivite, string> = {
  intéressé: 'Intéressé',
  pas_intéressé: 'Pas intéressé',
  à_rappeler: 'À rappeler',
  sans_réponse: 'Sans réponse',
};
