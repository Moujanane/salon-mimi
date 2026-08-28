# Tunnel de réservation v3 — formulaire commun — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Afficher le formulaire de réservation en permanence (plus de bouton pour le révéler), avec deux boutons d'envoi en bas : « Confirmer ma réservation » (ocre, → API) et « Réserver par WhatsApp » (vert, ouvre WhatsApp avec un message pré-rempli à partir des champs, exige Nom + Téléphone).

**Architecture:** Édition de `components/sections/ReservationLayout.tsx` uniquement (+ tests). On retire le state `showForm` et le bloc « 2 boutons de choix » du haut (introduits en v2). On enveloppe à nouveau rien : la grille form+photo redevient toujours-rendue (comme la v1). Le bouton submit unique est remplacé par un bloc de 2 boutons. Nouveau handler `handleWhatsApp` qui lit les champs via une ref sur le `<form>`, valide Nom + Téléphone, construit l'URL via `generateWhatsAppLink` (déjà dans `lib/whatsapp.ts`) et navigue. Le hotfix `useSearchParams`→`useEffect` (commit `a843b57`) est **conservé tel quel**.

**Tech Stack:** Next.js 14 App Router, React client component, next-intl, Tailwind, Playwright (baseURL prod par défaut, surchargeable `PLAYWRIGHT_BASE_URL`).

---

## Contexte pour l'implémenteur

- Repo : `/Users/Mouj/Desktop/salon-mimi`. Déploiement Railway auto sur push `main`.
- La v2 + hotfix sont **en prod sur `main`** (dernier commit code : `a843b57`).
- Spec : `docs/superpowers/specs/2026-08-30-tunnel-reservation-v3-formulaire-commun-design.md`.
- **NE PAS réintroduire `useSearchParams()`** — ça a causé le bug d'hydratation de la section 19bis du handoff. La lecture `?service=` reste dans le `useEffect` existant.
- Pièges handoff : jamais de `window.open()` après `await fetch()` (ici `handleWhatsApp` est synchrone → `window.location.href` OK) ; toujours `text-nuit` sur les inputs ; pas de RLS.
- `preview_start` peut échouer (`EPERM uv_cwd`). Contournement : `nohup node node_modules/.bin/next dev -p 3100 > /tmp/mimi-dev.log 2>&1 &`. Toujours `pkill -f "next dev -p 3100"` après.
- Couleurs Tailwind : `whatsapp` #25D366, `whatsapp-hover` #1ebe5d, `ocre` #C17B3F, `or`, `fond` #F6EFE3, `nuit` #1A0D05.

### État actuel de `ReservationLayout.tsx` (post-hotfix `a843b57`)

- Imports (lignes 1-6) : `"use client"`, `{ useEffect, useState } from "react"`, `Image from "next/image"`, `{ genericWhatsAppLink } from "@/lib/whatsapp"`, `WhatsAppIcon from "@/components/ui/WhatsAppIcon"`.
- `TEXTS: Record<string, {...}>` — interface + fr/en/es. Clés pertinentes : `whatsappPrimaryBtn` (l.122/158/194/230), `formBtn` (l.123/164/200/236), `submitBtn` (l.124/165/201/237), `reassurance`, `priceIndicative`, `addDetails`, `noOnlinePayment`, `startingFrom`, `yourInfo`, `required`, `fullName`, `phone`, `date`, `time`, `persons`, `person1..4`, `message`, `*Placeholder`, `subheading`, `heading`, `lostTitle/Text/CallLabel`, `confirmSubtitle`, `whatsappBtn`, `success`(labels), `error`(labels).
- États (l.264-276) : `activeIndex` (+ `useEffect` `?service=`), `submitted`, `whatsappLink`, `error`, `showDetails`, **`showForm`**.
- `handleSubmit` (l.280+) : `getVal()` helper, `POST /api/reservations`, `if (!res.ok) throw`, `window.location.href = json.whatsappLink`, `setSubmitted(true)`. **Ne pas modifier.**
- `if (submitted)` → écran de confirmation. **Ne pas modifier.**
- Branche principale `return (...)` :
  - `<div className="min-h-screen flex flex-col bg-fond">` → spacer `h-[57px]` → en-tête `<div className="flex-shrink-0 px-5 md:px-12 py-3 border-b border-ocre/20">`
  - **bloc « Choix du mode de réservation »** (l.363-391) : `<div className="flex-shrink-0 px-5 md:px-12 pt-4 pb-2">` contenant `<div className="flex flex-col sm:flex-row gap-3">` avec le `<a href={genericWhatsAppLink(locale)}>` vert + le `<button onClick={() => setShowForm(...)}>` ocre-outline, puis `<p>{tx.reassurance}</p>`.
  - **`{showForm && (`** (l.393) `<div className="flex flex-col md:flex-row flex-1 min-h-0 gap-4 p-4 pt-3">` … fermé par `)}` (l.596), juste avant `{/* Section "Vous ne trouvez pas le salon ?" */}` (l.598).
    - dans : panneau `<form onSubmit={handleSubmit}>` (Service+prix, Nom+Tél, Date, `+ Ajouter des précisions` → `{showDetails && ...}`, `{error && ...}`, `<button type="submit">{tx.submitBtn}</button>` l.543-548, `<p>{tx.reassurance} · {tx.noOnlinePayment}</p>` l.550-552) + panneau photo `<div className="hidden md:block flex-1 bg-nuit ...">`.
  - section « Vous ne trouvez pas le salon ? » (l.598+).

