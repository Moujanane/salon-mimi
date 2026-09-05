# Migration Next.js 14 → 15 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Passer le site de `next` 14.2.35 à `next` 15.5.25 pour corriger les CVE de la branche Next 14, sans changement fonctionnel visible.

**Architecture:** Migration à périmètre minimal. React reste en 18, `next-intl` reste en `^4.12.0` (déjà compatible Next 15). Deux fichiers serveur utilisent encore l'API synchrone dépréciée (`params` non-Promise, `cookies()` synchrone) — ils passent en async. Un nouveau test Playwright couvre la route API `reservations/[id]` qui n'en avait aucun. Travail dans un worktree git isolé, merge fast-forward sur `main` quand tout est vert.

**Tech Stack:** Next.js 15 (App Router), TypeScript strict, `@supabase/ssr`, Playwright, next-intl 4.

**Spec de référence:** `docs/superpowers/specs/2026-09-05-migration-nextjs15-design.md`

---

## Rappels opérationnels (valables pour toutes les tâches)

- **Répertoire de travail** : le worktree `../salon-mimi-migration-nextjs15` créé en Tâche 1, PAS `/Users/Mouj/Desktop/salon-mimi`.
- **Lancer Playwright contre le local uniquement** : `playwright.config.ts` a pour `baseURL` par défaut `https://mimi-coiffure.com`. Toujours préfixer par `PLAYWRIGHT_BASE_URL=http://localhost:3000`.
- **Flaky préexistants à ne pas imputer à la migration** :
  - `e2e/site.spec.ts` « la page services s'affiche » — peut timeout (vidéos jsDelivr sur `/fr/services`).
  - `e2e/seo-canonical.spec.ts` « chaque URL du sitemap répond 200 » — appelle la vraie prod (sitemap à URLs absolues).
- **Node** : v22.14.0 en place, compatible Next 15. Ne rien changer à Node.

---

## File Structure

| Fichier                              | Rôle                                                                          | Action                                                                                       |
| ------------------------------------ | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `package.json`                       | Manifest deps                                                                 | Modifier : `next` et `eslint-config-next` → `15.5.25`                                        |
| `package-lock.json`                  | Lockfile                                                                      | Régénéré par `npm install`                                                                   |
| `app/[locale]/opengraph-image.tsx`   | Génère l'image OpenGraph par langue                                           | Modifier : `params` → `Promise` + `await`                                                    |
| `app/api/reservations/[id]/route.ts` | API PATCH (statut) + DELETE d'une réservation, appelée par le dashboard admin | Modifier : `params` → `Promise` + `await` ; `cookies()` → `await cookies()` (PATCH + DELETE) |
| `e2e/api-reservations-id.spec.ts`    | Test de contrat de la route ci-dessus                                         | Créer                                                                                        |

Aucun autre fichier ne doit être modifié. `middleware.ts`, `next.config.mjs` et les 10 autres `app/[locale]/**` sont déjà conformes Next 15 (vérifié dans la spec §4).

---

## Task 1: Créer le worktree isolé et vérifier l'état de départ

