# ROADMAP — Dashboard de suivi prospects (ELS Tech)

Un commit par jalon. Chaque jalon doit être vérifiable concrètement (pas seulement "le code compile").

## J0 — Documentation et schéma (en cours, avant tout code)

- `PRD.md`, `CLAUDE.md`, `ROADMAP.md`.
- `supabase/schema.sql` : tables + RLS.
- **Arrêt pour validation avant d'écrire la moindre ligne de code applicatif.**

## J1 — Base de données et seed

- Scaffold Vite + React 18 + TypeScript + Tailwind.
- Connexion Supabase (`src/lib/supabase.ts`), authentification par lien magique, page de connexion.
- Migrations Supabase (reprises de `supabase/schema.sql`), RLS activée et vérifiée (un utilisateur non connecté ne voit rien).
- Bucket Storage privé `mockups`, politique d'accès authentifié uniquement.
- `scripts/seed.ts` : lit les feuilles "Maquettes" et "Prospects" du xlsx, fusionne par N°/entreprise, crée les 16 prospects, téléverse les 16 fichiers de `seed/maquettes/`, les rattache. Idempotent (relançable sans doublon — upsert par nom d'entreprise ou clé stable).
- **Vérifiable** : `npm run seed` deux fois de suite → toujours 16 prospects, 16 maquettes, pas de doublon. Les données sont visibles dans le dashboard Supabase.

## J2 — Pipeline et fiche prospect

- Écran Pipeline : vue Tableau (TanStack Table — tri, filtres statut/priorité/activité, recherche) et vue Kanban (dnd-kit — glisser-déposer entre statuts, mise à jour immédiate).
- Écran Fiche prospect : coordonnées avec boutons appeler/SMS/mail (liens `tel:`/`sms:`/`mailto:`), notes, prochaine relance, liste des versions de maquette (sans l'aperçu iframe — J3).
- Pastille de couleur par priorité partout où un prospect est listé.
- **Vérifiable** : on peut faire glisser un prospect d'une colonne à l'autre dans le Kanban et le retrouver au même statut dans la vue Tableau après rechargement.

## J3 — Aperçu des maquettes

- Dans la Fiche prospect : aperçu de la maquette en `<iframe sandbox>`, bascule Mobile/Ordinateur (largeur de l'iframe), URL signée générée à l'affichage (jamais stockée).
- Écran Maquettes : galerie de cartes (vignette, prospect, parcours démo, statut d'envoi), upload d'une nouvelle version (`.html`), incrémentation automatique de version.
- **Vérifiable** : ouvrir une fiche prospect affiche sa maquette réelle dans l'iframe, sans qu'elle soit jamais accessible par une URL publique directe.

## J4 — Journal et relances

- Ajout rapide d'activité depuis la fiche prospect (type, canal, contenu, issue).
- `src/lib/activityRules.ts` : `applyActivityToProspect()` — calcule le nouveau statut et `prochaine_relance` (+N jours, N depuis les paramètres) à partir du type d'activité. **Tests Vitest** sur cette fonction (cas : envoi initial, relance, réponse reçue avec chaque issue, note simple sans impact sur le statut).
- Écran Aujourd'hui : à contacter, relances en retard/du jour, nouvelles réponses, maquettes à finaliser — branché sur les vraies données.
- **Vérifiable** : ajouter une activité "mail_envoyé" sur un prospect "À contacter" le fait passer à "Envoyée" avec une `prochaine_relance` à J+4 (ou valeur réglée) ; les tests passent.

## J5 — Messages

- Écran Messages : CRUD des modèles SMS/mail.
- `src/lib/templates.ts` : remplissage de `{{nom}}`, `{{activité}}`, `{{lien_maquette}}`, `{{ma_signature}}`. **Tests Vitest** sur le remplissage (variable manquante, plusieurs occurrences, signature absente).
- Bouton "Préparer le message" sur la fiche prospect : choisit un modèle, le remplit, copie dans le presse-papiers, propose d'enregistrer l'activité d'envoi en un clic.
- **Vérifiable** : préparer un message pour un prospect donné produit un texte sans `{{...}}` résiduel, copié dans le presse-papiers.

## J6 — Statistiques et finitions

- Écran Statistiques : entonnoir (contactés → vus → réponses → intéressés → gagnés), taux de réponse, délai moyen de réponse, répartition par statut/type d'activité, prospects sans réponse depuis 10+ jours.
- Écran Paramètres : délai de relance, signature, import CSV, export CSV.
- Passes finitions : accessibilité (focus visible, contrastes, navigation clavier complète), mode sombre, états vides, messages d'erreur lisibles sur chaque écran.
- `README.md` complet : installation, variables d'environnement, migration SQL, commande de seed, déploiement Vercel.
- **Vérifiable** : parcours complet au clavier seul sur chaque écran ; export puis import CSV redonnent les mêmes prospects sans doublon.

## Idées pour plus tard (hors périmètre V1)

- Envoi automatique de mails/SMS depuis l'application (actuellement : préparation + copie, envoi manuel).
- Multi-utilisateurs (actuellement : un seul compte, RLS déjà prête pour une éventuelle extension via `user_id`).
- Paiement / facturation des prestations.
- Génération automatique de maquettes à partir d'un brief.
