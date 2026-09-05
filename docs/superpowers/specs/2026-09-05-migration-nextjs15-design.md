# Design — Migration Next.js 14 → 15

**Date** : 2026-09-05
**Statut** : validé (brainstorming), en attente de plan d'exécution
**Chantier identifié dans** : handoff §top (« À faire — prochaine session : migration Next.js 14 → 15 »), audit SEO/sécurité du 30 août 2026 (§26, reste de S7 / `npm audit`)

---

## 1. Objectif

Migrer le site de `next` 14.2.35 vers la dernière 15.x stable afin de corriger
les CVE connues sur la branche Next 14.x. Aucun changement fonctionnel visible
pour les visiteurs.

### Cible de version

- `next` : **15.5.25** (dernière 15.x publiée, tag npm `backport` — contient les
  correctifs de sécurité back-portés sur la ligne 15).
  - Fallback si `npm install` de 15.5.25 remonte un conflit de peer deps
    inattendu : `next@15.3.9`. Le signaler à Mouj avant de continuer, ne pas
    changer de cible en silence.
- `eslint-config-next` : aligné sur la version exacte de `next`.
- `react` / `react-dom` : **inchangés en 18**. Next 15 n'exige pas React 19
  (peer deps vérifiées).
- `next-intl` : **inchangé en `^4.12.0`**. Peer deps vérifiées le 2026-09-05 :
  `next: ^12 || ^13 || ^14 || ^15 || ^16`, `react: ^18` inclus. Supporte Next
  15.5.x nativement.

## 2. Hors périmètre (chantiers séparés)

- Bump `next-intl` (4.12 → 4.14.x) — non nécessaire, la version actuelle
  supporte déjà Next 15.
- `npm audit fix` des devDeps restantes (`postcss`, `nanoid`, `js-yaml`,
  `glob`, `brace-expansion`) — risque prod faible, chantier dédié.
- Migration vers Next 16 (sorti, tag `latest`) — hors sujet, le chantier
  cible explicitement 15.x.
- Migration Atlas Swincar (projet séparé, aussi en Next 14) — indépendant.

## 3. Fichiers de code touchés (4)

| Fichier                              | Changement                                                                                                              |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `package.json`                       | `next` → `15.5.25`, `eslint-config-next` → `15.5.25`                                                                    |
| `package-lock.json`                  | régénéré par `npm install`                                                                                              |
| `app/[locale]/opengraph-image.tsx`   | `params` synchrone → `Promise<{ locale: string }>` + `await`                                                            |
| `app/api/reservations/[id]/route.ts` | `params` → `Promise<{ id: string }>` + `await` ; `cookies()` → `await cookies()`, dans les handlers PATCH **et** DELETE |

### 3.1 `app/[locale]/opengraph-image.tsx`

```ts
// avant
export default async function OgImage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params?.locale ?? "fr";

// après
export default async function OgImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
```

Reste du fichier inchangé. Les accès en aval (`titles[locale] ?? titles.fr`,
`subtitles[locale] ?? subtitles.fr`) gèrent déjà une locale inattendue, donc la
disparition du `?? "fr"` sur la ligne d'extraction est sans effet — `locale` est
toujours fourni par le routing `[locale]`.

### 3.2 `app/api/reservations/[id]/route.ts`

Trois changements identiques dans `PATCH` et `DELETE` :

```ts
// signature
{ params }: { params: Promise<{ id: string }> }

// cookies() est asynchrone en Next 15
const cookieStore = await cookies();

// accès à l'id
const { id } = await params;
// puis : .eq("id", id)  au lieu de  .eq("id", params.id)
```

`createServerClient` de `@supabase/ssr` `^0.10.3` accepte un `cookieStore` déjà
résolu ; la structure `cookies: { get(name) { return cookieStore.get(name)?.value } }`
ne change pas.

## 4. Fichiers vérifiés — aucun changement nécessaire

- `middleware.ts` : aucune API dépréciée par Next 15. `NextRequest` / `NextResponse`
  inchangés, `request.cookies.getAll()` inchangé, `config.matcher` inchangé.
- `next.config.mjs` : aucune option renommée ou dépréciée. `headers()`,
  `redirects()`, plugin `next-intl` inchangés.
- Les 10 autres fichiers `app/[locale]/**/page.tsx` et `layout.tsx` : déjà en
  `params: Promise<{ locale }>` + `await params` (fait lors du chantier
  setRequestLocale du 5 sept 2026).
- Composants client (`ReservationLayout`, `GalerieClient`, `ServicesPageClient`,
  `GoogleReviews`, etc.) : non concernés (les breaking changes async touchent
  `params` / `cookies` / `headers` côté serveur).

## 5. Tests

### 5.1 Nouveau test Playwright — `e2e/api-reservations-id.spec.ts`

`app/api/reservations/[id]/route.ts` n'a aujourd'hui **aucune couverture**. On
ajoute un test de **contrat de route** (pas de logique métier — celle-ci est du
Supabase pur, non affecté par Next 15). Il n'existe aucune infra de login admin
dans Playwright ; monter un `storageState` + compte de test dépasse le périmètre
d'une migration de 2 fichiers. Le test vérifie donc ce qui casse réellement dans
une migration Next 15 : le runtime de la route, l'accès à `params` et `cookies()`.

