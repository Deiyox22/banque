# Suivi prospects — ELS Tech

Tableau de bord personnel pour suivre la prospection de TPE locales (maquettes de sites envoyées, relances, réponses). Voir `PRD.md` pour le produit et `ROADMAP.md` pour l'avancement.

## Stack

React 18 + Vite + TypeScript + Tailwind CSS · Supabase (Postgres, Auth, Storage) · Vercel.

## Installation

```bash
npm install
cp .env.example .env
```

Renseignez `.env` (jamais commité) :

| Variable | Où la trouver |
|---|---|
| `VITE_SUPABASE_URL` | Dashboard Supabase → Project Settings → API |
| `VITE_SUPABASE_ANON_KEY` | idem, clé `anon` / `public` |
| `SUPABASE_URL` | identique à `VITE_SUPABASE_URL` |
| `SUPABASE_SERVICE_ROLE_KEY` | idem, clé `service_role` — **jamais** dans le code ni côté client |
| `SEED_USER_ID` | UUID de votre compte, visible dans Authentication → Users une fois connecté au moins une fois |

## Base de données

Le schéma complet (tables + RLS + bucket Storage) est dans `supabase/migrations/20261007000000_init.sql` (copie lisible dans `supabase/schema.sql`).

**Avec la CLI Supabase** (recommandé) :

```bash
supabase link --project-ref <votre-ref-de-projet>
supabase db push
```

**Sans la CLI** : collez le contenu de `supabase/schema.sql` dans l'éditeur SQL du dashboard Supabase et exécutez-le.

Avant la première connexion : aucun compte n'existe encore. Allez sur `/` une fois l'app lancée, entrez votre e-mail, cliquez sur le lien reçu. Votre compte apparaît alors dans Authentication → Users — copiez son UUID dans `SEED_USER_ID`.

## Import des données initiales

```bash
npm run seed
```

Lit `seed/recap_maquettes_els_tech.xlsx` (feuilles "Maquettes" et "Prospects", fusionnées), crée les 16 prospects, téléverse les 16 maquettes de `seed/maquettes/` dans le bucket privé `mockups`, et les rattache. **Idempotent** : relancer la commande met à jour les mêmes lignes au lieu d'en créer de nouvelles.

## Développement

```bash
npm run dev      # serveur de dev
npm run test     # tests Vitest
npm run lint     # vérification des types (tsc --noEmit)
npm run build    # build de production
```

## Déploiement (Vercel)

1. Connectez le dépôt sur [vercel.com](https://vercel.com).
2. Dans les paramètres du projet Vercel, ajoutez les variables `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` (uniquement celles-ci — jamais `SUPABASE_SERVICE_ROLE_KEY` côté Vercel/client).
3. Build command : `npm run build` · Output directory : `dist` (détecté automatiquement par Vercel pour un projet Vite).
4. Dans Supabase → Authentication → URL Configuration, ajoutez l'URL Vercel aux "Redirect URLs" pour que le lien magique fonctionne en production.

Le script `npm run seed` ne tourne jamais sur Vercel : il s'exécute une fois, en local, avec la clé `service_role`.
