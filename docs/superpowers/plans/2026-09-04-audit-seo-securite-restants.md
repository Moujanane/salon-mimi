# Correctifs SEO & sécurité restants (audit handoff §26) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corriger les 4 chantiers SEO/sécurité restants confirmés dans le code actuel (handoff.md §26) : dépendance `nodemailer` morte avec CVE, `aggregateRating` JSON-LD figé au lieu de dynamique, absence de honeypot anti-bot sur `/api/reservations`, et `Cache-Control`/`hreflang x-default` cassés par le middleware next-intl sur tout le site public.

**Architecture:** Chaque tâche est indépendante et se déploie séparément si besoin, mais l'ordre proposé va du risque le plus faible au plus élevé. La tâche 4 (middleware) touche toutes les pages publiques du site — elle est traitée en dernier, avec les tests e2e complets en local avant tout déploiement.

**Tech Stack:** Next.js 14 App Router, next-intl, TypeScript, Playwright (e2e contre `https://mimi-coiffure.com` par défaut ou build local via `PLAYWRIGHT_BASE_URL`).

---

## Contexte technique déjà vérifié

- Pas de `npm run test` (vitest) dans ce repo — seuls `lint`, `build`, `start` existent dans `package.json`. Les tests fonctionnels sont dans `e2e/` (Playwright), lancés avec `npx playwright test`.
- `playwright.config.ts:10` : `baseURL` par défaut = `https://mimi-coiffure.com`. Pour tester AVANT déploiement (obligatoire pour la tâche 4), il faut un build local + `PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test`.
- `middleware.ts` gère déjà 3 cas avant d'appeler `intlMiddleware` : redirection www→non-www, `/mimi*` (bypass total), `/admin*` (bypass total + check session). Le `intlMiddleware(request)` est appelé en dernier et sa réponse est retournée telle quelle (sauf conversion 307→308).
- `app/[locale]/layout.tsx` : `jsonLd` est un objet **module-level statique** (pas dans une fonction). `LocaleLayout` est déjà `async`. `getGoogleReviews()` existe dans `lib/google-reviews.ts:18`, retourne `ReviewsResult | null` avec `{ reviews, rating, user_ratings_total }`, déjà utilisée par `components/sections/GoogleReviews.tsx:23`.
- `app/api/reservations/route.ts` : rate limit en mémoire (5 req/10min/IP), aucun honeypot. Le body attendu vient de deux endroits différents dans `components/sections/ReservationLayout.tsx` : `handleSubmit` (ligne 336, formulaire "Confirmer ma réservation") et `handleWhatsApp` (ligne 373, bouton "Réserver par WhatsApp") — **les deux** appellent `fetch("/api/reservations", ...)` et doivent envoyer le honeypot.
- Le `<form>` commence à `components/sections/ReservationLayout.tsx:506`, premier vrai champ `name="service"` à la ligne 528.

---

### Task 1: Retirer la dépendance morte `nodemailer`

**Files:**

- Modify: `package.json`

- [ ] **Step 1: Confirmer qu'aucun import ne subsiste**

