# VAULT — Budget Familial (PWA)

Application web de gestion de budget familial moderne, performante et installable.

## Stack Technique

- **Framework** : Next.js 14 (App Router, Server Actions)
- **Base de données & Auth** : Supabase (PostgreSQL + RLS)
- **UI** : Tailwind CSS + shadcn/ui
- **Graphiques** : Recharts
- **Validation** : Zod + React Hook Form
- **Déploiement** : Vercel

## Installation & Configuration

### 1. Supabase
Créez un projet sur [Supabase](https://supabase.com/) et exécutez le script SQL contenu dans `supabase/schema.sql` dans l'éditeur SQL de votre projet.

### 2. Variables d'environnement
Créez un fichier `.env.local` à la racine :
```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_supabase
```

### 3. Installation des dépendances
```bash
npm install
# ou
yarn install
```

### 4. Lancement
```bash
npm run dev
```

## Déploiement sur Vercel

1. Connectez votre dépôt GitHub à Vercel.
2. Ajoutez les variables d'environnement dans les réglages du projet Vercel.
3. Déployez !

## PWA (Progressive Web App)

L'application est configurée pour être installée sur mobile et desktop. 
- Les icônes doivent être placées dans `public/icons/`.
- Le Service Worker (`public/sw.js`) gère le cache et le mode hors ligne.
- Une bannière d'installation intelligente est incluse pour iOS et Android.

## Architecture

- `lib/actions` : Mutations via Server Actions (Zod-validated).
- `lib/supabase` : Configuration des clients (SSR-compatible).
- `components/shared` : Composants réutilisables (Sidebar, PWA, Forms).
- `app/` : Routes de l'application (Dashboard, Transactions, Enfants).