### `lib/whatsapp.ts` (déjà en place)

```ts
export interface ReservationData {
  nom: string;
  telephone: string;
  service: string;
  dateSouhaitee?: string;
  message?: string;
}
export function generateWhatsAppLink(
  data: ReservationData,
  whatsappNumber?: string,
): string;
// construit "https://wa.me/<num>?text=<message multi-lignes encodé>"
```

---

## File Structure

| Fichier                                     | Action                                                                                                                                                                                                                                                |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/sections/ReservationLayout.tsx` | Modifier : retrait `showForm` + bloc choix ; grille form+photo toujours rendue ; `useRef` sur le form ; `handleWhatsApp` ; state `whatsappError` ; bloc 2 boutons ; import `generateWhatsAppLink` ; i18n (retrait `formBtn`, ajout `whatsappMissing`) |
| `e2e/site.spec.ts`                          | Modifier : tests CRO adaptés (formulaire visible d'emblée, bouton WhatsApp = `<button>`) + retrait des clics « Réserver par formulaire » dans le bloc « Formulaire de réservation »                                                                   |

---

## Task 1 : i18n — retirer `formBtn`, ajouter `whatsappMissing`

**Files:**

- Modify: `components/sections/ReservationLayout.tsx`

- [ ] **Step 1 : Interface du type `TEXTS`**

Ligne ~123 : remplacer `formBtn: string;` par `whatsappMissing: string;`. Garder `whatsappPrimaryBtn` et `submitBtn`.

- [ ] **Step 2 : Bloc `fr`**

Remplacer `formBtn: "Réserver par formulaire",` par :

```tsx
    whatsappMissing: "Merci d'indiquer au moins votre nom et votre téléphone.",
```

- [ ] **Step 3 : Bloc `en`**

Remplacer `formBtn: "Book via form",` par :

```tsx
    whatsappMissing: "Please enter at least your name and phone number.",
```

- [ ] **Step 4 : Bloc `es`**

Remplacer `formBtn: "Reservar con formulario",` par :

```tsx
    whatsappMissing: "Indica al menos tu nombre y tu teléfono.",