Cas couverts :

1. `PATCH /api/reservations/<uuid-bidon>` **sans cookie de session** → `401`
   (prouve : la route ne crash pas au runtime Next 15, `await cookies()` OK,
   l'auth guard répond).
2. `PATCH /api/reservations/<uuid-bidon>` sans cookie, body invalide → `401`
   (l'auth passe avant la validation du body — comportement inchangé).
3. `DELETE /api/reservations/<uuid-bidon>` **sans cookie de session** → `401`.

Aucun de ces cas n'écrit en base (l'auth échoue avant). `<uuid-bidon>` = un UUID
valide en forme mais inexistant.

### 5.2 Suites existantes — non-régression

Toutes doivent rester vertes, lancées **contre le build local** :

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test
```

Piège opérationnel (handoff) : `playwright.config.ts` a pour `baseURL` par
défaut `https://mimi-coiffure.com` (prod). Toujours passer
`PLAYWRIGHT_BASE_URL=http://localhost:3000` explicitement pendant la migration,
sinon les tests « verts » testeraient encore l'ancienne prod non migrée.

Flaky préexistant connu, sans rapport avec ce chantier : `e2e/site.spec.ts`
(« la page services s'affiche ») peut timeout à cause de 3 vidéos jsDelivr sur
`/fr/services` ; `e2e/seo-canonical.spec.ts` (« chaque URL du sitemap répond
200 ») appelle la vraie prod car le sitemap contient des URLs absolues. Ne pas
les imputer à la migration.

### 5.3 Vérifications supplémentaires

```bash
npx tsc --noEmit     # zéro erreur TypeScript
npm run build        # build de production réussi
npm run lint         # next lint (eslint-config-next 15.x)
```

### 5.4 Test manuel obligatoire — après déploiement

`api/reservations/[id]` est le fichier le plus exposé aux breaking changes et
sa couverture de test reste partielle (contrat seulement). Test manuel dans le
navigateur, par Mouj, après mise en ligne :

1. Se connecter à `/admin/login` (vrai compte admin).
2. Sur `/admin/dashboard` : changer le statut d'une réservation
   (en_attente → confirmee → annulee). Vérifier que le changement persiste
   après rechargement.
3. Supprimer une réservation de test. Vérifier qu'elle disparaît du dashboard.

### 5.5 Checklist obligatoire projet (mémoire `salon-mimi-*`) — après déploiement

1. `/admin/dashboard` — les réservations s'affichent.
2. `/reservation` — le formulaire se soumet normalement.
3. Créer une réservation test → elle apparaît dans le dashboard.
4. `npx playwright test` en full contre la vraie prod après déploiement.

## 6. Environnement de travail

Worktree git isolé : `worktree-migration-nextjs15` (même pattern que les
chantiers rate-limiters et setRequestLocale). `node_modules` séparé — `main`
n'est jamais laissé avec un `node_modules` en Next 15. Merge en fast-forward sur
`main` une fois toutes les vérifications §5.1–5.3 vertes.

## 7. Ordre des opérations (haut niveau — le plan détaillera)

1. Créer le worktree.
2. `npm install next@15.5.25 eslint-config-next@15.5.25` (fallback 15.3.9 si
   conflit peer deps — prévenir Mouj).
3. Corriger `opengraph-image.tsx`.
4. Corriger `api/reservations/[id]/route.ts` (PATCH + DELETE).
5. Écrire `e2e/api-reservations-id.spec.ts`.
6. `tsc --noEmit`, `npm run lint`, `npm run build`.
7. `PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test` — tout vert
   (hors flaky préexistants §5.2).
8. Revue de code (règle 5 projet).
9. Merge fast-forward sur `main`, push, déploiement Railway.
10. Test manuel §5.4 + checklist §5.5 en prod.
11. Mettre à jour le handoff.

## 8. Risques et mitigations

| Risque                                                                     | Probabilité | Mitigation                                                                                                |
| -------------------------------------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------- |
| `npm install` de 15.5.25 : conflit peer deps                               | faible      | Fallback documenté vers 15.3.9, prévenir Mouj                                                             |
| Un breaking change async non anticipé ailleurs                             | faible      | `tsc --noEmit` + `npm run build` les font remonter avant tout déploiement ; 10/12 fichiers déjà conformes |
| Régression silencieuse sur PATCH/DELETE réservation (couverture partielle) | faible      | Test de contrat §5.1 + test manuel §5.4 obligatoire en prod                                               |
| `next.config.mjs` : option `experimental` retirée en 15                    | très faible | Aucune option `experimental` dans le fichier actuel — vérifié                                             |
| Cache Cloudflare edge sert l'ancienne version                              | faible      | Re-vérifier les headers `Cache-Control` en prod après déploiement (comme au chantier setRequestLocale)    |

## 9. Critère de fin

- `tsc --noEmit`, `npm run lint`, `npm run build` : verts.
- Suite Playwright locale : verte (hors 2 flaky préexistants).
- `next` = 15.5.25 dans `package.json` **et** `package-lock.json`.
- Déployé sur `main`, Railway à jour.
- Test manuel §5.4 : changement de statut + suppression de réservation OK en prod.
- Checklist projet §5.5 : les 4 points OK en prod.
- Handoff mis à jour.