Run: `grep -rn "nodemailer" app/ lib/ components/`
Expected: aucune sortie (déjà vérifié par l'audit, à reconfirmer avant de couper).

- [ ] **Step 2: Désinstaller le package**

```bash
npm uninstall nodemailer @types/nodemailer
```

Expected: `package.json` et `package-lock.json` mis à jour, plus de `nodemailer` dans les dépendances.

- [ ] **Step 3: Vérifier que le build passe toujours**

```bash
npx tsc --noEmit
npm run build
```

Expected: aucune erreur (nodemailer n'était importé nulle part).

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "fix(security): retire nodemailer (dépendance morte, 3 CVE high)

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 2: `aggregateRating` dynamique dans le JSON-LD

**Files:**

- Modify: `app/[locale]/layout.tsx:110-160` (bloc `jsonLd` + `LocaleLayout`)

- [ ] **Step 1: Transformer `jsonLd` en fonction qui prend les stats en paramètre**

Remplacer le bloc statique (lignes ~110-159) : garder `jsonLd` tel quel MAIS extraire `aggregateRating` et en faire un objet construit dynamiquement dans `LocaleLayout`, injecté avant sérialisation.

Dans `app/[locale]/layout.tsx`, remplacer :

```ts
  priceRange: "150-950 MAD",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.2",
    reviewCount: "13",
    bestRating: "5",
  },
};
```

par :

```ts
  priceRange: "150-950 MAD",
};
```

(on retire `aggregateRating` du bloc statique)

- [ ] **Step 2: Importer `getGoogleReviews` et construire le rating dans `LocaleLayout`**

En haut du fichier, ajouter l'import :

```ts
import { getGoogleReviews } from "@/lib/google-reviews";
```

Puis dans `LocaleLayout` (après `const messages = await getMessages();`), ajouter :

```ts
const reviewsData = await getGoogleReviews();
const aggregateRating = {
  "@type": "AggregateRating",
  ratingValue: (reviewsData?.rating ?? 4.2).toFixed(1),
  reviewCount: String(reviewsData?.user_ratings_total ?? 13),
  bestRating: "5",
};
const jsonLdWithRating = { ...jsonLd, aggregateRating };
```

- [ ] **Step 3: Utiliser `jsonLdWithRating` au lieu de `jsonLd` dans le `<script>`**

Remplacer :

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
/>
```

par :

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWithRating) }}
/>
```

- [ ] **Step 4: Vérifier le typecheck et le build**

```bash
npx tsc --noEmit
npm run build
```

Expected: pas d'erreur. `getGoogleReviews()` retourne `null` si `GOOGLE_PLACES_API_KEY` absent en local — le fallback `4.2`/`13` s'applique alors, comportement identique à avant pour un environnement sans clé.

- [ ] **Step 5: Vérifier en local que le JSON-LD est bien injecté**

```bash
npm run build && npm run start &
sleep 3
curl -s http://localhost:3000/fr | grep -o '"aggregateRating":{[^}]*}'
kill %1
```

Expected: un objet `aggregateRating` avec des valeurs (celles de l'API si `GOOGLE_PLACES_API_KEY` est dans `.env.local`, sinon le fallback 4.2/13).

- [ ] **Step 6: Commit**

```bash
git add "app/[locale]/layout.tsx"
git commit -m "fix(seo): aggregateRating JSON-LD dynamique via getGoogleReviews()

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 3: Honeypot anti-bot sur `/api/reservations`

**Files:**

- Modify: `app/api/reservations/route.ts`
- Modify: `components/sections/ReservationLayout.tsx`

- [ ] **Step 1: Ajouter la validation honeypot côté serveur**

Dans `app/api/reservations/route.ts`, après la destructuration du body (après la ligne qui extrait `nom, telephone, email, ...`), ajouter la lecture du champ piège et un rejet silencieux (200 factice, pour ne pas apprendre au bot que le honeypot a été détecté) :

```ts
const body = await request.json();
const {
  nom,
  telephone,
  email,
  service,
  date_souhaitee,
  heure_souhaitee,
  nombre_personnes,
  message,
  locale,
  website, // honeypot : champ caché, jamais rempli par un humain
} = body;

// Honeypot anti-bot : un champ caché non rempli par les humains.
// Réponse 201 factice (sans écriture DB) pour ne pas révéler la détection.
if (typeof website === "string" && website.trim() !== "") {
  return NextResponse.json(
    { success: true, whatsappLink: "" },
    { status: 201 },
  );
}
```

- [ ] **Step 2: Ajouter le champ honeypot caché dans le formulaire**

Dans `components/sections/ReservationLayout.tsx`, juste après l'ouverture du `<form>` (après la ligne `className="flex flex-col gap-2.5"` qui suit `onSubmit={handleSubmit}`, avant le premier `<div>`), ajouter un champ invisible pour les humains mais rempli par la plupart des bots génériques :

```tsx
{
  /* Honeypot anti-bot — invisible pour les humains, absent du DOM visuel */
}
<input
  type="text"
  name="website"
  tabIndex={-1}
  autoComplete="off"
  aria-hidden="true"
  className="absolute left-[-9999px] h-0 w-0 opacity-0"
/>;
```

- [ ] **Step 3: Transmettre le champ dans `handleSubmit`**

Dans `handleSubmit` (ligne ~344), ajouter `website: getVal("website"),` à l'objet `data` :

```ts
const data = {
  nom: getVal("name"),
  telephone: getVal("phone"),
  email: getVal("email"),
  service: activeSvc.label,
  date_souhaitee: getVal("date"),
  heure_souhaitee: getVal("time"),
  nombre_personnes: getVal("persons"),
  message: getVal("message"),
  website: getVal("website"),
  locale,
};
```

- [ ] **Step 4: Transmettre le champ dans `handleWhatsApp`**

Dans `handleWhatsApp` (ligne ~408-420), ajouter `website: getVal("website"),` au body du `fetch` :

```ts
        body: JSON.stringify({
          nom,
          telephone,
          service: activeSvc.label,
          date_souhaitee: getVal("date"),
          heure_souhaitee: getVal("time"),
          nombre_personnes: getVal("persons"),
          message: getVal("message"),
          website: getVal("website"),
          locale,
        }),
```

(vérifier le contenu exact de ce bloc avant de coller — lire les lignes 408-425 du fichier au moment de l'implémentation, le `locale` pourrait déjà y être ou pas)

- [ ] **Step 5: Vérifier le typecheck et le build**

```bash
npx tsc --noEmit
npm run build
```

Expected: pas d'erreur.

- [ ] **Step 6: Test manuel — soumission normale (champ vide) doit passer**

```bash
npm run start &
sleep 3
curl -s -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{"nom":"Test Human","telephone":"+212600000000","service":"Box braids","website":""}' | head -c 300
kill %1
```

Expected: `{"success":true, ...}` avec un vrai insert (ou erreur Supabase si les credentials locaux ne sont pas configurés — dans ce cas vérifier que l'erreur n'est PAS liée au honeypot).

- [ ] **Step 7: Test manuel — soumission avec honeypot rempli doit être bloquée silencieusement**

```bash
npm run start &
sleep 3
curl -s -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{"nom":"Bot","telephone":"+212600000000","service":"Box braids","website":"http://spam.com"}' | head -c 300
kill %1
```

Expected: `{"success":true,"whatsappLink":""}` MAIS vérifier dans les logs / Supabase qu'AUCUNE ligne n'a été insérée pour "Bot".

- [ ] **Step 8: Lancer les tests e2e existants contre le build local pour vérifier l'absence de régression sur le formulaire**

```bash
npm run build
npm run start &
sleep 3
PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test e2e/site.spec.ts
kill %1
```

Expected: tous les tests passent (le honeypot invisible ne doit jamais être rempli par Playwright qui simule un vrai utilisateur cliquant sur les champs visibles).

- [ ] **Step 9: Commit**

```bash
git add app/api/reservations/route.ts components/sections/ReservationLayout.tsx
git commit -m "fix(security): ajoute un honeypot anti-bot sur /api/reservations

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 4: Cache-Control et hreflang x-default dans le middleware

**Files:**

- Modify: `middleware.ts`
- Create: `e2e/seo-cache-headers.spec.ts`

**Risque** : ce fichier s'exécute sur TOUTES les pages publiques du site (hors `/admin`, `/mimi`, `/api`, assets). Une erreur ici casse potentiellement l'affichage des prix (cache figé) ou le changement de langue. Tester intégralement en local avant tout déploiement, ne jamais pousser directement en prod sans avoir vu les tests passer.

- [ ] **Step 1: Écrire le test e2e qui doit passer après le fix**

Créer `e2e/seo-cache-headers.spec.ts` :

```ts
import { test, expect } from "@playwright/test";

/**
 * Non-régression SEO — Cache-Control et hreflang x-default.
 *
 * Contexte (handoff §26, points P1/P2) : le middleware next-intl retourne par
 * défaut un header Cache-Control: no-store sur toutes les pages [locale], ce
 * qui empêche tout cache navigateur/CDN sur des pages pourtant SSG/ISR. Il
 * génère aussi un header Link avec hreflang x-default pointant vers l'apex
 * "/" (avec slash) alors que le <link> HTML pointe vers "/fr" (sans slash).
 *
 * Ces tests verrouillent :
 *  1. Les pages [locale] ne renvoient plus Cache-Control: no-store.
 *  2. Le header Link hreflang x-default (s'il existe) est cohérent avec le
 *     <link> HTML, ou est absent.
 *  3. /admin et /mimi ne sont PAS affectés par le changement (comportement
 *     inchangé).
 */

const LOCALE_PAGES = ["/fr", "/en", "/es"];

for (const path of LOCALE_PAGES) {
  test(`${path} — Cache-Control n'est plus no-store`, async ({ request }) => {
    const res = await request.get(path);
    const cacheControl = res.headers()["cache-control"] ?? "";
    expect(cacheControl).not.toContain("no-store");
  });

  test(`${path} — hreflang x-default cohérent entre header Link et <link> HTML`, async ({
    request,
  }) => {
    const res = await request.get(path);
    const linkHeader = res.headers()["link"] ?? "";
    const html = await res.text();

    const htmlMatch = html.match(
      /<link[^>]+hreflang="x-default"[^>]+href="([^"]+)"/,
    );
    expect(
      htmlMatch,
      "x-default <link> doit exister dans le HTML",
    ).not.toBeNull();
    const htmlXDefault = htmlMatch![1];

    if (linkHeader.includes("x-default")) {
      const headerMatch = linkHeader.match(
        /<([^>]+)>;\s*rel="alternate";\s*hreflang="x-default"/,
      );
      if (headerMatch) {
        expect(headerMatch[1]).toBe(htmlXDefault);
      }
    }
  });
}