```

- [ ] **Step 5 : Vérifier TypeScript**

Run: `cd /Users/Mouj/Desktop/salon-mimi && npx tsc --noEmit`
Expected: **erreur attendue** ligne ~385 (`tx.formBtn` n'existe plus, encore référencé dans le JSX du bloc choix). Normal — Task 2 retire ce bloc. Ne pas committer, enchaîner Task 2.

---

## Task 2 : Retirer `showForm` + bloc choix, formulaire toujours rendu, 2 boutons, `handleWhatsApp`

**Files:**

- Modify: `components/sections/ReservationLayout.tsx`

- [ ] **Step 1 : Import `generateWhatsAppLink` + `useRef`**

Ligne 2 : `import { useEffect, useRef, useState } from "react";`
Ligne 5 : `import { generateWhatsAppLink, genericWhatsAppLink } from "@/lib/whatsapp";`
(`genericWhatsAppLink` n'est plus utilisé après Task 2 Step 3 — le retirer de l'import à ce moment-là. Voir Step 5.)

- [ ] **Step 2 : States — retirer `showForm`, ajouter `whatsappError` + ref form**

Remplacer :

```tsx
const [showDetails, setShowDetails] = useState(false);
const [showForm, setShowForm] = useState(false);
```

par :

```tsx
const [showDetails, setShowDetails] = useState(false);
const [whatsappError, setWhatsappError] = useState("");
const formRef = useRef<HTMLFormElement>(null);
```

- [ ] **Step 3 : Ajouter `handleWhatsApp` après `handleSubmit`**

Juste après la fermeture de `async function handleSubmit(...) { ... }` (avant `if (submitted)`), insérer :

```tsx
function handleWhatsApp() {
  const form = formRef.current;
  if (!form) return;
  const getVal = (name: string) => {
    const el = form.elements.namedItem(name) as
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
    return el?.value?.trim() ?? "";
  };
  const nom = getVal("name");
  const telephone = getVal("phone");
  if (!nom || !telephone) {
    setWhatsappError(tx.whatsappMissing);
    const missing = !nom ? "name" : "phone";
    (form.elements.namedItem(missing) as HTMLElement | null)?.focus();
    return;
  }
  setWhatsappError("");
  const details = [
    getVal("time") ? `Heure : ${getVal("time")}` : null,
    getVal("persons") ? `Personnes : ${getVal("persons")}` : null,
    getVal("message") || null,
  ]
    .filter(Boolean)
    .join(" — ");
  const url = generateWhatsAppLink({
    nom,
    telephone,
    service: activeSvc.label,
    dateSouhaitee: getVal("date") || undefined,
    message: details || undefined,
  });
  window.location.href = url;
}
```

- [ ] **Step 4 : Remplacer le bloc « Choix du mode de réservation » par… rien**

Supprimer intégralement le bloc :

```tsx
      {/* Choix du mode de réservation */}
      <div className="flex-shrink-0 px-5 md:px-12 pt-4 pb-2">
        <div className="flex flex-col sm:flex-row gap-3">
          <a href={genericWhatsAppLink(locale)} ...>...</a>
          <button type="button" onClick={() => setShowForm((v) => !v)} ...>{tx.formBtn}</button>
        </div>
        <p ...>{tx.reassurance}</p>
      </div>
```

(du commentaire `{/* Choix du mode de réservation */}` jusqu'à son `</div>` fermant, juste avant `{showForm && (`).

- [ ] **Step 5 : Retirer `genericWhatsAppLink` de l'import**

Il n'est plus utilisé (le seul usage était dans le bloc supprimé). Ligne 5 :

```tsx
import { generateWhatsAppLink } from "@/lib/whatsapp";
```

- [ ] **Step 6 : Dé-conditionner la grille form+photo**

Remplacer :

```tsx
      {showForm && (
        <div className="flex flex-col md:flex-row flex-1 min-h-0 gap-4 p-4 pt-3">
```

par (dé-indenter d'un niveau tout le bloc jusqu'à son `)}`) :

```tsx
      <div className="flex flex-col md:flex-row flex-1 min-h-0 gap-4 p-4 pt-3">
```

et à la fin, remplacer :

```tsx
        </div>
      )}

      {/* Section "Vous ne trouvez pas le salon ?" */}
```

par :

```tsx
      </div>

      {/* Section "Vous ne trouvez pas le salon ?" */}
```

(Prettier réindentera ; l'essentiel est de retirer `{showForm && (` et le `)}` correspondant, et d'ajuster les `</div>`.)

- [ ] **Step 7 : Ajouter `ref={formRef}` sur le `<form>`**

```tsx
<form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
```

- [ ] **Step 8 : Remplacer le bouton submit unique par le bloc de 2 boutons + l'erreur WhatsApp**

Repérer (l.539-552 approx) :

```tsx
              {error && (
                <p className="text-red-500 text-[12px] font-inter">{error}</p>
              )}

              <button
                type="submit"
                className="w-full bg-ocre hover:bg-or text-white text-[13px] font-inter font-semibold py-3.5 rounded-full transition-colors"
              >
                {tx.submitBtn}
              </button>

              <p className="text-center text-nuit/40 text-[10px] font-inter leading-relaxed">
                {tx.reassurance} · {tx.noOnlinePayment}
              </p>
