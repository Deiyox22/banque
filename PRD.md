# PRD — Dashboard de suivi prospects (ELS Tech)

## Contexte

Anthony (ELS Tech, Loudéac, Bretagne) est développeur solo. Il prospecte des TPE locales en leur envoyant une maquette de site cliquable (fichier HTML autonome). Il a besoin d'un outil personnel pour suivre chaque prospect, sa maquette, ses envois et leurs réponses — utilisable aussi bien au téléphone qu'à l'ordinateur.

## Objectif produit

Un tableau de bord qui répond en 5 secondes à :
- Qui dois-je contacter ou relancer aujourd'hui ?
- Qui est intéressé ?
- Quelle maquette ai-je envoyée à qui ?

## Utilisateur

Un seul utilisateur (Anthony). Connexion par e-mail + lien magique (Supabase Auth). Toutes les tables protégées par RLS sur `auth.uid()`.

## Stack

React 18 + Vite + TypeScript + Tailwind CSS. Supabase (Postgres, Auth, Storage). Déploiement Vercel. TanStack Table (vue tableau) et dnd-kit (Kanban glisser-déposer) autorisés ; sinon pas de bibliothèque lourde, un composant par responsabilité. Interface entièrement en français.

## Donnée source (seed)

Le fichier `seed/recap_maquettes_els_tech.xlsx` contient **trois feuilles**, pas une seule :

| Feuille | Contenu |
|---|---|
| **Maquettes** | N°, Entreprise, Activité, Téléphone, E-mail, Priorité, Site actuel, nom du fichier maquette, Parcours démo, Identité reprise, À valider avec le client, Statut d'envoi, Date d'envoi, Réponse/notes |
| **Prospects** | N°, Entreprise, Activité, **Localisation**, Téléphone, Email, Site web, Priorité, **Opportunité**, **Accroche (brouillon)**, Statut, Notes |
| **Légende** | Notes d'usage pour le tableau Excel — pas des données, ignorée par le seed |

**Écart avec le brief initial à noter** : le brief ne mentionnait que la feuille "Maquettes". La feuille "Prospects" apporte des champs utiles qui n'étaient pas dans le schéma proposé : `localisation`, `opportunite` et surtout **`accroche`** (un brouillon de message d'approche personnalisé par prospect, déjà rédigé). Le script de seed fusionne les deux feuilles par numéro de ligne (N°) / nom d'entreprise. Le schéma `prospects` ci-dessous intègre ces trois champs en plus de ceux du brief.

16 prospects, 16 maquettes HTML (une par prospect, dans `seed/maquettes/`).

## Modèle de données

### `prospects`
id, user_id, nom, activite, localisation, telephone, email, site_actuel, priorite (Haute/Moyenne/Basse), opportunite, accroche, statut, prochaine_relance (date), notes, created_at, updated_at.

Statuts (ordre du pipeline) : À contacter, Maquette prête, Envoyée, Vue, Relancée, Intéressé, RDV pris, Gagné, Refus, Sans réponse.

### `mockups`
id, user_id, prospect_id, nom_fichier, version, storage_path, parcours_demo, identite_reprise, a_valider, created_at.

**Écart avec le brief** : le brief proposait une colonne `url` (URL signée Supabase Storage). Une URL signée expire (quelques minutes à quelques heures) — la stocker en base la rendrait obsolète. À la place, on stocke `storage_path` (chemin stable dans le bucket privé) et l'URL signée est générée à la demande, côté client, au moment d'afficher la maquette.

### `activities` (journal)
id, user_id, prospect_id, mockup_id (optionnel), type (mail_envoyé, sms_envoyé, appel, réponse_reçue, relance, rdv, note), canal, contenu, date, issue (optionnel : intéressé, pas_intéressé, à_rappeler, sans_réponse), created_at.

### `templates`
id, user_id, nom, canal (sms/mail), objet (optionnel), corps avec variables `{{nom}}`, `{{activité}}`, `{{lien_maquette}}`, `{{ma_signature}}`.

### `settings`
Une ligne par utilisateur (clé primaire = `user_id`) : délai de relance (jours, défaut 4), signature.

## Règle métier : activité → statut + prochaine relance

Quand une activité est ajoutée, le statut du prospect est mis à jour et `prochaine_relance` recalculée (+N jours après un envoi, N réglable dans les paramètres). Le statut reste modifiable à la main ensuite.

**Décision d'architecture** : cette règle vit dans une fonction TypeScript pure et testée (`applyActivityToProspect` ou équivalent), appelée par le code applicatif après l'insertion d'une activité — pas un trigger SQL. Le brief demande explicitement des tests unitaires sur cette règle ; un trigger Postgres n'est pas testable avec les mêmes outils (Vitest). La logique reste donc côté application, où elle est facile à tester et à faire évoluer.

## Écrans

1. **Aujourd'hui** — à contacter, relances en retard/du jour, nouvelles réponses, maquettes à finaliser. Actions rapides par ligne : ouvrir la maquette, copier le message, noter une réponse.
2. **Pipeline** — vue Kanban (glisser-déposer par statut) et vue Tableau (tri, filtres, recherche). Pastille de couleur par priorité.
3. **Fiche prospect** — coordonnées (boutons appeler/SMS/mail), aperçu maquette en iframe `sandbox` (bascule Mobile/Ordinateur), liste des versions, journal chronologique, ajout rapide d'activité, notes, prochaine relance.
4. **Maquettes** — galerie de cartes (vignette, prospect, parcours démo, statut d'envoi), bouton "Téléverser une nouvelle version".
5. **Messages** — gestion des modèles SMS/mail, bouton "Préparer le message" (remplit un modèle pour un prospect, copie dans le presse-papiers). Pas d'envoi automatique.
6. **Statistiques** — entonnoir (contactés → vus → réponses → intéressés → gagnés), taux de réponse, délai moyen de réponse, répartition par statut/type d'activité, prospects sans réponse depuis 10+ jours.
7. **Paramètres** — délai de relance, signature, import/export CSV.

## Exigences transverses

- Mobile d'abord, barre d'onglets en bas sur téléphone. Mode clair par défaut, mode sombre en option.
- Accessibilité : focus visible, contrastes suffisants, tout au clavier.
- Sécurité maquettes : fichiers HTML autonomes, **jamais exécutés hors d'une iframe `sandbox`**, jamais rendus publics (bucket privé, URLs signées courtes).
- Données minimales et privées, pas de suivi tiers. Modèles de mail : phrase de désinscription obligatoire.
- Gestion d'erreurs lisible, états vides utiles, chargements visibles.
- Tests unitaires : règle activité→statut/relance, remplissage des variables de modèles.
- `README.md` : installation, variables d'environnement Supabase, migration SQL, commande de seed, déploiement Vercel.

## Hors périmètre V1

Envoi automatique de mails/SMS, multi-utilisateurs, paiement, génération automatique de maquettes. Listées comme idées futures dans la ROADMAP.
