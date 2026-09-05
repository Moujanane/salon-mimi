# Rate limiters persistants via Upstash Redis — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer les 3 rate limiters en mémoire process (`Map` locale, remise à zéro à chaque redéploiement/scale Railway) par un store Redis persistant (Upstash), sans changer aucun seuil ni comportement observable côté utilisateur légitime.

**Architecture:** Un module partagé `lib/rateLimit.ts` expose deux familles de fonctions au-dessus d'un client Upstash Redis unique : un compteur par fenêtre glissante (`@upstash/ratelimit`) pour `reservations`/`contact`, et un compteur d'échecs réinitialisable sur succès (commandes Redis brutes via `@upstash/redis`) pour le PIN Mimi. Fail-open partout : toute erreur Redis (panne, credentials absents) autorise la requête plutôt que de la bloquer.

**Tech Stack:** Next.js 14 App Router, TypeScript strict, `@upstash/redis`, `@upstash/ratelimit`, Playwright (pas de Vitest sur ce projet — voir note dans le plan précédent `2026-09-05-setrequestlocale-cache-fix.md`).

---

## Contexte de référence

- Spec : `docs/superpowers/specs/2026-09-05-rate-limiters-persistants-design.md`
- Credentials Upstash déjà ajoutés par Mouj dans `.env.local` :
  `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (base `gorgeous-yak-138078`, plan gratuit).
- Fichiers dans la portée : `lib/rateLimit.ts` (nouveau),
  `app/api/reservations/route.ts`, `app/api/contact/route.ts`,
  `lib/mimiAuth.ts`.
- Aucun script `npm run test` ni Vitest sur ce projet — seul Playwright
  existe (`testDir: "./e2e"`), lancé via `npx playwright test`. Ne pas
  inventer de commande `npm run test`.

## État actuel des 3 rate limiters (vérifié avant d'écrire ce plan)

**`app/api/reservations/route.ts:10-24,39-46`** :

```ts
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const maxRequests = 5;
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Trop de tentatives, réessaie dans 10 minutes." },
      { status: 429 },
    );
  }
  const body = await request.json();
  // ... reste de la route inchangé
```

**`app/api/contact/route.ts:14-27`** :

```ts
const rateLimitMap = new Map<string, { count: number; ts: number }>();

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  const inWindow = entry && now - entry.ts < 60_000;
  if (inWindow && entry.count >= 3) {
    return NextResponse.json({ error: "Trop de demandes" }, { status: 429 });
  }
  rateLimitMap.set(
    ip,
    inWindow ? { count: entry.count + 1, ts: entry.ts } : { count: 1, ts: now },
  );
  const body = await req.json().catch(() => null);
  // ... reste de la route inchangé
```

Note : ce fichier utilise `x-forwarded-for` SANS split sur la virgule
(contrairement aux deux autres routes) — bug préexistant mineur (peut inclure
toute la chaîne de proxies dans la clé). Hors scope de ce chantier (spec
explicitement scopée à la migration du stockage, pas à ce genre de fix) —
NE PAS corriger ce point dans ce plan, seulement le préserver tel quel pour
ne pas introduire de changement de comportement non demandé.

**`lib/mimiAuth.ts:21-25,49-83`** (fichier complet déjà lu, voir le fichier
réel pour le contexte complet — reproduit ici seulement les parties qui
changent) :

```ts
const WINDOW_MS = 30 * 60 * 1000;
const MAX_FAILURES = 3;

type Entry = { failures: number; resetAt: number };
const attempts = new Map<string, Entry>();