```

Remplacer par :

```tsx
              {error && (
                <p className="text-red-500 text-[12px] font-inter">{error}</p>
              )}
              {whatsappError && (
                <p className="text-red-500 text-[12px] font-inter">
                  {whatsappError}
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-ocre hover:bg-or text-white text-[13px] font-inter font-semibold py-3.5 rounded-full transition-colors"
                >
                  {tx.submitBtn}
                </button>
                <button
                  type="button"
                  onClick={handleWhatsApp}
                  className="flex-1 flex items-center justify-center gap-2 bg-whatsapp hover:bg-whatsapp-hover text-white text-[13px] font-inter font-semibold py-3.5 rounded-full transition-colors"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  {tx.whatsappPrimaryBtn}
                </button>
              </div>

              <p className="text-center text-nuit/40 text-[10px] font-inter leading-relaxed">
                {tx.reassurance} · {tx.noOnlinePayment}
              </p>
```

- [ ] **Step 9 : Vérifier TypeScript**

Run: `cd /Users/Mouj/Desktop/salon-mimi && npx tsc --noEmit`
Expected: **zéro erreur**. (`showForm`, `formBtn`, `genericWhatsAppLink` ont disparu ; `whatsappError`, `formRef`, `handleWhatsApp`, `generateWhatsAppLink`, `whatsappMissing` sont tous définis/importés.)

- [ ] **Step 10 : Vérifier visuellement en local**

```bash
cd /Users/Mouj/Desktop/salon-mimi
nohup node node_modules/.bin/next dev -p 3100 > /tmp/mimi-dev.log 2>&1 &
sleep 10
curl -s http://localhost:3100/fr/reservation > /tmp/v3.html
echo "formulaire rendu au chargement (select présent) :"; grep -c 'name="service"' /tmp/v3.html
echo "les 2 libellés de bouton :"; grep -oE "(Confirmer ma réservation|Réserver par WhatsApp)" /tmp/v3.html | sort -u
echo "plus de bouton 'Réserver par formulaire' :"; grep -oE "Réserver par formulaire" /tmp/v3.html
echo "plus de bloc choix en haut (genericWhatsAppLink a=wa.me hors formulaire) — le seul wa.me possible est via JS maintenant :"; grep -c "wa.me" /tmp/v3.html
```

Expected : `name="service"` ≥ 1 (formulaire rendu) ; les 2 libellés présents ; « Réserver par formulaire » absent.

Ouvrir `http://localhost:3100/fr/reservation` dans un navigateur :

1. Le formulaire est visible **directement** (Service, prix, Nom, Téléphone, Date, « + Ajouter des précisions »). Panneau photo à droite (desktop).
2. En bas : 2 boutons côte à côte (desktop) — « Confirmer ma réservation » (ocre) et « Réserver par WhatsApp » (vert + icône). Empilés en mobile.
3. Cliquer « Réserver par WhatsApp » **sans rien remplir** → message rouge « Merci d'indiquer au moins votre nom et votre téléphone. » + focus sur le champ Nom. Pas de navigation.
4. Remplir Nom + Téléphone (+ éventuellement Date, coiffure), re-cliquer « Réserver par WhatsApp » → le message d'erreur disparaît, navigation vers `wa.me/212710388204?text=…` avec le nom, le téléphone, la coiffure dans le message.
5. Remplir Nom + Téléphone + Date, cliquer « Confirmer ma réservation » → écran de confirmation (comportement inchangé). Vérifier console : 0 erreur. `tail -20 /tmp/mimi-dev.log`.

- [ ] **Step 11 : Commit (Tasks 1 + 2)**

```bash
cd /Users/Mouj/Desktop/salon-mimi
git add components/sections/ReservationLayout.tsx
git commit -m "feat(reservation): formulaire commun toujours affiché + 2 boutons d'envoi

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 3 : Adapter les tests Playwright

**Files:**

- Modify: `e2e/site.spec.ts`

- [ ] **Step 1 : Bloc « Formulaire de réservation » — retirer les clics « Réserver par formulaire »**

Dans le `test.describe("Formulaire de réservation")` (l.53-73 approx), les 2 tests contiennent :

```ts
await page.getByRole("button", { name: /réserver par formulaire/i }).click();
```

**Supprimer ces 3 lignes dans chacun des 2 tests.** Le formulaire est de nouveau visible d'emblée.

Résultat attendu pour ce describe :

```ts
test.describe("Formulaire de réservation", () => {
  test("la page réservation s'affiche", async ({ page }) => {
    await page.goto("/fr/reservation");
    await expect(page).toHaveURL(/\/fr\/reservation/);
    await expect(page.locator("form, input").first()).toBeVisible();
  });

  test("les champs obligatoires sont présents", async ({ page }) => {
    await page.goto("/fr/reservation");
    await expect(
      page.locator("input[name='name'], input[placeholder*='nom' i]").first(),
    ).toBeVisible();
    await expect(
      page
        .locator(
          "input[name='phone'], input[placeholder*='téléphone' i], input[type='tel']",
        )
        .first(),
    ).toBeVisible();
  });
});
```

- [ ] **Step 2 : Bloc « Tunnel de réservation (CRO) » — remplacer intégralement**

Repérer `test.describe("Tunnel de réservation (CRO)", () => {` jusqu'à son `});` final. Remplacer par :

```ts
test.describe("Tunnel de réservation (CRO)", () => {
  test("le formulaire est visible au chargement", async ({ page }) => {
    await page.goto("/fr/reservation");
    await expect(page.locator("select[name='service']")).toBeVisible();
  });

  test("la ligne de prix change quand on change de coiffure", async ({
    page,
  }) => {
    await page.goto("/fr/reservation");
    const select = page.locator("select[name='service']");
    await expect(select).toBeVisible();
    const priceLine = page.locator(
      "text=/tarif indicatif, confirmé au salon/i",
    );
    const before = await priceLine.first().textContent();
    await select.selectOption({ index: 5 });
    const after = await priceLine.first().textContent();
    expect(after).not.toEqual(before);
  });

  test("les champs optionnels sont masqués puis dépliables", async ({
    page,
  }) => {
    await page.goto("/fr/reservation");
    await expect(page.locator("input[name='email']")).toHaveCount(0);
    await page.getByRole("button", { name: /ajouter des précisions/i }).click();
    await expect(page.locator("input[name='email']")).toBeVisible();
  });

  test("le bouton Réserver par WhatsApp exige nom et téléphone", async ({
    page,
  }) => {
    await page.goto("/fr/reservation");
    const waBtn = page.getByRole("button", {
      name: /réserver par whatsapp/i,
    });
    await expect(waBtn).toBeVisible();
    await waBtn.click();
    await expect(
      page.getByText(/indiquer au moins votre nom et votre téléphone/i),
    ).toBeVisible();
    await page.locator("input[name='name']").fill("Test Playwright");
    await page.locator("input[name='phone']").fill("+212600000000");
    // La 2e tentative doit faire disparaître l'erreur (et lancer la navigation
    // wa.me, qu'on n'assert pas ici pour éviter la fragilité d'interception).
    await waBtn.click();
    await expect(
      page.getByText(/indiquer au moins votre nom et votre téléphone/i),
    ).toHaveCount(0);
  });

  test("le bandeau de réservation sticky est visible en mobile et pointe vers /reservation", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== "mobile",
      "Bandeau sticky mobile uniquement",
    );
    await page.goto("/fr");
    const sticky = page
      .locator("a.fixed.bottom-0")
      .filter({ hasText: /rendez-vous|reservation|réserver/i });
    await expect(sticky.first()).toBeVisible();
    const href = await sticky.first().getAttribute("href");
    expect(href).toMatch(/\/fr\/reservation$/);
  });

  test("le bandeau de réservation sticky est absent en desktop", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== "desktop",
      "Vérifie l'absence en desktop",
    );
    await page.goto("/fr");
    const sticky = page
      .locator("a.fixed.bottom-0")
      .filter({ hasText: /rendez-vous|reservation|réserver/i });
    await expect(sticky.first()).toBeHidden();
  });
});
```

- [ ] **Step 3 : Vérifier que les tests parsent**

Run: `cd /Users/Mouj/Desktop/salon-mimi && npx tsc --noEmit && npx playwright test --list -g "CRO"`
Expected: tsc clean ; 6 tests CRO listés par projet.

- [ ] **Step 4 : Lancer les tests en local**

```bash
cd /Users/Mouj/Desktop/salon-mimi
# dev server sur :3100 doit tourner (relancer si besoin)
PLAYWRIGHT_BASE_URL=http://localhost:3100 npx playwright test --project=desktop
PLAYWRIGHT_BASE_URL=http://localhost:3100 npx playwright test --project=mobile
```

Expected: 100 % vert (11 existants + 6 CRO, 1 skip par projet sur les tests sticky à gate). Si un test échoue et que ce n'est pas une régression réelle, corriger le test ; si c'est un vrai bug produit, STOP et reporter.

- [ ] **Step 5 : Commit**

```bash
cd /Users/Mouj/Desktop/salon-mimi
git add e2e/site.spec.ts
git commit -m "test(e2e): tests CRO adaptés au formulaire commun v3

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 4 : Vérification finale + livraison