test("/admin/login reste non affecté (redirection ou 200, jamais de crash)", async ({
  request,
}) => {
  const res = await request.get("/admin/login");
  expect(res.status()).toBeLessThan(500);
});

test("/mimi.html reste servi normalement", async ({ request }) => {
  const res = await request.get("/mimi.html");
  expect(res.status()).toBe(200);
});
```

- [ ] **Step 2: Lancer le test contre la prod actuelle pour confirmer qu'il échoue (preuve du bug)**

```bash
npx playwright test e2e/seo-cache-headers.spec.ts
```

Expected: les tests "Cache-Control n'est plus no-store" ÉCHOUENT (bug confirmé présent en prod).

- [ ] **Step 3: Modifier `middleware.ts` pour corriger le Cache-Control et le header Link**

Remplacer le corps de la fonction `middleware` (la partie après le bypass `/admin`) :

```ts
const response = intlMiddleware(request);

// Convertir les redirections i18n en 308 (permanent) pour le SEO
if (response && response.status === 307) {
  const location = response.headers.get("location");
  if (location) {
    return NextResponse.redirect(new URL(location, request.url), 308);
  }
}

return response;
```

par :

```ts
const response = intlMiddleware(request);

// Convertir les redirections i18n en 308 (permanent) pour le SEO
if (response && response.status === 307) {
  const location = response.headers.get("location");
  if (location) {
    return NextResponse.redirect(new URL(location, request.url), 308);
  }
}

