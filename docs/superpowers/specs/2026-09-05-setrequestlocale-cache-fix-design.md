# Design — Fix P1 : activer le cache SSG sur les pages publiques (`setRequestLocale`)

## Contexte

Audit SEO/sécurité du 30 août 2026 (§26 du handoff) : toutes les pages publiques
du site (`app/[locale]/*`) sont servies avec
`Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate`, alors
que chaque page a déjà un `export const revalidate` (3600s ou 86400s). 92 % du
trafic est mobile — l'absence de cache pénalise directement la performance
perçue et le score PageSpeed mobile.

Diagnostic déjà posé en session du 4 sept. 2026 (§28 du handoff) : le
middleware next-intl ne peut pas structurellement intercepter ce header (il
n'est appliqué que plus tard par le moteur de rendu Next.js). La vraie cause
racine : `app/[locale]/layout.tsx` et les 8 pages `[locale]/*` n'appellent
jamais `setRequestLocale()`, l'API next-intl qui active le rendu statique
(SSG). Sans cet appel, `i18n/request.ts` (qui utilise déjà `requestLocale`,
l'API moderne) reste non résolu de façon statique, et Next.js considère la
route comme dynamique — quel que soit le `revalidate` déclaré.

## Portée

9 fichiers :

- `app/[locale]/layout.tsx`
- `app/[locale]/page.tsx` (home)
- `app/[locale]/a-propos/page.tsx`
- `app/[locale]/contact/page.tsx`
- `app/[locale]/galerie/page.tsx`
- `app/[locale]/mentions-legales/page.tsx`
- `app/[locale]/politique-de-confidentialite/page.tsx`
- `app/[locale]/reservation/page.tsx`
- `app/[locale]/services/page.tsx`

Aucun autre fichier (composants client, API routes, `/admin`, `/mimi`) n'est
concerné.

## Changement

Dans chaque fichier de la portée, immédiatement après avoir résolu et validé
`locale` (après `assertLocale(locale)` s'il existe, ou juste après
`await params` sinon), ajouter :

```ts
import { setRequestLocale } from "next-intl/server";
// ...
setRequestLocale(locale);
```

**Ordre impératif** : cet appel doit précéder tout autre appel next-intl dans
le même fichier (`getMessages()`, `getTranslations()`, `useTranslations` via
un Server Component parent, etc.). Un appel tardif ne réactive pas le rendu
statique.

Aucun changement de logique métier, de valeur de `revalidate`, ni de
composants client existants (`useSearchParams` sur `/reservation` reste
inchangé — c'est un hook client, hors du chemin de rendu serveur concerné ici).

## Risques et garde-fous

1. **Composant serveur utilisant une API dynamique sans le savoir.** Si une
   page ou un composant serveur qu'elle importe appelle `headers()`,
   `cookies()`, ou lit `searchParams` côté serveur, la route resterait
   dynamique malgré `setRequestLocale`. Garde-fou : avant de considérer une
   page comme corrigée, grep `headers()|cookies()` dans son arbre
   d'imports serveur (composants sans `"use client"`).
2. **Régression du SSG déjà en place.** Le passage de dynamique à statique
   change le moment où les données sont récupérées (build-time /
   revalidate, au lieu de chaque requête). Garde-fou objectif et rapide :
   `next build` doit afficher chaque route `[locale]/*` avec le marqueur
   `●` (SSG) pour les 3 locales, jamais `ƒ` (dynamique) — vérifiable dans la
   sortie de build avant même de déployer.
3. **Données périmées.** Accepté explicitement par Mouj : le `revalidate`
   existant (1h pour la plupart des pages, 24h pour les pages légales) est
   suffisant pour les prix Supabase et les avis Google — pas de contrainte
   de fraîcheur temps réel sur ces pages.
4. **`/reservation` avec `useSearchParams`.** Confirmé par Mouj : le
   paramètre `?service=` et le formulaire sont gérés côté client, la page
   peut passer en SSG côté serveur sans changer ce comportement.

## Validation

Avant de merger :

- `npx tsc --noEmit`
- `npm run build` — vérifier dans la sortie que les 8 routes `[locale]/*`
  (× 3 locales) sont marquées `●` (SSG), pas `ƒ`
- `npm run test` (Vitest)
- `npm run test:e2e` contre le build local (`npm start` +
  `PLAYWRIGHT_BASE_URL=http://localhost:3000`) — 136 passed / 2 skipped
  attendu (référence : session du 5 sept. 2026), 0 nouvel échec

Après déploiement Railway :

- Vérification manuelle (navigateur + `curl -sI`) : `Cache-Control` n'est
  plus `no-store` sur les 8 pages publiques, dans les 3 langues
- Navigation manuelle : changement de langue fr/en/es, prix affichés
  (`/services`, `/reservation`), avis Google affichés (home), formulaire de
  réservation fonctionnel avec et sans `?service=`
- Pas de nouveau test e2e dédié au Cache-Control (décision explicite de
  Mouj) — la vérification manuelle suffit pour ce chantier

## Hors scope

- Tout changement à `middleware.ts` (déjà traité pour le hreflang en §28,
  non concerné par ce chantier)
- Migration Next 14 → 15
- Les autres chantiers de l'audit du 30 août (P6 pages rasta/EN, rate
  limiters persistants, audit RLS Supabase formel)