export function checkMimiPin(req: NextRequest): MimiAuthResult {
  const expected = process.env.MIMI_PIN;
  if (!expected) {
    return {
      ok: false,
      status: 503,
      error: "Service indisponible (configuration manquante).",
    };
  }

  const ip = clientIp(req);
  const now = Date.now();
  const entry = attempts.get(ip);
  if (entry && now < entry.resetAt && entry.failures >= MAX_FAILURES) {
    return {
      ok: false,
      status: 429,
      error: "Trop de tentatives. Réessaie plus tard.",
    };
  }

  const provided = req.headers.get("x-mimi-pin") ?? "";
  if (provided && constantTimeEqual(provided, expected)) {
    attempts.delete(ip);
    return { ok: true };
  }

  if (!entry || now >= entry.resetAt) {
    attempts.set(ip, { failures: 1, resetAt: now + WINDOW_MS });
  } else {
    entry.failures++;
  }
  return { ok: false, status: 401, error: "PIN incorrect" };
}
```

Cette fonction est actuellement **synchrone**. Elle devra devenir **async**
(les appels Redis sont asynchrones) — ça a un impact sur tous les appelants.

## Appelants de `checkMimiPin` à vérifier (impact du passage en async)

- [ ] **Étape préliminaire : lister tous les appelants avant de commencer**

Run: `grep -rn "checkMimiPin" app/ lib/ --include="*.ts"`

Chaque site d'appel devra ajouter `await` devant `checkMimiPin(req)`. Vérifier
ce grep en Task 1 avant de toucher au fichier, pour ne pas en oublier un.

---

## Task 1 : Installer les dépendances Upstash

**Files:**

- Modify: `package.json`, `package-lock.json` (générés par npm)

- [ ] **Step 1: Installer les deux packages**

Run: `npm install @upstash/redis@1.38.4 @upstash/ratelimit@2.0.8`
Expected: `package.json` gagne les deux dépendances dans `dependencies`.

- [ ] **Step 2: Vérifier l'installation**

Run: `grep -A1 "@upstash" package.json`
Expected: les deux lignes `"@upstash/redis": "1.38.4"` et
`"@upstash/ratelimit": "2.0.8"` apparaissent.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: ajoute @upstash/redis et @upstash/ratelimit

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 2 : Créer `lib/rateLimit.ts`

**Files:**

- Create: `lib/rateLimit.ts`

- [ ] **Step 1: Écrire le module complet**

Créer `lib/rateLimit.ts` avec ce contenu exact :

```ts
// lib/rateLimit.ts
//
// Rate limiting persistant via Upstash Redis, partagé par toutes les routes
// qui en ont besoin (au lieu d'un Map en mémoire process, remis à zéro à
// chaque redéploiement/scale Railway).
//
// Fail-open : toute erreur (panne Upstash, credentials absents/invalides)
// autorise la requête plutôt que de bloquer un utilisateur légitime. Une
// panne Upstash dégrade la protection anti-spam, jamais la disponibilité
// du site.

import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!url || !token) {
  console.warn(
    "[rateLimit] UPSTASH_REDIS_REST_URL/TOKEN absents — rate limiting désactivé (fail-open).",
  );
}

const redis = url && token ? new Redis({ url, token }) : null;

/**
 * Compteur par fenêtre glissante : "au plus `max` requêtes par
 * `windowSeconds` secondes". Utilisé pour les routes /api/reservations et
 * /api/contact.
 *
 * `key` doit déjà inclure un préfixe distinguant l'appelant (ex.
 * "reservations:1.2.3.4") pour éviter toute collision entre routes.
 */
export async function checkWindowLimit(
  key: string,
  max: number,
  windowSeconds: number,
): Promise<boolean> {
  if (!redis) return true;

  try {
    const limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(max, `${windowSeconds} s`),
      prefix: "ratelimit",
    });
    const { success } = await limiter.limit(key);
    return success;
  } catch (err) {
    console.error("[rateLimit] checkWindowLimit error, fail-open:", err);
    return true;
  }
}

/**
 * Compteur d'échecs réinitialisable sur succès : "au plus `max` échecs
 * consécutifs par `windowSeconds` secondes, remis à zéro dès qu'un essai
 * réussit". Utilisé pour le PIN de la PWA Mimi (lib/mimiAuth.ts).
 *
 * Retourne `false` si la limite est dépassée (appel bloqué), `true` sinon.
 * N'incrémente PAS automatiquement — appeler `recordFailure` séparément
 * après un échec constaté par l'appelant.
 */
export async function isFailureLimitExceeded(
  key: string,
  max: number,
): Promise<boolean> {
  if (!redis) return false;

  try {
    const current = await redis.get<number>(key);
    return (current ?? 0) >= max;
  } catch (err) {
    console.error("[rateLimit] isFailureLimitExceeded error, fail-open:", err);
    return false;
  }
}

/**
 * Enregistre un échec : incrémente le compteur, pose une expiration de
 * `windowSeconds` uniquement si c'est le premier échec de la fenêtre (une
 * clé sans TTL ne doit jamais rester en Redis indéfiniment).
 */
