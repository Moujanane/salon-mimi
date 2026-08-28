# Tunnel de réservation v2 — choix explicite — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer le CTA WhatsApp unique de `/reservation` par deux boutons de choix explicites de même taille (« Réserver par WhatsApp » / « Réserver par formulaire »), le formulaire étant masqué au chargement et déplié au clic. Le bandeau sticky mobile pointe vers `/reservation` au lieu de WhatsApp direct.

**Architecture:** Édition de `components/sections/ReservationLayout.tsx` : nouveau state `showForm`, bloc « 2 boutons » remplaçant le bloc CTA v1, formulaire + panneau photo enveloppés dans `{showForm && (...)}`, bouton de soumission repassé en ocre. Renommage `StickyWhatsApp.tsx` → `StickyBooking.tsx` avec `href` interne vers `/{locale}/reservation`. Aucun changement serveur. Tests e2e adaptés (le formulaire n'est plus dans le DOM au chargement ; le sticky n'a plus de `href` `wa.me`).

**Tech Stack:** Next.js 14 App Router, React client components, next-intl, Tailwind, Playwright (config e2e pointe sur la prod par défaut, surchargeable via `PLAYWRIGHT_BASE_URL`).

---

## Contexte pour l'implémenteur

- Repo : `/Users/Mouj/Desktop/salon-mimi`. Déploiement Railway auto sur push `main`.
- La v1 est **déjà en prod** (commits `c4fbe8e`..`e0d8d8a` sur `main`). Cette v2 modifie cette v1.
- Spec : `docs/superpowers/specs/2026-08-30-tunnel-reservation-v2-choix-explicite-design.md`.
- Handoff : `handoff.md` — pièges connus :
  - Jamais de `window.open()` après `await fetch()` — garder `window.location.href`.
  - Toujours `text-nuit` (ou couleur explicite) sur les inputs (fond clair).
  - Ne pas toucher aux RLS Supabase.