if (response) {
  // next-intl fixe Cache-Control: no-store par défaut sur les pages
  // [locale], ce qui empêche tout cache navigateur/CDN sur des pages
  // pourtant statiques (SSG/ISR). On restaure un cache public standard —
  // Next.js gère la revalidation ISR indépendamment de ce header.
  if (response.headers.get("cache-control")?.includes("no-store")) {
    response.headers.set("Cache-Control", "public, max-age=0, must-revalidate");
  }

  // next-intl génère un header Link hreflang x-default pointant vers
  // l'apex "/" (avec slash), incohérent avec le <link> HTML qui pointe
  // vers "/fr" (sans slash, cf. app/[locale]/layout.tsx). On réécrit
  // uniquement le segment x-default du header Link.
  const linkHeader = response.headers.get("link");
  if (linkHeader && linkHeader.includes('hreflang="x-default"')) {
    const fixedLink = linkHeader.replace(
      /<https?:\/\/[^>]*\/>;\s*rel="alternate";\s*hreflang="x-default"/,
      `<${BASE_URL}/fr>; rel="alternate"; hreflang="x-default"`,
    );
    response.headers.set("Link", fixedLink);
  }
}

return response;
```

Ajouter la constante `BASE_URL` en haut du fichier (après les imports) :

```ts
const BASE_URL = "https://mimi-coiffure.com";
```

- [ ] **Step 4: Vérifier le typecheck**

```bash
npx tsc --noEmit
```

Expected: pas d'erreur.

- [ ] **Step 5: Build et lancer TOUTE la suite e2e en local (pas contre la prod)**

```bash
npm run build
npm run start &
sleep 3
PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test
kill %1
```

Expected: **tous** les tests passent, y compris `e2e/seo-canonical.spec.ts` (29 cas), `e2e/site.spec.ts`, et le nouveau `e2e/seo-cache-headers.spec.ts`. Si un test échoue, ne pas continuer — diagnostiquer avant de passer à l'étape suivante (Règle 0 du CLAUDE.md : zéro régression).

- [ ] **Step 6: Vérification manuelle ciblée en local — prix et changement de langue non cassés**

```bash
curl -sI http://localhost:3000/fr | grep -i "cache-control\|^link"
curl -sI http://localhost:3000/fr/reservation | grep -i "cache-control"
curl -s http://localhost:3000/fr/services | grep -o 'priceRange[^,]*' | head -3
```

Expected: `Cache-Control: public, max-age=0, must-revalidate` (plus de `no-store`), header `Link` avec `x-default` pointant vers `https://mimi-coiffure.com/fr`, prix toujours présents dans le HTML (pas de cache figé avec de vieilles données).

