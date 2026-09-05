# Fix P1 : activer le cache SSG via setRequestLocale — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Activer le rendu statique (SSG) des 8 pages publiques `app/[locale]/*` en appelant `setRequestLocale(locale)`, pour que le `Cache-Control` ne soit plus `no-store` en production.

**Architecture:** Ajout d'un seul appel `setRequestLocale(locale)` (API `next-intl/server`) dans le layout `[locale]` et dans chacune des 8 pages, immédiatement après la résolution de `locale` et avant tout appel `getTranslations`/`getMessages`. Aucune autre logique ne change.

**Tech Stack:** Next.js 14 App Router, next-intl, TypeScript strict, Vitest, Playwright.

---

## Contexte de référence

- Spec : `docs/superpowers/specs/2026-09-05-setrequestlocale-cache-fix-design.md`
- Cause racine déjà diagnostiquée en session du 4 sept. 2026 (handoff §28)
- Fichiers dans la portée (aucun autre) :
  - `app/[locale]/layout.tsx`
  - `app/[locale]/page.tsx`
  - `app/[locale]/a-propos/page.tsx`
  - `app/[locale]/contact/page.tsx`
  - `app/[locale]/galerie/page.tsx`
  - `app/[locale]/mentions-legales/page.tsx`
  - `app/[locale]/politique-de-confidentialite/page.tsx`
  - `app/[locale]/reservation/page.tsx`
  - `app/[locale]/services/page.tsx`
- Vérifié pendant le brainstorming : aucune de ces pages n'appelle `headers()` ou `cookies()` côté serveur — pas d'obstacle structurel au SSG.

## Baseline avant de commencer

- [ ] **Étape 0.1 : Vérifier l'état actuel du build (baseline)**

Run: `npx tsc --noEmit && npm run build 2>&1 | grep -E "^(┌|├|└|●|ƒ|○)"`

Noter le résultat : les 8 routes `[locale]/*` doivent apparaître marquées `●` (SSG) dans la légende Next.js — **mais ce marqueur ment actuellement** (SSG apparent alors que le rendu reste dynamique à cause de `getRequestConfig`/`requestLocale` non résolu statiquement). Ce n'est donc pas un test suffisant à lui seul ; il sert de point de comparaison avec le comportement runtime réel vérifié après coup (Étape finale, Cache-Control observé en prod). Ne pas bloquer sur ce point : juste noter la sortie actuelle pour référence.

- [ ] **Étape 0.2 : Lancer la suite de tests existante (référence avant changement)**

Run: `npm run test`
Expected: tous les tests Vitest passent (aucune régression pré-existante à confondre avec le futur changement).

Run: `npm start & sleep 3 && PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test 2>&1 | tail -5; kill %1`
Expected: `136 passed / 2 skipped` (référence connue, cf. handoff session 5 sept. 2026).

---

## Task 1 : `app/[locale]/layout.tsx`

**Files:**

- Modify: `app/[locale]/layout.tsx:1-30` (imports + fonction `LocaleLayout`, ligne ~193-201)

Le layout appelle déjà `assertLocale(locale)` avant `getMessages()`. Il faut insérer `setRequestLocale(locale)` entre les deux.

- [ ] **Step 1: Ajouter l'import**

Modifier la ligne 4 :

```ts
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
```

devient :

```ts
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
```

- [ ] **Step 2: Appeler `setRequestLocale` avant `getMessages()`**

Dans `LocaleLayout` (actuellement lignes 193-202) :

```ts
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  assertLocale(locale);
  const messages = await getMessages();
```

devient :

```ts
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  assertLocale(locale);
  setRequestLocale(locale);
  const messages = await getMessages();
```

- [ ] **Step 3: Vérifier TypeScript**

Run: `npx tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 4: Commit**

```bash
git add "app/[locale]/layout.tsx"
git commit -m "$(cat <<'EOF'
fix(perf): active le rendu statique du layout [locale] via setRequestLocale

