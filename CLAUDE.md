# CLAUDE.md — Conventions du projet

Dashboard de suivi de prospects pour ELS Tech (Anthony, Loudéac). Voir `PRD.md` pour le produit, `ROADMAP.md` pour les jalons.

## Stack

- React 18, Vite, TypeScript (strict), Tailwind CSS.
- Supabase : Postgres + Auth (e-mail + mot de passe) + Storage (bucket privé `mockups`).
- Déploiement Vercel.
- TanStack Table pour la vue tableau du pipeline, dnd-kit pour le Kanban. Pas d'autre dépendance lourde (pas de Redux, pas de UI kit complet) : des composants simples, un rôle par composant.
- Tests : Vitest.

## Structure de dossiers

```
src/
  components/      # un composant par fichier, nommé par sa responsabilité
  pages/           # un fichier par écran (Aujourd'hui, Pipeline, FicheProspect, Maquettes, Messages, Statistiques, Parametres)
  lib/
    supabase.ts    # client Supabase unique
    activityRules.ts   # applyActivityToProspect() — règle activité → statut/relance, testée
    templates.ts   # remplissage des variables {{nom}}, {{activité}}, {{lien_maquette}}, {{ma_signature}}
  types/           # types générés/partagés pour les tables
scripts/
  seed.ts          # import initial depuis seed/recap_maquettes_els_tech.xlsx + seed/maquettes/
supabase/
  schema.sql       # schéma + RLS (référence) — à migrer vers supabase/migrations/ au démarrage du projet
seed/
  recap_maquettes_els_tech.xlsx
  maquettes/*.html
```

## Conventions

- Toute l'interface utilisateur est en français (textes, messages d'erreur, dates au format `jj/mm/aaaa`).
- Mobile d'abord : concevoir chaque écran pour 375px de large avant de l'élargir. Barre d'onglets fixe en bas sur mobile, navigation latérale sur desktop.
- Un composant = une responsabilité. Pas de composant "fourre-tout" de page qui mélange fetch, logique métier et rendu : séparer hook de données / composant de présentation.
- La règle métier "activité → statut + prochaine relance" vit dans `src/lib/activityRules.ts`, fonction pure, sans effet de bord Supabase à l'intérieur — testable sans mock réseau. Le code appelant (hook/mutation) lit le résultat et fait l'update Supabase.
- Les maquettes HTML ne sont **jamais** rendues hors d'une `<iframe sandbox="allow-scripts">` (sans `allow-same-origin` combiné à `allow-scripts` sur un contenu non fiable — vérifier la combinaison avant de coder l'aperçu). Jamais de bucket public, jamais d'URL signée stockée en base (elle expire) : on la régénère à l'affichage.
- Toute requête Supabase passe par `src/lib/supabase.ts` (client unique, typé).
- Variables d'environnement : `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (jamais la clé `service_role` côté client). Le script de seed, lui, tourne côté Node et peut utiliser une clé `service_role` passée en variable d'environnement locale (jamais commitée).

## Commandes

```
npm run dev          # serveur de dev Vite
npm run build        # build production
npm run test         # tests Vitest
npm run seed         # scripts/seed.ts — idempotent, relançable sans doublons
```

(Commandes exactes à confirmer une fois `package.json` créé en J1.)

## Workflow

- Un commit par étape de la ROADMAP (J1, J2, …), message clair en français décrivant ce qui devient utilisable.
- Ne jamais committer de clé `service_role` ni de fichier `.env` réel (seul `.env.example` est versionné).
- Avant d'implémenter une étape, relire la section correspondante de la ROADMAP ; si un choix non précisé dans le PRD se présente, préférer la solution la plus simple et le signaler plutôt que de deviner silencieusement.