- [ ] **Step 7: Commit**

```bash
git add middleware.ts e2e/seo-cache-headers.spec.ts
git commit -m "fix(seo): corrige Cache-Control no-store et hreflang x-default dans le middleware

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

- [ ] **Step 8: Déployer et vérifier en prod (checklist obligatoire mémoire projet)**

Après déploiement Railway, vérifier manuellement dans le navigateur :

1. `/admin/dashboard` — les réservations s'affichent toujours
2. `/reservation` — le champ carte n'existe pas sur ce projet (pas de Stripe ici), mais vérifier que le formulaire soumet toujours normalement
3. Créer une réservation test → apparaît dans le dashboard admin
4. `/fr`, `/en`, `/es` → changement de langue fonctionne toujours (pas de mauvais cache servi)
5. `curl -sI https://mimi-coiffure.com/fr` → `Cache-Control` sans `no-store`

```bash
npx playwright test
```

(cette fois contre la prod réelle, baseURL par défaut)

Expected: tous les tests passent en prod, 0 régression.

---

## Résumé de fin de chantier

À la fin des 4 tâches, mettre à jour `handoff.md` avec une nouvelle section datée (ex. "Session 4 sept 2026 — correctifs SEO/sécurité restants du §26") listant : nodemailer retiré, aggregateRating dynamique, honeypot ajouté, Cache-Control/hreflang corrigés, résultats des tests e2e (nombre de passed/failed), et confirmation "0 régression".

**Hors scope de ce plan** (confirmé gros chantier, à traiter séparément) :

- P6 : pages contenu rasta/EN (`/tresses-rasta-marrakech`)
- Migration Next 14 → 15 (résoudrait les CVE restantes sur `next`/`postcss`)
- Migration des rate limiters en mémoire vers un store persistant (Upstash/Supabase)
- Audit formel des politiques RLS Supabase