Sans cet appel, next-intl ne peut pas signaler à Next.js que la locale est
résolue statiquement, ce qui force tout le sous-arbre [locale] en rendu
dynamique — d'où le Cache-Control: no-store sur tout le site public malgré
les revalidate déjà en place (audit SEO du 30 août 2026, P1).

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2 : `app/[locale]/page.tsx` (home)

**Files:**

- Modify: `app/[locale]/page.tsx:4` (import), `app/[locale]/page.tsx:56-64` (fonction `HomePage`)

Cette page utilise `getTranslations` deux fois (`t`, `tBooking`). `setRequestLocale` doit précéder ces deux appels.

- [ ] **Step 1: Ajouter l'import**

Ligne 4, actuellement :

```ts
import { getTranslations } from "next-intl/server";
```

devient :

```ts
import { getTranslations, setRequestLocale } from "next-intl/server";
```

- [ ] **Step 2: Appeler `setRequestLocale` en premier dans `HomePage`**

Lignes 56-64, actuellement :

```ts
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "hero" });
  const tBooking = await getTranslations({ locale, namespace: "booking" });
  const settings = await getSettings();
```

devient :

```ts
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "hero" });
  const tBooking = await getTranslations({ locale, namespace: "booking" });
  const settings = await getSettings();
```

- [ ] **Step 3: Vérifier TypeScript**

Run: `npx tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 4: Commit**

```bash
git add "app/[locale]/page.tsx"
git commit -m "$(cat <<'EOF'
fix(perf): active le rendu statique de la home via setRequestLocale

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3 : `app/[locale]/a-propos/page.tsx`

**Files:**

- Modify: `app/[locale]/a-propos/page.tsx:165-171`

Cette page n'appelle ni `getTranslations` ni `getMessages` (contenu en dur via l'objet `content`). `setRequestLocale` reste nécessaire pour signaler la locale statique au niveau de cette route, même sans lecture de traductions ici — le layout parent en dépend aussi pour toute la sous-arborescence.

- [ ] **Step 1: Ajouter l'import**

Ligne 3, actuellement :

```ts
import Image from "next/image";
```

devient :

```ts
import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
```

- [ ] **Step 2: Appeler `setRequestLocale` en premier dans `AProposPage`**

Lignes 165-171, actuellement :

```ts
export default async function AProposPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const data = content[locale] ?? content.fr;
```

devient :

```ts
export default async function AProposPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const data = content[locale] ?? content.fr;
```

- [ ] **Step 3: Vérifier TypeScript**

Run: `npx tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 4: Commit**

```bash
git add "app/[locale]/a-propos/page.tsx"
git commit -m "$(cat <<'EOF'
fix(perf): active le rendu statique de /a-propos via setRequestLocale

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4 : `app/[locale]/contact/page.tsx`

**Files:**

- Modify: `app/[locale]/contact/page.tsx` (imports + fonction de page)

- [ ] **Step 1: Lire le fichier pour localiser la fonction de page exacte**

Run: `grep -n "^export default async function\|^import" "app/[locale]/contact/page.tsx"`

Confirmer la ligne de la fonction de page et l'endroit où `const { locale } = await params;` est déclaré (première ligne du corps de la fonction, avant tout usage de `getSettings()` ou composants).

- [ ] **Step 2: Ajouter l'import `setRequestLocale`**

Ajouter `setRequestLocale` à l'import `next-intl/server` existant si présent, sinon ajouter une nouvelle ligne d'import :

```ts
import { setRequestLocale } from "next-intl/server";
```

- [ ] **Step 3: Appeler `setRequestLocale(locale)` juste après `const { locale } = await params;` dans la fonction de page par défaut (pas dans `generateMetadata`)**

- [ ] **Step 4: Vérifier TypeScript**