- `preview_start` peut échouer (`EPERM uv_cwd`) — contournement : `nohup node node_modules/.bin/next dev -p 3100 > /tmp/mimi-dev.log 2>&1 &` puis `http://localhost:3100`. Toujours `pkill -f "next dev -p 3100"` après.
- Couleurs Tailwind : `whatsapp` (#25D366), `whatsapp-hover` (#1ebe5d), `ocre` (#C17B3F), `or`, `fond` (#F6EFE3), `nuit` (#1A0D05). Token spacing `sticky-wa` = 52px.

### État actuel de `ReservationLayout.tsx` (post-v1)

- `"use client"`, imports : `useSearchParams`, `useState`, `Image`, `genericWhatsAppLink` from `@/lib/whatsapp`, `WhatsAppIcon` from `@/components/ui/WhatsAppIcon`.
- `TEXTS: Record<string, {...}>` avec blocs `fr` / `en` / `es`. Clés v1 présentes dont : `whatsappPrimaryBtn`, `whatsappPrimaryHint`, `orFillForm`, `reassurance`, `priceIndicative`, `addDetails`, `noOnlinePayment`, `startingFrom`, `yourInfo`, `required`, `fullName`, `phone`, `date`, `time`, `persons`, `person1..4`, `message`, `emailPlaceholder`, `messagePlaceholder`, `namePlaceholder`, `phonePlaceholder`, `confirmSubtitle`, `whatsappBtn`, `lostTitle`, `lostText`, `lostCallLabel`, `subheading`, `heading`, `email`.
- States : `activeIndex`, `submitted`, `whatsappLink`, `error`, `showDetails`.
- `handleSubmit` : `getVal()` helper, `POST /api/reservations`, `if (!res.ok) throw`, `window.location.href = json.whatsappLink`, `setSubmitted(true)`.
- Branche `if (submitted)` → écran de confirmation (inchangé, ne pas toucher).
- Branche principale (`return (...)`) :
  - `<div className="min-h-screen flex flex-col bg-fond">`
  - spacer `<div className="h-[57px] flex-shrink-0" />`
  - en-tête `<div className="flex-shrink-0 px-5 md:px-12 py-3 border-b border-ocre/20">` (span + h1)
  - **bloc CTA v1** : `{/* CTA WhatsApp principal */}` `<div className="flex-shrink-0 px-5 md:px-12 pt-4 pb-2">` contenant le `<a>` vert (href `genericWhatsAppLink(locale)`), `<p>{tx.whatsappPrimaryHint}</p>`, `<p>{tx.reassurance}</p>`, et un `<div>` séparateur avec `{tx.orFillForm}` entre deux `h-px`.
  - **grille form+photo** : `<div className="flex flex-col md:flex-row flex-1 min-h-0 gap-4 p-4 pt-3">` contenant le panneau `<div className="w-full md:w-[44%] bg-white ...">` (avec le `<form onSubmit={handleSubmit}>`) et le panneau photo `<div className="hidden md:block flex-1 bg-nuit ...">`.
  - dans le `<form>` : titre, Service `<select name="service" value={activeIndex}>`, `<p>` ligne de prix, séparateur, grille Nom+Téléphone, séparateur, Date, bouton `+ Ajouter des précisions` (`setShowDetails`), `{showDetails && (...)}` (Heure/Personnes/Email/Message), `{error && ...}`, bouton submit **vert** avec `<WhatsAppIcon className="w-4 h-4" />` + `{tx.whatsappPrimaryBtn}`, `<p>{tx.reassurance} · {tx.noOnlinePayment}</p>`.
  - **section « Vous ne trouvez pas le salon ? »** : `<div className="mx-5 md:mx-12 mb-8 mt-4 bg-nuit ...">` — après la grille form+photo, avant la fermeture du `<div>` racine.

### État actuel de `StickyWhatsApp.tsx`

```tsx
"use client";
import { useLocale } from "next-intl";
import { genericWhatsAppLink } from "@/lib/whatsapp";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";

const LABELS: Record<string, string> = {
  fr: "Réserver sur WhatsApp",
  en: "Book on WhatsApp",
  es: "Reservar por WhatsApp",
};

export default function StickyWhatsApp() {
  const locale = useLocale();
  const label = LABELS[locale] ?? LABELS.fr;
  return (
    <a
      href={genericWhatsAppLink(locale)}
      target="_blank"
      rel="noopener noreferrer"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 h-sticky-wa flex items-center justify-center gap-2 bg-whatsapp hover:bg-whatsapp-hover text-white text-sm font-inter font-medium transition-colors"
      aria-label={label}
    >
      <WhatsAppIcon className="w-5 h-5" />
      {label}
    </a>
  );
}
```

### `app/[locale]/layout.tsx`

Ligne ~9 : `import StickyWhatsApp from "@/components/layout/StickyWhatsApp";`
Ligne ~215 : `<StickyWhatsApp />` (dans `<NextIntlClientProvider>`, après `<CookieBanner />`).
`<main className="pb-sticky-wa lg:pb-0">` — inchangé.

---

## File Structure

| Fichier                                                                        | Action                                                                                                                     |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `components/sections/ReservationLayout.tsx`                                    | Modifier : state `showForm`, bloc 2 boutons, `{showForm &&}` autour de la grille form+photo, bouton submit ocre, clés i18n |
| `components/layout/StickyWhatsApp.tsx` → `components/layout/StickyBooking.tsx` | Renommer via `git mv` + réécrire : href interne, libellés, nom du composant                                                |
| `app/[locale]/layout.tsx`                                                      | Modifier : import + balise `StickyWhatsApp` → `StickyBooking`                                                              |
| `e2e/site.spec.ts`                                                             | Modifier : 6 tests CRO adaptés                                                                                             |

---

## Task 1 : i18n — ajuster les clés de `TEXTS`

**Files:**

- Modify: `components/sections/ReservationLayout.tsx`

- [ ] **Step 1 : Modifier l'interface du type `TEXTS`**

Dans la définition `const TEXTS: Record<string, { ... }>`, dans le bloc d'interface :

- **Supprimer** les lignes `whatsappPrimaryHint: string;` et `orFillForm: string;`
- **Ajouter** `formBtn: string;` et `submitBtn: string;`

- [ ] **Step 2 : Bloc `fr`**

Supprimer :

```tsx
    whatsappPrimaryHint: "Le plus rapide — écris directement à Mimi",
    orFillForm: "ou remplis ce formulaire rapide",
```

Remplacer la valeur de `whatsappPrimaryBtn` par `"Réserver par WhatsApp"` (était « Réserver sur WhatsApp »).
Ajouter (près des autres clés v1, ex. après `noOnlinePayment`) :

```tsx
    formBtn: "Réserver par formulaire",
    submitBtn: "Confirmer ma réservation",
```

- [ ] **Step 3 : Bloc `en`**

Supprimer :

```tsx
    whatsappPrimaryHint: "Fastest way — message Mimi directly",
    orFillForm: "or fill in this quick form",
```

`whatsappPrimaryBtn` → `"Book via WhatsApp"` (était « Book on WhatsApp »).
Ajouter :

```tsx
    formBtn: "Book via form",
    submitBtn: "Confirm my booking",
```

- [ ] **Step 4 : Bloc `es`**

Supprimer :

```tsx
    whatsappPrimaryHint: "Lo más rápido — escribe directamente a Mimi",
    orFillForm: "o rellena este formulario rápido",
```

`whatsappPrimaryBtn` → `"Reservar por WhatsApp"` (inchangé, garder tel quel si déjà cette valeur).
Ajouter :

```tsx
    formBtn: "Reservar con formulario",
    submitBtn: "Confirmar mi reserva",
```

- [ ] **Step 5 : Vérifier TypeScript**

Run: `cd /Users/Mouj/Desktop/salon-mimi && npx tsc --noEmit`
Expected: **des erreurs attendues** dans le JSX de `ReservationLayout.tsx` — `tx.whatsappPrimaryHint` et `tx.orFillForm` n'existent plus. C'est normal, Task 2 les supprime du JSX. Ne PAS committer maintenant. Passer directement à Task 2 (ces deux tâches forment un seul commit).

---

## Task 2 : Bloc « 2 boutons » + state `showForm` + formulaire masqué

**Files:**

- Modify: `components/sections/ReservationLayout.tsx`

- [ ] **Step 1 : Ajouter le state `showForm`**

À côté des autres `useState` (après `const [showDetails, setShowDetails] = useState(false);`) :

```tsx
const [showForm, setShowForm] = useState(false);
```

- [ ] **Step 2 : Remplacer le bloc CTA v1 par le bloc 2 boutons**

Repérer le bloc entier commençant par `{/* CTA WhatsApp principal */}` et se terminant à la fermeture du `<div className="flex-shrink-0 px-5 md:px-12 pt-4 pb-2">` (juste avant `<div className="flex flex-col md:flex-row flex-1 min-h-0 gap-4 p-4 pt-3">`).

Le remplacer INTÉGRALEMENT par :

```tsx
{
  /* Choix du mode de réservation */
}
<div className="flex-shrink-0 px-5 md:px-12 pt-4 pb-2">
  <div className="flex flex-col sm:flex-row gap-3">
    <a
      href={genericWhatsAppLink(locale)}
      target="_blank"
      rel="noopener noreferrer"
      className="flex-1 flex items-center justify-center gap-2.5 bg-whatsapp hover:bg-whatsapp-hover text-white font-inter font-semibold text-[15px] py-4 rounded-full transition-colors"
    >
      <WhatsAppIcon className="w-5 h-5" />
      {tx.whatsappPrimaryBtn}
    </a>
    <button
      type="button"
      onClick={() => setShowForm((v) => !v)}
      aria-expanded={showForm}
      className={`flex-1 flex items-center justify-center gap-2 border-2 border-ocre font-inter font-semibold text-[15px] py-4 rounded-full transition-colors ${
        showForm
          ? "bg-ocre text-white"
          : "bg-transparent text-ocre hover:bg-ocre/10"
      }`}
    >
      {tx.formBtn}
    </button>
  </div>
  <p className="text-center text-nuit/40 text-[10px] font-inter mt-3">
    {tx.reassurance}
  </p>
</div>;
```

- [ ] **Step 3 : Envelopper la grille form+photo dans `{showForm && (...)}`**

Repérer `<div className="flex flex-col md:flex-row flex-1 min-h-0 gap-4 p-4 pt-3">` et son `</div>` de fermeture (celui juste avant `{/* Section "Vous ne trouvez pas le salon ?" */}`).

L'envelopper :

```tsx
{
  showForm && (
    <div className="flex flex-col md:flex-row flex-1 min-h-0 gap-4 p-4 pt-3">
      {/* ... contenu inchangé : panneau form + panneau photo ... */}
    </div>
  );
}
```

Ne rien changer au contenu interne (form, champs, panneau photo) — juste l'enveloppe conditionnelle.

- [ ] **Step 4 : Bouton de soumission → ocre, sans icône WhatsApp**

Dans le `<form>`, repérer le `<button type="submit">` actuel (classes `bg-whatsapp hover:bg-whatsapp-hover ... text-[13px] font-semibold`, contenant `<WhatsAppIcon className="w-4 h-4" />` + `{tx.whatsappPrimaryBtn}`).

Le remplacer par :

```tsx
<button
  type="submit"
  className="w-full bg-ocre hover:bg-or text-white text-[13px] font-inter font-semibold py-3.5 rounded-full transition-colors"
>
  {tx.submitBtn}
</button>
```

(Plus d'icône, plus de `flex items-center justify-center gap-2`, plus de vert.)

- [ ] **Step 5 : Vérifier TypeScript**

Run: `cd /Users/Mouj/Desktop/salon-mimi && npx tsc --noEmit`
Expected: **zéro erreur** (les refs `tx.whatsappPrimaryHint` / `tx.orFillForm` ont disparu du JSX, `tx.formBtn` / `tx.submitBtn` existent dans les 3 langues).

- [ ] **Step 6 : Vérifier visuellement en local**

```bash
cd /Users/Mouj/Desktop/salon-mimi
nohup node node_modules/.bin/next dev -p 3100 > /tmp/mimi-dev.log 2>&1 &
sleep 10
curl -s http://localhost:3100/fr/reservation > /tmp/v2.html
echo "2 boutons présents :"; grep -oE "(Réserver par WhatsApp|Réserver par formulaire)" /tmp/v2.html | sort -u
echo "formulaire masqué au chargement (select absent) :"; grep -c "name=\"service\"" /tmp/v2.html
echo "anciens textes v1 (doit être vide) :"; grep -oE "(Le plus rapide — écris|ou remplis ce formulaire)" /tmp/v2.html
```

Expected : les 2 libellés présents ; `name="service"` → `0` (formulaire pas rendu) ; anciens textes absents.

Ouvrir `http://localhost:3100/fr/reservation` dans un navigateur :

1. Au chargement : titre + 2 boutons (vert plein « Réserver par WhatsApp », contour ocre « Réserver par formulaire ») + ligne de réassurance. Pas de formulaire, pas de panneau photo.
2. Clic « Réserver par formulaire » → le formulaire + le panneau photo apparaissent en dessous. Le bouton passe en fond ocre plein.
3. Re-clic → tout se replie.
4. Le bouton WhatsApp reste visible dans les deux états, `href` = `https://wa.me/212710388204?text=...`.
5. Déplier le formulaire, remplir Nom + Téléphone + Date, cliquer « Confirmer ma réservation » (bouton ocre) → écran de confirmation, pas d'erreur console.

Vérifier la console navigateur (0 erreur) et `tail -20 /tmp/mimi-dev.log`.

- [ ] **Step 7 : Commit (Tasks 1 + 2 ensemble)**

```bash
cd /Users/Mouj/Desktop/salon-mimi
git add components/sections/ReservationLayout.tsx
git commit -m "feat(reservation): choix explicite WhatsApp / formulaire, formulaire masqué au chargement

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 3 : Renommer `StickyWhatsApp` → `StickyBooking`, href interne

**Files:**

- Rename: `components/layout/StickyWhatsApp.tsx` → `components/layout/StickyBooking.tsx`
- Modify: `app/[locale]/layout.tsx`

- [ ] **Step 1 : Renommer le fichier avec git**

```bash
cd /Users/Mouj/Desktop/salon-mimi
git mv components/layout/StickyWhatsApp.tsx components/layout/StickyBooking.tsx
```

- [ ] **Step 2 : Réécrire `components/layout/StickyBooking.tsx`**

Contenu complet :

```tsx
"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";

const LABELS: Record<string, string> = {
  fr: "Réserver un rendez-vous",
  en: "Book an appointment",
  es: "Reservar una cita",
};

// Bandeau fixe en bas d'écran, visible en mobile uniquement (< lg).
// Monté dans le layout [locale] → présent sur toutes les pages publiques.
// Mène vers /reservation (qui propose WhatsApp ET formulaire).
export default function StickyBooking() {
  const locale = useLocale();
  const label = LABELS[locale] ?? LABELS.fr;

  return (
    <Link
      href={`/${locale}/reservation`}
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 h-sticky-wa flex items-center justify-center gap-2 bg-whatsapp hover:bg-whatsapp-hover text-white text-sm font-inter font-medium transition-colors"
      aria-label={label}
    >
      <WhatsAppIcon className="w-5 h-5" />
      {label}
    </Link>
  );
}
```

- [ ] **Step 3 : Mettre à jour `app/[locale]/layout.tsx`**

- Import : `import StickyWhatsApp from "@/components/layout/StickyWhatsApp";` → `import StickyBooking from "@/components/layout/StickyBooking";`
- Balise : `<StickyWhatsApp />` → `<StickyBooking />`
- Ne PAS toucher `<main className="pb-sticky-wa lg:pb-0">`.

- [ ] **Step 4 : Vérifier qu'aucun autre fichier n'importe l'ancien nom**

Run: `cd /Users/Mouj/Desktop/salon-mimi && grep -rn "StickyWhatsApp" --include="*.ts" --include="*.tsx" .`
Expected: **aucun résultat**. Si un résultat apparaît, le corriger.

- [ ] **Step 5 : Vérifier TypeScript**

Run: `cd /Users/Mouj/Desktop/salon-mimi && npx tsc --noEmit`
Expected: zéro erreur.

- [ ] **Step 6 : Vérifier en local**

```bash
cd /Users/Mouj/Desktop/salon-mimi
# dev server déjà lancé ; sinon relancer
curl -s http://localhost:3100/fr | grep -oE 'href="/fr/reservation"[^>]*aria-label="Réserver un rendez-vous"' | head -1
curl -s http://localhost:3100/fr | grep -c "h-sticky-wa"
curl -s http://localhost:3100/en | grep -c "Book an appointment"
```

Expected : le lien sticky pointe vers `/fr/reservation` avec le bon `aria-label` ; `h-sticky-wa` présent ; libellé EN présent sur `/en`.

Ouvrir `http://localhost:3100/fr` en viewport mobile → bandeau vert en bas « Réserver un rendez-vous », clic → navigation vers `/fr/reservation` (pas d'ouverture WhatsApp).

- [ ] **Step 7 : Commit**

```bash
cd /Users/Mouj/Desktop/salon-mimi
git add components/layout/StickyBooking.tsx app/\[locale\]/layout.tsx
git commit -m "feat(sticky): StickyBooking — mène vers /reservation au lieu de WhatsApp direct

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 4 : Adapter les tests Playwright

**Files:**

- Modify: `e2e/site.spec.ts`

Le `test.describe("Tunnel de réservation (CRO)")` actuel a 5 tests écrits pour la v1 (formulaire visible au chargement, sticky pointant vers `wa.me`). Les remplacer par la version v2.

- [ ] **Step 1 : Remplacer tout le bloc `test.describe("Tunnel de réservation (CRO)")`**

Repérer `test.describe("Tunnel de réservation (CRO)", () => {` jusqu'à son `});` final (fin de fichier). Remplacer par :

```ts
test.describe("Tunnel de réservation (CRO)", () => {
  test("le bouton Réserver par WhatsApp pointe vers wa.me avec un message", async ({
    page,
  }) => {
    await page.goto("/fr/reservation");
    const cta = page
      .getByRole("link", { name: /réserver par whatsapp/i })
      .first();
    await expect(cta).toBeVisible();
    const href = await cta.getAttribute("href");
    expect(href).toMatch(/^https:\/\/wa\.me\/\d+\?text=.+/);
  });

  test("le formulaire est masqué au chargement et visible après clic", async ({
    page,
  }) => {
    await page.goto("/fr/reservation");
    await expect(page.locator("select[name='service']")).toHaveCount(0);
    await page
      .getByRole("button", { name: /réserver par formulaire/i })
      .click();
    await expect(page.locator("select[name='service']")).toBeVisible();
  });

  test("la ligne de prix change quand on change de coiffure", async ({
    page,
  }) => {
    await page.goto("/fr/reservation");
    await page
      .getByRole("button", { name: /réserver par formulaire/i })
      .click();
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
    await page
      .getByRole("button", { name: /réserver par formulaire/i })
      .click();
    await expect(page.locator("input[name='email']")).toHaveCount(0);
    await page.getByRole("button", { name: /ajouter des précisions/i }).click();
    await expect(page.locator("input[name='email']")).toBeVisible();
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
    // `lg:hidden` = `display:none` — l'élément reste dans le DOM en desktop.
    await expect(sticky.first()).toBeHidden();
  });
});
```

- [ ] **Step 2 : Vérifier que les tests parsent**

Run: `cd /Users/Mouj/Desktop/salon-mimi && npx tsc --noEmit && npx playwright test --list -g "CRO"`
Expected: tsc clean ; 6 tests CRO listés par projet.

- [ ] **Step 3 : Lancer les tests CRO en local**

```bash
cd /Users/Mouj/Desktop/salon-mimi
# dev server sur :3100 doit tourner
PLAYWRIGHT_BASE_URL=http://localhost:3100 npx playwright test --project=desktop -g "CRO"
PLAYWRIGHT_BASE_URL=http://localhost:3100 npx playwright test --project=mobile -g "CRO"
```

Expected: tous les tests CRO passent (1 skip par projet — le test gate desktop/mobile).

- [ ] **Step 4 : Lancer la suite complète en local (non-régression)**

```bash
cd /Users/Mouj/Desktop/salon-mimi
PLAYWRIGHT_BASE_URL=http://localhost:3100 npx playwright test --project=desktop
PLAYWRIGHT_BASE_URL=http://localhost:3100 npx playwright test --project=mobile
```

Expected: 100 % vert (11 tests existants + 6 CRO, 1 skip par projet). Si un test existant casse, diagnostiquer avant de continuer.

- [ ] **Step 5 : Commit**

```bash
cd /Users/Mouj/Desktop/salon-mimi
git add e2e/site.spec.ts
git commit -m "test(e2e): tests CRO adaptés au choix explicite v2

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 5 : Vérification finale et livraison

**Files:** aucun (vérification)

- [ ] **Step 1 : TypeScript**

Run: `cd /Users/Mouj/Desktop/salon-mimi && npx tsc --noEmit`
Expected: zéro erreur.

- [ ] **Step 2 : Build de production**

Run: `cd /Users/Mouj/Desktop/salon-mimi && npm run build 2>&1 | grep -iE "compiled|error|fail|generating static"`
Expected: `✓ Compiled successfully`, `✓ Generating static pages`, aucune erreur.

- [ ] **Step 3 : Revue manuelle golden path — 3 langues, mobile + desktop**

Dev server sur `http://localhost:3100` :

- `/fr/reservation` desktop : 2 boutons côte à côte (`sm:flex-row`), réassurance dessous, pas de formulaire. Clic « Réserver par formulaire » → formulaire (panneau blanc gauche) + panneau photo (droite) apparaissent. Bouton submit ocre « Confirmer ma réservation ». Re-clic → repli. Section « Vous ne trouvez pas le salon ? » toujours là.
- `/fr/reservation` mobile : 2 boutons empilés (`flex-col`). Bandeau sticky en bas « Réserver un rendez-vous ». Dépli formulaire OK. Le sticky ne masque pas le bas de page (padding `pb-sticky-wa`).
- `/en/reservation` : « Book via WhatsApp » / « Book via form » / « Confirm my booking ». Sticky `/en` → « Book an appointment ».
- `/es/reservation` : « Reservar por WhatsApp » / « Reservar con formulario » / « Confirmar mi reserva ». Sticky `/es` → « Reservar una cita ».
- Sur `/fr`, `/fr/galerie`, `/fr/contact` mobile : bandeau sticky présent, clic → navigue vers `/{locale}/reservation` (pas d'ouverture WhatsApp).
- Console navigateur : 0 erreur sur les 3 langues.
- Soumission réelle du formulaire (déplié) avec un email de test → écran de confirmation, pas d'erreur dans `/tmp/mimi-dev.log`.

- [ ] **Step 4 : Logs**

Run: `tail -40 /tmp/mimi-dev.log`
Expected: aucune stack trace, aucun 500.

- [ ] **Step 5 : Arrêter le dev server**

```bash
pkill -f "next dev -p 3100"
```

- [ ] **Step 6 : Mettre à jour le handoff**

Dans `handoff.md` : ajouter une section « 19. Session … — Tunnel v2 : choix explicite » décrivant les 2 boutons, le formulaire masqué, le renommage `StickyBooking`, le sticky qui pointe vers `/reservation`. Retirer les points obsolètes de la section 18 (« Revue visuelle mobile… 3 CTA WhatsApp » — remplacé). Commit.

```bash
cd /Users/Mouj/Desktop/salon-mimi
git add handoff.md
git commit -m "docs: handoff — tunnel de réservation v2 (choix explicite)

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

- [ ] **Step 7 : Push**

```bash
cd /Users/Mouj/Desktop/salon-mimi
git push origin main
```

Railway déploie automatiquement.

- [ ] **Step 8 : Vérification post-déploiement (~3 min après le push)**

```bash
curl -sI https://mimi-coiffure.com/fr/reservation | head -1
curl -s https://mimi-coiffure.com/fr/reservation | grep -oE "(Réserver par WhatsApp|Réserver par formulaire)" | sort -u
curl -s https://mimi-coiffure.com/fr/reservation | grep -c "name=\"service\""   # doit être 0 (formulaire masqué SSR)
curl -s https://mimi-coiffure.com/fr | grep -oE 'href="/fr/reservation"[^>]*Réserver un rendez-vous' | head -1
```

Expected : HTTP 200 ; 2 libellés présents ; `name="service"` → 0 ; sticky pointe vers `/fr/reservation`.

- [ ] **Step 9 : Playwright contre la prod**

```bash
cd /Users/Mouj/Desktop/salon-mimi
npx playwright test --project=desktop
npx playwright test --project=mobile
```

Expected: 100 % vert contre `https://mimi-coiffure.com` (1 skip par projet).

---

## Self-Review (auteur du plan)

**1. Couverture de la spec :**

- § 2 décisions (2 boutons, hiérarchie vert/contour, `showForm` masqué, boutons restent visibles, submit ocre, pas d'email WhatsApp, photo dans `{showForm}`, sticky → /reservation, renommage) → Task 2 (boutons + showForm + submit + photo) + Task 3 (sticky). ✅
- § 3 structure page → Task 2 Steps 2-4. Section « lost salon » hors `{showForm}` → Task 2 Step 3 précise « avant `{/* Section... */}` ». ✅
- § 4 StickyBooking → Task 3. `next/link` (comme Header) retenu. ✅
- § 5 i18n (formBtn, submitBtn ajoutées ; whatsappPrimaryHint, orFillForm supprimées ; whatsappPrimaryBtn ré-libellé) → Task 1. ✅
- § 6 tests (6 tests : wa.me, formulaire masqué, prix, optionnels, sticky visible+href, sticky absent) → Task 4. ✅
- § 7 fichiers → tous couverts. Pas de changement `lib/whatsapp.ts` / `route.ts` / `tailwind.config.ts` → respecté. ✅

**2. Placeholders :** aucun. Tout le code fourni en entier.

**3. Cohérence des types :** `showForm` déclaré Task 2 Step 1, utilisé Steps 2-3. `tx.formBtn` / `tx.submitBtn` ajoutés Task 1 aux 3 langues + à l'interface → utilisés Task 2. `StickyBooking` : `git mv` (Task 3 Step 1) puis réécriture (Step 2) puis import mis à jour (Step 3) puis grep de contrôle (Step 4) — chaîne cohérente. Les tests Task 4 ciblent `getByRole("button", { name: /réserver par formulaire/i })` — correspond au libellé fr de `formBtn` (Task 1 Step 2). Le test sticky filtre sur `/rendez-vous|reservation|réserver/i` — couvre le libellé fr « Réserver un rendez-vous » (Task 3 Step 2).

**Note :** Task 1 laisse volontairement `tsc` en erreur (JSX encore v1) ; Task 2 le résout ; commit unique pour les deux (Task 2 Step 7). C'est explicite dans les deux tâches.