**Files:** aucun (vérification)

- [ ] **Step 1 : TypeScript**

Run: `cd /Users/Mouj/Desktop/salon-mimi && npx tsc --noEmit` — zéro erreur.

- [ ] **Step 2 : Build de production**

Run: `cd /Users/Mouj/Desktop/salon-mimi && npm run build 2>&1 | grep -iE "compiled|error|fail|generating static"`
Expected: `✓ Compiled successfully`, `✓ Generating static pages`, aucune erreur.

- [ ] **Step 3 : Test en local prod-build (le bug 19bis n'apparaissait qu'en prod ; on valide au plus près)**

```bash
cd /Users/Mouj/Desktop/salon-mimi
pkill -f "next dev" 2>/dev/null; pkill -f "next start" 2>/dev/null; sleep 2
nohup node node_modules/.bin/next start -p 3100 > /tmp/prod-local.log 2>&1 &
# attendre le 200
until curl -s -o /dev/null -w "%{http_code}" http://localhost:3100/fr/reservation | grep -q 200; do sleep 3; done
```

Ouvrir `http://localhost:3100/fr/reservation` (desktop + viewport mobile) :

- Formulaire visible d'emblée, 2 boutons en bas.
- **Vrai clic** « Réserver par WhatsApp » sans champs → message d'erreur + focus Nom. Avec Nom+Tél → navigation `wa.me`.
- **Vrai clic** « Confirmer ma réservation » avec Nom+Tél+Date → écran de confirmation.
- `/en/reservation` : « Confirm my booking » / « Book via WhatsApp » / message d'erreur EN.
- `/es/reservation` : « Confirmar mi reserva » / « Reservar por WhatsApp » / message d'erreur ES.
- `/fr/reservation?service=box-braids` → `<select>` sur « Box braids », prix correspondant.
- Console : 0 erreur. `tail -30 /tmp/prod-local.log`.
- `pkill -f "next start -p 3100"`.