export async function recordFailure(
  key: string,
  windowSeconds: number,
): Promise<void> {
  if (!redis) return;

  try {
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, windowSeconds);
    }
  } catch (err) {
    console.error("[rateLimit] recordFailure error (ignoré, fail-open):", err);
  }
}

/**
 * Réinitialise le compteur d'échecs (appelé après un succès).
 */
export async function clearFailures(key: string): Promise<void> {
  if (!redis) return;

  try {
    await redis.del(key);
  } catch (err) {
    console.error("[rateLimit] clearFailures error (ignoré, fail-open):", err);
  }
}
```

- [ ] **Step 2: Vérifier TypeScript**

Run: `npx tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 3: Commit**

```bash
git add lib/rateLimit.ts
git commit -m "feat(security): ajoute lib/rateLimit.ts — wrapper Upstash Redis fail-open

Deux familles de limiteurs : fenêtre glissante (checkWindowLimit, pour
reservations/contact) et compteur d'échecs réinitialisable sur succès
(isFailureLimitExceeded/recordFailure/clearFailures, pour le PIN Mimi).
Toute erreur Redis est fail-open : la requête est autorisée plutôt que
bloquée, conformément à la spec.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 3 : Migrer `app/api/reservations/route.ts`

**Files:**

- Modify: `app/api/reservations/route.ts:1-46`

- [ ] **Step 1: Retirer le rate limiter en mémoire et l'import**

Remplacer (lignes 1-24) :

```ts
// app/api/reservations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getSettings } from "@/lib/settings";
import { generateWhatsAppLink } from "@/lib/whatsapp";
import { sendNotificationEmail } from "@/lib/sendNotificationEmail";
import { sendClientConfirmationEmail } from "@/lib/sendClientConfirmationEmail";
import { sendPushToMimi } from "@/lib/sendPushToMimi";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const maxRequests = 5;
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}
```

par :

```ts
// app/api/reservations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getSettings } from "@/lib/settings";
import { generateWhatsAppLink } from "@/lib/whatsapp";
import { sendNotificationEmail } from "@/lib/sendNotificationEmail";
import { sendClientConfirmationEmail } from "@/lib/sendClientConfirmationEmail";
import { sendPushToMimi } from "@/lib/sendPushToMimi";
import { checkWindowLimit } from "@/lib/rateLimit";
```

(Le reste du fichier, à partir des `VALID_SERVICES`, ne bouge pas.)

- [ ] **Step 2: Remplacer l'appel synchrone par l'appel async**

Remplacer (lignes ~39-46) :

```ts
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Trop de tentatives, réessaie dans 10 minutes." },
      { status: 429 },
    );
  }
```

par :

```ts
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  const allowed = await checkWindowLimit(`reservations:${ip}`, 5, 600);
  if (!allowed) {
    return NextResponse.json(
      { error: "Trop de tentatives, réessaie dans 10 minutes." },
      { status: 429 },
    );
  }
```

Le message d'erreur reste identique (spec : pas de changement de texte). Le
seuil (5 requêtes / 600 secondes = 10 min) est strictement identique à
l'ancien `maxRequests = 5` / `windowMs = 10 * 60 * 1000`.

- [ ] **Step 3: Vérifier TypeScript**

Run: `npx tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 4: Commit**

```bash
git add "app/api/reservations/route.ts"
git commit -m "fix(security): migre le rate limit de /api/reservations vers Upstash Redis

Remplace le Map en mémoire (remis à zéro à chaque redéploiement Railway)
par un compteur Redis persistant. Seuil inchangé : 5 requêtes / 10 min
par IP.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 4 : Migrer `app/api/contact/route.ts`

**Files:**

- Modify: `app/api/contact/route.ts:1-27`

- [ ] **Step 1: Retirer le rate limiter en mémoire et ajouter l'import**

Remplacer (lignes 1-14) :

```ts
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

function esc(str: string | undefined): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

const rateLimitMap = new Map<string, { count: number; ts: number }>();
```

par :

```ts
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { checkWindowLimit } from "@/lib/rateLimit";

function esc(str: string | undefined): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}
```

- [ ] **Step 2: Remplacer la logique du rate limiter dans `POST`**

Remplacer (lignes ~16-27) :

```ts
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  const inWindow = entry && now - entry.ts < 60_000;
  if (inWindow && entry.count >= 3) {
    return NextResponse.json({ error: "Trop de demandes" }, { status: 429 });
  }
  rateLimitMap.set(
    ip,
    inWindow ? { count: entry.count + 1, ts: entry.ts } : { count: 1, ts: now },
  );