Run: `npx tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 5: Commit**

```bash
git add "app/[locale]/contact/page.tsx"
git commit -m "$(cat <<'EOF'
fix(perf): active le rendu statique de /contact via setRequestLocale

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 5 : `app/[locale]/galerie/page.tsx`

**Files:**

- Modify: `app/[locale]/galerie/page.tsx`

- [ ] **Step 1: Lire le fichier pour localiser la fonction de page exacte**

Run: `grep -n "^export default async function\|^import" "app/[locale]/galerie/page.tsx"`

- [ ] **Step 2: Ajouter l'import `setRequestLocale`** (même pattern que Task 4, Step 2)

- [ ] **Step 3: Appeler `setRequestLocale(locale)` juste après `const { locale } = await params;` dans la fonction de page par défaut**

- [ ] **Step 4: Vérifier TypeScript**

Run: `npx tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 5: Commit**

```bash
git add "app/[locale]/galerie/page.tsx"
git commit -m "$(cat <<'EOF'
fix(perf): active le rendu statique de /galerie via setRequestLocale

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 6 : `app/[locale]/mentions-legales/page.tsx`

**Files:**

- Modify: `app/[locale]/mentions-legales/page.tsx`

- [ ] **Step 1: Lire le fichier pour localiser la fonction de page exacte**

Run: `grep -n "^export default async function\|^import" "app/[locale]/mentions-legales/page.tsx"`

- [ ] **Step 2: Ajouter l'import `setRequestLocale`** (même pattern que Task 4, Step 2)

- [ ] **Step 3: Appeler `setRequestLocale(locale)` juste après `const { locale } = await params;` dans la fonction de page par défaut**

- [ ] **Step 4: Vérifier TypeScript**

Run: `npx tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 5: Commit**

```bash
git add "app/[locale]/mentions-legales/page.tsx"
git commit -m "$(cat <<'EOF'
fix(perf): active le rendu statique de /mentions-legales via setRequestLocale

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 7 : `app/[locale]/politique-de-confidentialite/page.tsx`

**Files:**

- Modify: `app/[locale]/politique-de-confidentialite/page.tsx`

- [ ] **Step 1: Lire le fichier pour localiser la fonction de page exacte**

Run: `grep -n "^export default async function\|^import" "app/[locale]/politique-de-confidentialite/page.tsx"`

- [ ] **Step 2: Ajouter l'import `setRequestLocale`** (même pattern que Task 4, Step 2)

- [ ] **Step 3: Appeler `setRequestLocale(locale)` juste après `const { locale } = await params;` dans la fonction de page par défaut**

- [ ] **Step 4: Vérifier TypeScript**

Run: `npx tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 5: Commit**

```bash
git add "app/[locale]/politique-de-confidentialite/page.tsx"
git commit -m "$(cat <<'EOF'
fix(perf): active le rendu statique de /politique-de-confidentialite via setRequestLocale

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 8 : `app/[locale]/reservation/page.tsx`

**Files:**

- Modify: `app/[locale]/reservation/page.tsx:4` (import), fonction de page (ligne ~49 pour `getTranslations`)

Cette page utilise déjà `getTranslations` (ligne 49 : `const t = await getTranslations({ locale, namespace: "booking" });`). `setRequestLocale` doit précéder cet appel.

- [ ] **Step 1: Ajouter l'import**

Ligne 4, actuellement :

```ts
import { getTranslations } from "next-intl/server";
```

devient :

```ts
import { getTranslations, setRequestLocale } from "next-intl/server";
```

- [ ] **Step 2: Localiser la déclaration de `locale` dans la fonction de page**

Run: `grep -n "await params\|getTranslations" "app/[locale]/reservation/page.tsx"`

Insérer `setRequestLocale(locale);` immédiatement après `const { locale } = await params;` et avant la ligne `const t = await getTranslations(...)`.

- [ ] **Step 3: Vérifier TypeScript**