- [ ] **Step 4 : Push**

```bash
cd /Users/Mouj/Desktop/salon-mimi
git push origin main
```

- [ ] **Step 5 : Attendre le déploiement Railway (~3 min) et vérifier en prod**

```bash
cd /Users/Mouj/Desktop/salon-mimi
OLD=$(curl -s https://mimi-coiffure.com/fr/reservation | grep -oE 'reservation/page-[a-f0-9]+\.js' | head -1)
until [ "$(curl -s https://mimi-coiffure.com/fr/reservation | grep -oE 'reservation/page-[a-f0-9]+\.js' | head -1)" != "$OLD" ]; do sleep 15; done
echo "nouveau déploiement en ligne"
curl -s https://mimi-coiffure.com/fr/reservation | grep -oE "(Confirmer ma réservation|Réserver par WhatsApp)" | sort -u
curl -s https://mimi-coiffure.com/fr/reservation | grep -c 'name="service"'   # >= 1 : formulaire rendu SSR
```

- [ ] **Step 6 : Revue navigateur sur la prod (le test qui compte — bug 19bis)**

Ouvrir `https://mimi-coiffure.com/fr/reservation` :

- Le formulaire est là, les 2 boutons aussi.
- **Vrai clic** « Réserver par WhatsApp » sans rien → message d'erreur (prouve que le handler React est branché en prod).
- Remplir Nom + Téléphone → clic → navigation `wa.me` avec le message pré-rempli.
- **Vrai clic** « Confirmer ma réservation » avec champs → écran de confirmation.
- Vérifier le fiber tree si doute : `ReservationLayout` ne doit PAS être sous un `OffscreenComponent`.

