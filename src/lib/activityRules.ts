import type { IssueActivite, StatutProspect, TypeActivite } from '../types/database';

export interface ActiviteAAppliquer {
  type: TypeActivite;
  issue?: IssueActivite | null;
  /** Date de l'activité (ISO), point de départ du calcul de la prochaine relance. */
  date: string;
}

export interface ResultatApplicationActivite {
  statut: StatutProspect;
  /**
   * `undefined` = ne touche pas au champ existant (ex. une simple note).
   * `null` = efface la prochaine relance (plus de suivi automatique à prévoir).
   * `string` (yyyy-mm-dd) = nouvelle date de relance.
   */
  prochaine_relance: string | null | undefined;
}

// Avant le premier contact réel : le statut suivant est "Envoyée" plutôt que
// "Relancée". Au-delà, tout nouveau contact est une relance.
const STATUTS_AVANT_PREMIER_CONTACT: StatutProspect[] = ['À contacter', 'Maquette prête'];

function ajouterJours(dateIso: string, jours: number): string {
  const date = new Date(dateIso);
  date.setDate(date.getDate() + jours);
  return date.toISOString().slice(0, 10);
}

/**
 * Règle métier "activité → statut + prochaine relance", fonction pure sans
 * effet de bord Supabase (voir CLAUDE.md). Le code appelant lit le résultat
 * et fait l'update Supabase.
 */
export function applyActivityToProspect(
  statutActuel: StatutProspect,
  activite: ActiviteAAppliquer,
  delaiRelanceJours: number
): ResultatApplicationActivite {
  const dansNJours = (jours: number) => ajouterJours(activite.date, jours);

  switch (activite.type) {
    case 'mail_envoyé':
    case 'sms_envoyé':
    case 'appel':
    case 'relance': {
      const premierContact = STATUTS_AVANT_PREMIER_CONTACT.includes(statutActuel);
      return {
        statut: premierContact ? 'Envoyée' : 'Relancée',
        prochaine_relance: dansNJours(delaiRelanceJours),
      };
    }

    case 'réponse_reçue': {
      switch (activite.issue) {
        case 'intéressé':
          return { statut: 'Intéressé', prochaine_relance: dansNJours(delaiRelanceJours) };
        case 'pas_intéressé':
          return { statut: 'Refus', prochaine_relance: null };
        case 'à_rappeler':
          return { statut: 'Relancée', prochaine_relance: dansNJours(delaiRelanceJours) };
        case 'sans_réponse':
        default:
          return { statut: 'Sans réponse', prochaine_relance: null };
      }
    }

    case 'rdv':
      return { statut: 'RDV pris', prochaine_relance: null };

    case 'note':
    default:
      return { statut: statutActuel, prochaine_relance: undefined };
  }
}