Run: `npx tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 4: Commit**

```bash
git add "app/[locale]/reservation/page.tsx"
git commit -m "$(cat <<'EOF'
fix(perf): active le rendu statique de /reservation via setRequestLocale

Le formulaire et le paramètre ?service= restent gérés côté client
(ReservationLayout, "use client") — inchangé par ce commit.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 9 : `app/[locale]/services/page.tsx`

**Files:**

- Modify: `app/[locale]/services/page.tsx`

- [ ] **Step 1: Lire le fichier pour localiser la fonction de page exacte**

Run: `grep -n "^export default async function\|^import\|getTranslations\|getMessages" "app/[locale]/services/page.tsx"`

- [ ] **Step 2: Ajouter l'import `setRequestLocale`** (même pattern que Task 4, Step 2 — fusionner avec l'import `next-intl/server` existant s'il y en a un)

- [ ] **Step 3: Appeler `setRequestLocale(locale)` juste après `const { locale } = await params;` dans la fonction de page par défaut, avant tout appel `getTranslations`/`getMessages` s'il y en a**

- [ ] **Step 4: Vérifier TypeScript**

Run: `npx tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 5: Commit**

```bash
git add "app/[locale]/services/page.tsx"
git commit -m "$(cat <<'EOF'
fix(perf): active le rendu statique de /services via setRequestLocale

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 10 : Vérification globale et non-régression

**Files:** aucun (validation uniquement)

- [ ] **Step 1: TypeScript complet**