- [ ] **Step 7 : Playwright contre la prod**

```bash
cd /Users/Mouj/Desktop/salon-mimi
npx playwright test --project=desktop
npx playwright test --project=mobile
```

Expected: 100 % vert (1 skip par projet).

- [ ] **Step 8 : Mettre à jour le handoff**

`handoff.md` : ajouter une section « 20. Session 30 août 2026 — Tunnel v3 : formulaire commun » décrivant le formulaire toujours affiché + les 2 boutons d'envoi + `handleWhatsApp` (validation Nom+Tél, message pré-rempli). Marquer la v2 comme remplacée par la v3. Commit + push.

```bash
cd /Users/Mouj/Desktop/salon-mimi
git add handoff.md
git commit -m "docs: handoff — tunnel de réservation v3 (formulaire commun)

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
git push origin main
```

---

## Self-Review (auteur du plan)

**1. Couverture de la spec :**

- §2 décisions (formulaire toujours affiché, retrait showForm, 2 boutons, submit inchangé, WhatsApp exige Nom+Tél, message pré-rempli, photo toujours affichée, ?service= via useEffect) → Task 2 (Steps 2,4,6,8) + Task 1 (i18n). ✅
- §3 structure → Task 2 Steps 4,6,7,8. Section « lost salon » hors du bloc dé-conditionné → Step 6 précise l'ajustement des `</div>`. ✅
- §4 `handleWhatsApp` → Task 2 Step 3, avec `useRef` au lieu de `document.querySelector` (durcissement noté dans la spec §10). ✅
- §5 state → Task 2 Step 2. ✅
- §6 i18n (retrait `formBtn`, ajout `whatsappMissing` × 3 langues + interface) → Task 1. ✅
- §7 sticky inchangé → aucune tâche, confirmé. ✅
- §8 tests (formulaire visible, prix, optionnels, bouton WhatsApp exige Nom+Tél, sticky ×2 ; + retrait clics dans « Formulaire de réservation ») → Task 3. ✅
- §9 fichiers → 2 fichiers, couverts. Pas de changement API / lib / sticky / page.tsx → respecté. ✅

**2. Placeholders :** aucun. Tout le code fourni.

**3. Cohérence des types :** `whatsappError` (string) + `setWhatsappError` déclarés Task 2 Step 2, utilisés Step 3 (set) et Step 8 (render). `formRef` (`useRef<HTMLFormElement>(null)`) déclaré Step 2, `ref={formRef}` posé Step 7, lu dans `handleWhatsApp` Step 3 via `formRef.current`. `generateWhatsAppLink` importé Step 1 puis import nettoyé Step 5 (retrait `genericWhatsAppLink`) — l'ordre est explicite. `tx.whatsappMissing` ajouté aux 3 langues + interface (Task 1) → lu dans `handleWhatsApp` (Task 2 Step 3). Les tests Task 3 ciblent `getByRole("button", { name: /réserver par whatsapp/i })` — c'est bien un `<button>` en v3 (Step 8), plus un `<a>`. Le test « exige nom et téléphone » cible `getByText(/indiquer au moins votre nom et votre téléphone/i)` — sous-chaîne exacte du libellé fr `whatsappMissing`.

**Note :** Task 1 laisse volontairement `tsc` en erreur (JSX du bloc choix référence encore `tx.formBtn`) ; Task 2 Step 4 retire ce bloc et Step 9 revérifie. Commit unique Tasks 1+2 (Task 2 Step 11).