```

par :

```ts
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const allowed = await checkWindowLimit(`contact:${ip}`, 3, 60);
  if (!allowed) {
    return NextResponse.json({ error: "Trop de demandes" }, { status: 429 });
  }
```

Seuil inchangé : 3 requêtes / 60 secondes. Note : `ip` reste calculé de la
même façon qu'avant (sans split sur la virgule) — bug préexistant hors scope,
ne pas corriger ici (voir note dans le contexte du plan).

- [ ] **Step 3: Vérifier TypeScript**

Run: `npx tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 4: Commit**

```bash
git add "app/api/contact/route.ts"
git commit -m "fix(security): migre le rate limit de /api/contact vers Upstash Redis

Remplace le Map en mémoire par un compteur Redis persistant. Seuil
inchangé : 3 requêtes / 1 min par IP.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 5 : Migrer `lib/mimiAuth.ts`

**Files:**

- Modify: `lib/mimiAuth.ts` (fichier complet, 84 lignes)

C'est la tâche la plus délicate : `checkMimiPin` passe de synchrone à async,
ce qui impacte tous ses appelants (voir Étape préliminaire du plan, avant
Task 1, pour la liste).

- [ ] **Step 1: Réécrire le fichier complet**

Remplacer tout le contenu de `lib/mimiAuth.ts` par :

```ts
// lib/mimiAuth.ts
//
// Authentification par PIN de la PWA planning de Mimi (/mimi.html) et de ses
// API (/api/mimi, /api/mimi-settings, /api/push).
//
// Règles de sécurité :
//  - PIN lu UNIQUEMENT dans le header `x-mimi-pin` (jamais en query string :
//    les query strings sont loggées par Railway/Cloudflare et restent dans
//    l'historique navigateur).
//  - PAS de fallback en dur : si MIMI_PIN n'est pas défini côté serveur, toute
//    requête est rejetée (503). Un déploiement sans la variable ne doit pas
//    ouvrir l'accès avec un PIN devinable.
//  - Comparaison à temps constant (crypto.timingSafeEqual).
//  - Rate limit par IP : 3 tentatives échouées / 30 min. Persistant via
//    Upstash Redis (lib/rateLimit.ts) — ne se réinitialise plus à chaque
//    redéploiement/scale Railway, contrairement à l'ancienne implémentation
//    en mémoire.

import { timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";
import {
  isFailureLimitExceeded,
  recordFailure,
  clearFailures,
} from "@/lib/rateLimit";

const WINDOW_SECONDS = 30 * 60;
const MAX_FAILURES = 3;

function clientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

function constantTimeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  // timingSafeEqual exige des longueurs égales : on compare d'abord la longueur
  // (l'info « longueur du PIN » n'est pas un secret exploitable ici).
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export type MimiAuthResult =
  { ok: true } | { ok: false; status: 401 | 429 | 503; error: string };

/**
 * Vérifie le PIN Mimi d'une requête API.
 * Usage :
 *   const auth = await checkMimiPin(req);
 *   if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
 */
export async function checkMimiPin(req: NextRequest): Promise<MimiAuthResult> {
  const expected = process.env.MIMI_PIN;
  if (!expected) {
    return {
      ok: false,
      status: 503,
      error: "Service indisponible (configuration manquante).",
    };
  }

  const ip = clientIp(req);
  const key = `mimi-auth:${ip}`;

  if (await isFailureLimitExceeded(key, MAX_FAILURES)) {
    return {
      ok: false,
      status: 429,
      error: "Trop de tentatives. Réessaie plus tard.",
    };
  }

  const provided = req.headers.get("x-mimi-pin") ?? "";
  if (provided && constantTimeEqual(provided, expected)) {
    await clearFailures(key);
    return { ok: true };
  }

  await recordFailure(key, WINDOW_SECONDS);
  return { ok: false, status: 401, error: "PIN incorrect" };
}
```

- [ ] **Step 2: Mettre à jour tous les appelants de `checkMimiPin`**

Reprendre la liste obtenue par le grep de l'Étape préliminaire (avant Task 1).
Pour CHAQUE fichier listé, ajouter `await` devant l'appel `checkMimiPin(req)`
si ce n'est pas déjà fait, et s'assurer que la fonction englobante est bien
`async` (elle devrait déjà l'être, ce sont des handlers de route Next.js).

Exemple de changement attendu dans chaque route concernée :

```ts
// avant
const auth = checkMimiPin(req);

// après
const auth = await checkMimiPin(req);
```

- [ ] **Step 3: Vérifier TypeScript**

Run: `npx tsc --noEmit`
Expected: aucune erreur. Si `tsc` signale un appel non-awaité sur une
Promise, c'est qu'un appelant a été manqué à l'Étape 2 — corriger et
relancer `tsc` jusqu'à zéro erreur.

- [ ] **Step 4: Commit**

```bash
git add lib/mimiAuth.ts app/api/mimi/route.ts app/api/mimi-settings/route.ts app/api/push/route.ts
git commit -m "fix(security): migre le rate limit du PIN Mimi vers Upstash Redis

checkMimiPin() devient async — tous les appelants mis à jour avec await.
Remplace le Map en mémoire par un compteur d'échecs Redis réinitialisable
sur succès. Seuil inchangé : 3 échecs / 30 min par IP.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

Note : la liste exacte des fichiers à ajouter au commit dépend du résultat du
grep de l'Étape préliminaire — ajuster la commande `git add` avec les
fichiers réellement modifiés.

---

## Task 6 : Vérification build + test manuel du comportement

**Files:** aucun (validation uniquement)

- [ ] **Step 1: TypeScript complet**

Run: `npx tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: build réussi, aucune nouvelle erreur par rapport à la baseline
connue (voir le plan précédent `2026-09-05-setrequestlocale-cache-fix.md`
pour la sortie de référence).

- [ ] **Step 3: Playwright contre le build local (non-régression)**

```bash
npm start &
sleep 5
PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test 2>&1 | tail -10
kill %1
```

Expected: `136 passed / 2 skipped`, 0 échec — même référence que les sessions
précédentes. Aucun test Playwright existant ne couvre `/api/reservations`,
`/api/contact` ou `/mimi.html` directement (à confirmer par
`grep -rn "api/reservations\|api/contact\|mimi.html" e2e/` avant de conclure
"zéro régression" — si un test les couvre bien, vérifier qu'il passe toujours
avec la même attention).

- [ ] **Step 4: Test manuel du rate limit RÉEL avec Upstash branché — /api/contact**

Avec le serveur local démarré (`npm run build && npm start`, comme à l'Étape
3), envoyer 4 requêtes rapides :

```bash
for i in 1 2 3 4; do
  curl -s -o /dev/null -w "requête $i → %{http_code}\n" -X POST http://localhost:3000/api/contact \
    -H "Content-Type: application/json" \
    -d '{"prenom":"Test","nom":"Test","telephone":"+212600000000","email":"test@test.com","demande":"test rate limit"}'
done
```

Expected : les 3 premières requêtes répondent autre chose que 429 (probablement
400 si l'email Resend n'est pas configuré en local, ou 200 si il l'est — peu
importe, ce qu'on vérifie c'est que ce n'est PAS 429), la 4e répond 429.

- [ ] **Step 5: Vérifier dans le dashboard Upstash que la clé existe**

Aller sur le dashboard Upstash (console.upstash.com) → base
`gorgeous-yak-138078` → onglet Data Browser (ou CLI intégrée) → chercher une
clé commençant par `ratelimit:contact:`. Confirmer qu'elle existe avec un TTL
actif. Cette étape est manuelle (Mouj) — documenter dans le rapport de tâche
que ça a été vérifié visuellement, pas seulement déduit du comportement HTTP.

- [ ] **Step 6: Test manuel du fail-open**

Renommer temporairement `UPSTASH_REDIS_REST_TOKEN` en
`UPSTASH_REDIS_REST_TOKEN_DISABLED` dans `.env.local` (ou commenter la ligne),
redémarrer le serveur (`npm start`), et refaire l'Étape 4 : les 4 requêtes
doivent TOUTES réussir (pas de 429), avec un `console.warn` visible dans les
logs du serveur au démarrage (`[rateLimit] UPSTASH_REDIS_REST_URL/TOKEN
absents...`). Remettre la variable en place après le test et redémarrer.

- [ ] **Step 7: Commit de vérification (si un ajustement a été nécessaire)**

Si les Steps 1-6 n'ont demandé aucune modification de code, ne rien
committer ici. Si un ajustement a été nécessaire (ex. un appelant de
`checkMimiPin` manqué), committer isolément :

```bash
git add -A
git commit -m "fix: ajustement post-vérification rate limiters persistants

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 7 : Déploiement et vérification en production

**Files:** aucun (déploiement + validation)

- [ ] **Step 1: Ajouter les variables d'environnement à Railway**

Action manuelle de Mouj (pas de code) : dans le dashboard Railway, service
`salon-mimi` → Variables → ajouter `UPSTASH_REDIS_REST_URL` et
`UPSTASH_REDIS_REST_TOKEN` avec les mêmes valeurs que `.env.local`. Confirmer
avec Mouj que c'est fait avant de pousser le code (l'app ne doit pas se
retrouver sans ces variables au moment du déploiement, même si le
fail-open empêcherait un crash — le rate limit serait juste inactif en prod
sinon, ce qui annule tout l'intérêt du chantier).

- [ ] **Step 2: Push vers `origin/main`**

Confirmer avec Mouj avant de pousser (action visible/partagée).

```bash
git push origin main
```

- [ ] **Step 3: Attendre la fin du déploiement Railway**

~2-3 minutes, comme observé lors des sessions précédentes sur ce projet.

- [ ] **Step 4: Refaire le test manuel du rate limit en prod — /api/contact**

```bash
for i in 1 2 3 4; do
  curl -s -o /dev/null -w "requête $i → %{http_code}\n" -X POST https://mimi-coiffure.com/api/contact \
    -H "Content-Type: application/json" \
    -d '{"prenom":"Test","nom":"Test","telephone":"+212600000000","email":"test@test.com","demande":"test rate limit prod"}'
done
```

Expected : 3 premières autre chose que 429, la 4e → 429. **Ne pas répéter ce
test plus que nécessaire en prod** (chaque requête déclenche un vrai email
Resend si le rate limit n'est pas atteint — limiter les tests aux 4 requêtes
nécessaires pour vérifier le seuil).

- [ ] **Step 5: Playwright en full contre la vraie prod**

```bash
PLAYWRIGHT_BASE_URL=https://mimi-coiffure.com npx playwright test 2>&1 | tail -10
```

Expected: `136 passed / 2 skipped`, 0 échec.

- [ ] **Step 6: Checklist obligatoire du projet**

- `/admin/dashboard` — les réservations s'affichent
- `/reservation` — soumission normale fonctionne (pas bloquée par le rate
  limit après le test de l'Étape 4, qui cible `/api/contact` pas
  `/api/reservations`)
- Le PIN de `/mimi.html` fonctionne toujours (Mouj teste manuellement avec
  le vrai PIN)

- [ ] **Step 7: Vérification différée — non-réinitialisation au redéploiement**

Point noté dans la spec comme vérification différée, hors de cette session :
au prochain redéploiement Railway de ce projet (pour n'importe quelle autre
raison), vérifier que le compteur Redis d'une IP ayant déjà des tentatives
en cours n'est PAS remis à zéro par le redéploiement — contrairement au
comportement de l'ancien `Map` en mémoire. Ajouter cette vérification au
handoff comme point de suivi, pas comme condition bloquante pour ce
chantier.

- [ ] **Step 8: Mettre à jour le handoff**

Ajouter une section documentant : le fix déployé, les 3 routes migrées, les
résultats des tests manuels (Étapes 4-6 de cette tâche), et le point de
suivi différé (Étape 7).

```bash
git add handoff.md
git commit -m "docs: handoff — rate limiters persistants Upstash déployés et vérifiés

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
git push origin main
```

---

## Self-review notes (pour l'agent qui exécute)

- Task 5 est la plus risquée : le passage de `checkMimiPin` en async peut
  casser silencieusement un appelant oublié si `tsc` ne le détecte pas
  (un appel non-awaité sur une fonction qui retourne une Promise ne cause
  PAS d'erreur TypeScript par défaut — `auth.ok` serait `undefined` sur un
  objet Promise et le check `if (!auth.ok)` serait toujours vrai, bloquant
  TOUT accès Mimi). Vérifier manuellement chaque appelant listé par le grep
  préliminaire, ne pas se fier uniquement à `tsc --noEmit`.
- Ne jamais tester le fail-open (Task 6, Step 6) directement en production —
  toujours en local d'abord.
- Le message d'erreur et les seuils numériques ne doivent jamais changer par
  rapport à l'implémentation actuelle (contrainte explicite de la spec).