Run: `npx tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 2: Build de production et vérification du marqueur SSG**

Run: `npm run build 2>&1 | tee /tmp/build-output.txt`
Expected: build réussi (exit code 0).

Run: `grep -A 30 "Route (app)" /tmp/build-output.txt`
Expected : chacune des 8 routes `[locale]/*` (home, a-propos, contact, galerie, mentions-legales, politique-de-confidentialite, reservation, services) apparaît marquée `●` (SSG), avec ses 3 sous-routes `/fr`, `/en`, `/es` listées dessous — comme dans le build de référence de la session du 5 sept. 2026 (voir handoff §29). Aucune de ces 8 routes ne doit apparaître marquée `ƒ` (dynamique).

- [ ] **Step 3: Vitest**

Run: `npm run test`
Expected: tous les tests passent, aucune régression par rapport à la baseline (Étape 0.2).

- [ ] **Step 4: Playwright contre le build local**

```bash
npm start &
sleep 5
PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test 2>&1 | tail -10
kill %1
```

Expected: `136 passed / 2 skipped`, 0 échec (même référence que la baseline Étape 0.2 et que la session du 5 sept. 2026).

- [ ] **Step 5: Vérification manuelle navigateur (build local, avant déploiement)**

```bash
npm start &
sleep 5
curl -sI http://localhost:3000/fr | grep -i cache-control
curl -sI http://localhost:3000/en/services | grep -i cache-control
curl -sI http://localhost:3000/es/reservation | grep -i cache-control
kill %1
```

Expected : en local, `next start` peut encore renvoyer un `Cache-Control` différent de la prod Railway (pas de CDN local) — l'important ici est l'absence d'erreur serveur (pas de 500) sur les 3 URLs et un `Cache-Control` qui n'est plus explicitement `no-store` si la page a bien basculé en SSG. Si `no-store` persiste en local uniquement, ce n'est pas bloquant — la vérification décisive se fait en prod (Task 11).

- [ ] **Step 6: Commit de vérification (si des ajustements ont été faits pendant cette tâche)**

Si les Steps 1-5 n'ont nécessité aucune modification de code, ne rien committer ici (rien à committer). Si un ajustement a été nécessaire (ex. ordre d'import incorrect détecté par `tsc`), committer ce fix isolément :

```bash
git add -A
git commit -m "$(cat <<'EOF'
fix: ajustement post-vérification setRequestLocale

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 11 : Déploiement et vérification en production

**Files:** aucun (déploiement + validation)

Ce chantier suit la Règle 0 du projet (zéro régression tolérée) et la checklist obligatoire du projet (mémoire `salon-mimi-*`).

- [ ] **Step 1: Push vers `origin/main`**

Confirmer avec Mouj avant de pousser (action visible/partagée sur un dépôt distant).

```bash
git push origin main
```

- [ ] **Step 2: Attendre la fin du déploiement Railway**

Railway déploie automatiquement sur push. Attendre ~2-3 minutes avant de vérifier (référence : session du 5 sept. 2026, ~6 minutes observées pour un déploiement complet).

- [ ] **Step 3: Vérifier le Cache-Control en production sur les 8 pages × 3 langues**

```bash
for locale in fr en es; do
  for path in "" "/a-propos" "/contact" "/galerie" "/mentions-legales" "/politique-de-confidentialite" "/reservation" "/services"; do
    url="https://mimi-coiffure.com/${locale}${path}"
    cc=$(curl -sI "$url" | grep -i "^cache-control:" | tr -d '\r')
    echo "${url} → ${cc}"
  done
done
```

Expected : aucune ligne ne doit contenir `no-store`. Le `Cache-Control` doit refléter le comportement Next.js SSG/ISR normal (typiquement `s-maxage=...` ou similaire selon la config Railway/Cloudflare en amont).

- [ ] **Step 4: Vérification manuelle au navigateur**

Ouvrir dans le navigateur (ou via le Browser pane) :

- `https://mimi-coiffure.com/fr` — vérifier que la home s'affiche normalement, avis Google visibles, pas d'erreur console
- `https://mimi-coiffure.com/en/services` — vérifier que les prix s'affichent
- `https://mimi-coiffure.com/fr/reservation?service=box-braids` — vérifier que le service est présélectionné dans le formulaire
- Changer de langue via le sélecteur sur au moins une page — vérifier que la navigation fonctionne sans erreur

- [ ] **Step 5: Playwright en full contre la vraie prod**

```bash
PLAYWRIGHT_BASE_URL=https://mimi-coiffure.com npx playwright test 2>&1 | tail -10
```

Expected: `136 passed / 2 skipped`, 0 échec.

- [ ] **Step 6: Réservation test → dashboard admin**

Soumettre une réservation test sur `/fr/reservation` et confirmer manuellement qu'elle apparaît dans `/admin/dashboard` (checklist obligatoire du projet, point non automatisable).

- [ ] **Step 7: Mettre à jour le handoff**

Ajouter une section au handoff (`handoff.md`) documentant :

- Le fix déployé (commit range, résumé)
- Les résultats de vérification (Cache-Control confirmé sur les 8×3 URLs, Playwright prod, réservation test)
- Que le chantier P1 de l'audit du 30 août 2026 est maintenant clos

```bash
git add handoff.md
git commit -m "$(cat <<'EOF'
docs: handoff — fix P1 Cache-Control déployé et vérifié en prod

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
git push origin main
```

---

## Self-review notes (pour l'agent qui exécute)

- Chaque page suit le même pattern mécanique : import `setRequestLocale` + un appel juste après `const { locale } = await params;`. Les Tasks 4-7 et 9 demandent un `grep` préalable car le nom exact de la fonction de page et la position exacte de la déclaration `locale` n'ont pas été lues ligne par ligne pendant le brainstorming (seules les ~15 premières lignes ont été vérifiées) — ne pas deviner l'emplacement, le confirmer avec le grep avant d'éditer.
- Ne jamais appeler `setRequestLocale` après un premier `await` sur `getTranslations`/`getMessages` dans le même fichier — l'ordre est la seule contrainte technique de ce chantier.
- Si `tsc --noEmit` échoue sur une tâche à cause d'un import dupliqué (ex. `next-intl/server` importé deux fois), fusionner les imports en une seule ligne plutôt que d'en garder deux.