**Files:** aucun fichier modifié (setup d'environnement).

- [ ] **Step 1: Vérifier que `main` est propre côté fichiers suivis**

Run (depuis `/Users/Mouj/Desktop/salon-mimi`) :

```bash
git status --porcelain | grep -v '^??' || echo "CLEAN"
```

Expected : `CLEAN` (les fichiers non suivis `??` sont OK, ce sont des assets docs).

- [ ] **Step 2: Créer le worktree sur une nouvelle branche**

Run :

```bash
git worktree add -b migration-nextjs15 ../salon-mimi-migration-nextjs15 main
```

Expected : `Preparing worktree (new branch 'migration-nextjs15')` puis `HEAD is now at a1494f1 ...`.

- [ ] **Step 3: Se placer dans le worktree et installer les deps actuelles**

Run :

```bash
cd ../salon-mimi-migration-nextjs15 && npm ci
```

Expected : installation sans erreur. `node_modules/` est propre au worktree.

- [ ] **Step 4: Copier le fichier d'environnement local**

Le worktree n'hérite pas de `.env.local` (non suivi par git).
Run :

```bash
cp ../salon-mimi/.env.local .env.local && echo "OK env"
```

Expected : `OK env`. Sans ça, `npm run build` et le dev server échouent (variables Supabase/Resend absentes).

- [ ] **Step 5: Vérifier le point de départ — build + tests verts AVANT toute modif**

Run :

```bash
npx tsc --noEmit && npm run build
```

Expected : `tsc` sans sortie (0 erreur), build Next 14 réussi (`✓ Compiled successfully`, liste des routes).

- [ ] **Step 6: Lancer la suite Playwright contre le build local de départ**

Run :

```bash
npx next start -p 3000 &
sleep 5
PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test
kill %1
```

Expected : suite verte hors flaky connus. **Noter le nombre exact de `passed` / `skipped`** — c'est la référence de non-régression pour la Tâche 6.

- [ ] **Step 7: Commit du point de départ (lockfile inchangé, rien à committer)**

Aucun fichier modifié à ce stade. Pas de commit. Passer à la Tâche 2.

---

## Task 2: Corriger `app/[locale]/opengraph-image.tsx` (params async)

**Files:**

- Modify: `app/[locale]/opengraph-image.tsx:8-13`

- [ ] **Step 1: Appliquer le changement**

Remplacer les lignes 8 à 13 :

```tsx
export default async function OgImage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params?.locale ?? "fr";
```

par :

```tsx
export default async function OgImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
```

Le reste du fichier (lignes 15-76) est inchangé. Les usages `titles[locale] ?? titles.fr` et `subtitles[locale] ?? subtitles.fr` gèrent déjà une locale inattendue.

- [ ] **Step 2: Vérifier que TypeScript accepte le changement**

Ce fichier seul ne compile pas encore contre Next 14 (le type `PageProps` généré attend `params` synchrone). C'est attendu : le `tsc` complet se fait en Tâche 4 après le bump. Passer à l'étape suivante.

- [ ] **Step 3: Commit**

Run :

```bash
git add "app/[locale]/opengraph-image.tsx"
git commit -m "refactor(og): params async pour compat Next 15

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 3: Corriger `app/api/reservations/[id]/route.ts` (params + cookies async)

**Files:**

- Modify: `app/api/reservations/[id]/route.ts` (handlers `PATCH` et `DELETE`)

- [ ] **Step 1: Modifier la signature et le corps de `PATCH`**

Lignes 9-13, remplacer :

```tsx
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const cookieStore = cookies();
```

par :

```tsx
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const cookieStore = await cookies();
```

Puis ligne 44, remplacer `.eq("id", params.id);` par `.eq("id", id);`.

- [ ] **Step 2: Modifier la signature et le corps de `DELETE`**

Lignes 57-61, remplacer :

```tsx
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const cookieStore = cookies();
```

par :

```tsx
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const cookieStore = await cookies();
```

Puis ligne 85, remplacer `.eq("id", params.id);` par `.eq("id", id);`.

- [ ] **Step 3: Vérifier qu'il ne reste aucune référence à `params.id`**

Run (depuis le worktree) :

```bash
grep -n "params\.id\|cookieStore = cookies()" "app/api/reservations/[id]/route.ts" || echo "CLEAN"
```

Expected : `CLEAN`.

- [ ] **Step 4: Commit**

Run :

```bash
git add "app/api/reservations/[id]/route.ts"
git commit -m "refactor(api): params et cookies async dans reservations/[id]

Compat Next 15 : params devient Promise, cookies() devient async.
Handlers PATCH et DELETE.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 4: Bump `next` → 15.5.25 et faire compiler

**Files:**

- Modify: `package.json` (`next`, `eslint-config-next`)
- Modify: `package-lock.json` (régénéré)

- [ ] **Step 1: Installer Next 15 et son eslint-config**

Run (depuis le worktree) :

```bash
npm install next@15.5.25 eslint-config-next@15.5.25
```

Expected : installation réussie, `package.json` et `package-lock.json` mis à jour.

**Si `npm install` échoue sur un conflit de peer deps** : NE PAS forcer avec `--legacy-peer-deps`. Réessayer avec `next@15.3.9 eslint-config-next@15.3.9`. Si ça passe, noter le changement de cible et prévenir Mouj avant de continuer. Si ça échoue aussi, s'arrêter et remonter l'erreur complète.

- [ ] **Step 2: Vérifier les versions écrites**

Run :

```bash
node -p "const p=require('./package.json'); p.dependencies.next + ' | ' + p.devDependencies['eslint-config-next']"
```

Expected : `15.5.25 | 15.5.25` (ou la cible de fallback si Step 1 l'a imposée).

- [ ] **Step 3: TypeScript — zéro erreur**

Run :

```bash
npx tsc --noEmit
```

Expected : aucune sortie. Si erreur sur `params` ailleurs que dans les 2 fichiers déjà traités : s'arrêter, remonter le fichier et la ligne (la spec supposait 10/12 fichiers déjà conformes — une erreur ici invalide cette hypothèse et demande une reprise de plan).

- [ ] **Step 4: Lint**

Run :

```bash
npm run lint
```

Expected : `✔ No ESLint warnings or errors` (ou seulement des warnings préexistants — comparer avec `cd ../salon-mimi && npm run lint`).

- [ ] **Step 5: Build de production**

Run :

```bash
npm run build
```

Expected : `✓ Compiled successfully`, génération des routes sans erreur. Vérifier qu'`/[locale]/opengraph-image` apparaît toujours dans la liste des routes.

- [ ] **Step 6: Commit**

Run :

```bash
git add package.json package-lock.json
git commit -m "chore(deps): next 14.2.35 -> 15.5.25

Corrige les CVE de la branche Next 14. React et next-intl inchangés.
tsc, lint et build verts.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 5: Ajouter le test de contrat `e2e/api-reservations-id.spec.ts`

**Files:**

- Create: `e2e/api-reservations-id.spec.ts`

- [ ] **Step 1: Écrire le test**

Créer `e2e/api-reservations-id.spec.ts` avec ce contenu exact :

```ts
import { test, expect } from "@playwright/test";

// Contrat de la route app/api/reservations/[id]/route.ts sous Next 15.
// On ne teste PAS la logique métier (Supabase pur, non affecté par Next 15) :
// il n'existe pas d'infra de login admin dans Playwright. On vérifie que la
// route ne crash pas au runtime Next 15 (params async, cookies() async) et que
// le garde d'authentification répond bien 401 sans session.

const FAKE_ID = "00000000-0000-0000-0000-000000000000";

test.describe("API /api/reservations/[id] — contrat (Next 15)", () => {
  test("PATCH sans cookie de session → 401", async ({ request }) => {
    const res = await request.patch(`/api/reservations/${FAKE_ID}`, {
      data: { statut: "confirmee" },
    });
    expect(res.status()).toBe(401);
  });

  test("PATCH sans cookie, body invalide → 401 (auth avant validation)", async ({
    request,
  }) => {
    const res = await request.patch(`/api/reservations/${FAKE_ID}`, {
      data: { statut: "valeur_invalide" },
    });
    expect(res.status()).toBe(401);
  });

  test("DELETE sans cookie de session → 401", async ({ request }) => {
    const res = await request.delete(`/api/reservations/${FAKE_ID}`);
    expect(res.status()).toBe(401);
  });
});
```

- [ ] **Step 2: Vérifier que le test échoue si le serveur est éteint (sanity check négatif)**

Run (sans serveur lancé) :

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test e2e/api-reservations-id.spec.ts --project=desktop
```

Expected : FAIL — `ECONNREFUSED` ou timeout. Confirme que le test tape bien le local et non la prod.

- [ ] **Step 3: Lancer le serveur et vérifier que le test passe**

Run :

```bash
npx next start -p 3000 &
sleep 5
PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test e2e/api-reservations-id.spec.ts --project=desktop
kill %1
```

Expected : `3 passed`.

- [ ] **Step 4: Commit**

Run :

```bash
git add e2e/api-reservations-id.spec.ts
git commit -m "test(e2e): contrat de la route reservations/[id] (401 sans session)

Premiere couverture de cette route. Verifie le runtime Next 15
(params async, cookies async) et le garde d'auth.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 6: Non-régression — suite Playwright complète contre le build local

**Files:** aucun (vérification).

- [ ] **Step 1: Build neuf**

Run (depuis le worktree) :

```bash
npm run build
```

Expected : `✓ Compiled successfully`.

- [ ] **Step 2: Lancer la suite complète contre le local**

Run :

```bash
npx next start -p 3000 &
sleep 5
PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test
kill %1
```

Expected : nombre de `passed` **≥ la référence notée en Tâche 1 Step 6**, plus les 3 nouveaux tests de la Tâche 5. Les seuls échecs tolérés sont les 2 flaky préexistants listés dans les rappels opérationnels — et uniquement s'ils échouent aussi sur `main` non migré.

- [ ] **Step 3: Si un test non-flaky échoue**

S'arrêter. Reproduire l'échec isolément (`npx playwright test <fichier> --project=<desktop|mobile> --headed` si besoin). Diagnostiquer avant tout fix (skill `superpowers:systematic-debugging`). Ne pas continuer vers le merge.

- [ ] **Step 4: Rien à committer**

Vérification seule. Passer à la Tâche 7.

---

## Task 7: Revue de code

**Files:** aucun (revue).

- [ ] **Step 1: Relire le diff complet de la branche**

Run :

```bash
git diff main...migration-nextjs15
```

- [ ] **Step 2: Checklist de revue (règle 5 projet)**

Vérifier :

- **Sécurité** : le garde d'auth (`if (!user || authError) return 401`) est toujours AVANT toute lecture de body ou tout appel `supabaseAdmin` dans PATCH et DELETE. `await cookies()` est bien appelé avant `createServerClient`.
- **Logique** : `const { id } = await params;` est placé avant la première utilisation de `id`. Plus aucune occurrence de `params.id`.
- **Données** : `.eq("id", id)` cible bien la bonne colonne, `id` est le même UUID que celui de l'URL.
- **Race conditions** : aucune nouvelle — les `await` ajoutés sont séquentiels, pas de parallélisme introduit.
- **Périmètre** : le diff ne touche QUE les 5 fichiers listés dans File Structure. Aucun fichier collatéral.
- **Lockfile** : `package-lock.json` ne fait remonter que des changements liés à `next` / `eslint-config-next` et leurs sous-dépendances, pas de downgrade surprise d'un autre paquet.

- [ ] **Step 3: Corriger si besoin**

Si la revue remonte un problème : le corriger dans un commit dédié sur la branche, puis relancer Tâche 6.

---

## Task 8: Merge fast-forward sur `main` et déploiement

**Files:** aucun (livraison).

- [ ] **Step 1: Se remettre sur le dépôt principal**

Run :

```bash
cd /Users/Mouj/Desktop/salon-mimi
```

- [ ] **Step 2: Vérifier que `main` n'a pas bougé**

Run :

```bash
git fetch origin && git status -sb
```

Expected : `## main...origin/main` sans `behind`. Si `behind`, faire `git pull --ff-only` puis rebaser la branche `migration-nextjs15` sur le nouveau `main` depuis le worktree et re-lancer Tâche 6.

- [ ] **Step 3: Merge fast-forward**

Run :

```bash
git merge --ff-only migration-nextjs15
```

Expected : `Fast-forward`, liste des 4 commits (og, api, deps, test).

- [ ] **Step 4: Push**

Run :

```bash
git push origin main
```

Expected : push accepté. Railway déclenche un déploiement automatiquement.

- [ ] **Step 5: Attendre la fin du déploiement Railway**

Surveiller le dashboard Railway jusqu'à build + deploy terminés (~2-4 min). Ne pas passer à la vérification prod avant que le déploiement soit marqué actif.

---

## Task 9: Vérification en production

**Files:** aucun (vérification prod).

- [ ] **Step 1: Headers et pages publiques**

Run :

```bash
curl -sI https://mimi-coiffure.com/fr | grep -i "cache-control\|x-powered-by"
curl -so /dev/null -w "%{http_code}\n" https://mimi-coiffure.com/fr
curl -so /dev/null -w "%{http_code}\n" https://mimi-coiffure.com/en/services
curl -so /dev/null -w "%{http_code}\n" https://mimi-coiffure.com/fr/opengraph-image
curl -so /dev/null -w "%{http_code}\n" https://mimi-coiffure.com/admin/dashboard
```

Expected : `/fr` → 200, `/en/services` → 200, `/fr/opengraph-image` → 200, `/admin/dashboard` → 307 (redirect login). `Cache-Control` doit rester `s-maxage=3600, stale-while-revalidate` (acquis du chantier setRequestLocale — vérifier qu'il n'a pas régressé en `no-store`).

- [ ] **Step 2: Suite Playwright complète contre la vraie prod**

Run (depuis `/Users/Mouj/Desktop/salon-mimi`) :

```bash
npx playwright test
```

Expected : verte hors les 2 flaky préexistants. (Ici pas de `PLAYWRIGHT_BASE_URL` : on veut délibérément la prod.)

- [ ] **Step 3: Test manuel — DEMANDER À MOUJ**

Message à Mouj :

> Migration en ligne. Peux-tu faire ce test rapide sur ton dashboard admin :
>
> 1. Connecte-toi sur https://mimi-coiffure.com/admin/login
> 2. Sur le dashboard, change le statut d'une réservation (par ex. en_attente → confirmée), recharge la page, vérifie que le statut a bien changé.
> 3. Supprime une réservation de test, vérifie qu'elle disparaît.
>    Dis-moi si les deux marchent.

Attendre la confirmation de Mouj. Si un des deux échoue : `superpowers:systematic-debugging`, ne pas clore.

- [ ] **Step 4: Checklist obligatoire projet**

Avec Mouj / par vérification directe :

1. `/admin/dashboard` affiche les réservations. ✓ (couvert par Step 3)
2. `/reservation` — soumettre le formulaire, la réservation part.
3. La réservation test apparaît dans le dashboard.
4. `npx playwright test` full prod déjà fait au Step 2.

---

## Task 10: Nettoyage et handoff

**Files:**

- Modify: `handoff.md`

- [ ] **Step 1: Supprimer le worktree**

Run :

```bash
cd /Users/Mouj/Desktop/salon-mimi
git worktree remove ../salon-mimi-migration-nextjs15
git branch -d migration-nextjs15
```

Expected : worktree supprimé, branche supprimée (elle est mergée dans `main`).

- [ ] **Step 2: Mettre à jour `handoff.md`**

Remplacer toute la section « À faire — prochaine session : migration Next.js 14 → 15 » (en haut du fichier) par une nouvelle section datée décrivant :

- `next` 14.2.35 → 15.5.25 (ou fallback si utilisé), React + next-intl inchangés
- Les 3 fichiers de code touchés + le nouveau test `e2e/api-reservations-id.spec.ts`
- Résultats : `tsc` ✓, `build` ✓, Playwright local + prod verts (préciser les chiffres)
- Test manuel dashboard (changement statut + suppression) confirmé par Mouj
- `Cache-Control` prod toujours `s-maxage=3600` (pas de régression)
- Reste non traité : `npm audit fix` devDeps, migration Next 16, audit RLS Supabase

- [ ] **Step 3: Commit du handoff**

Run :

```bash
git add handoff.md
git commit -m "docs: handoff — migration Next 15 deployee et verifiee

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
git push origin main
```

- [ ] **Step 4: Mettre à jour la mémoire projet si nécessaire**

Si la migration a changé une règle durable (ex. commande de build, version Node requise), mettre à jour le fichier mémoire `salon-mimi-*` concerné. Sinon, rien à faire.

---

## Self-Review (effectué à l'écriture du plan)

**1. Couverture de la spec :**

- Spec §1 (cible 15.5.25 + fallback 15.3.9) → Tâche 4 Step 1.
- Spec §2 (hors périmètre) → File Structure verrouille les fichiers touchés ; Tâche 7 Step 2 vérifie qu'aucun fichier collatéral n'est modifié.
- Spec §3.1 (opengraph-image) → Tâche 2.
- Spec §3.2 (route.ts PATCH + DELETE) → Tâche 3.
- Spec §4 (fichiers non touchés) → note sous File Structure + garde-fou Tâche 4 Step 3.
- Spec §5.1 (nouveau test) → Tâche 5.
- Spec §5.2 (non-régression, piège baseURL) → Rappels opérationnels + Tâche 1 Step 6 + Tâche 6.
- Spec §5.3 (tsc/build/lint) → Tâche 4 Steps 3-5.
- Spec §5.4 (test manuel) → Tâche 9 Step 3.
- Spec §5.5 (checklist projet) → Tâche 9 Step 4.
- Spec §6 (worktree, merge ff) → Tâche 1 + Tâche 8.
- Spec §8 (risques) → fallback géré Tâche 4 Step 1, garde-fou tsc Tâche 4 Step 3, Cache-Control vérifié Tâche 9 Step 1.
- Spec §9 (critère de fin) → Tâches 9 et 10.

**2. Placeholders :** aucun `TODO`/`TBD`. Tous les diffs de code sont donnés en entier. Le test Playwright est écrit complet.

**3. Cohérence des types :** `params: Promise<{ locale: string }>` (Tâche 2) et `params: Promise<{ id: string }>` (Tâche 3) sont les seules signatures async introduites, cohérentes avec le pattern déjà utilisé dans les 10 autres fichiers `[locale]`. `const { id } = await params;` réutilisé à l'identique dans PATCH et DELETE. `FAKE_ID` défini une fois en tête du fichier de test.

**Point d'attention non bloquant relevé à la revue :** `.env.local` doit être copié dans le worktree (Tâche 1 Step 4) — non suivi par git, absent sinon, ce qui casserait `npm run build`.
