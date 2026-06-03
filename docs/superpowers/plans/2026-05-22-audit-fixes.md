# Audit Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corriger tous les problèmes identifiés lors de l'audit technique (accessibilité, responsive, theming, URL) puis lancer les tests de non-régression Playwright avant déploiement Railway.

**Architecture:** Corrections ciblées fichier par fichier, sans refactoring architectural. Les fixes sont indépendants et peuvent être commités séparément. Les tests Playwright existants (`e2e/site.spec.ts`) servent de filet de non-régression.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, Playwright (tests e2e)

**Repo local:** `/Users/Mouj/Desktop/salon-mimi`

---

### Task 1: Corriger l'incohérence d'URL (P0)

Le projet utilise deux domaines différents : `salonmimi-marrakech.com` dans `BASE_URL`, `metadata`, `sitemap.ts`, `robots.ts` — et `mimi-coiffure.com` dans le JSON-LD et la FAQ. D'après le handoff, `mimi-coiffure.com` est le domaine actif en production.

**Files:**
- Modify: `app/[locale]/layout.tsx` — corriger `BASE_URL` ligne 30
- Modify: `app/sitemap.ts` — corriger `BASE_URL`
- Modify: `app/robots.ts` — corriger l'URL du sitemap

- [ ] **Step 1: Vérifier le domaine actuel en production**

```bash
cd /Users/Mouj/Desktop/salon-mimi
grep -rn "salonmimi-marrakech\|mimi-coiffure" app/ --include="*.ts" --include="*.tsx"
```

Expected output : voir toutes les occurrences des deux domaines.

- [ ] **Step 2: Corriger `app/[locale]/layout.tsx`**

Changer la ligne 30 :
```typescript
// AVANT
const BASE_URL = "https://salonmimi-marrakech.com";

// APRÈS
const BASE_URL = "https://mimi-coiffure.com";
```

Le JSON-LD ligne 85 est déjà correct (`"https://mimi-coiffure.com"`), ne pas y toucher.

- [ ] **Step 3: Corriger `app/sitemap.ts`**

```typescript
// AVANT
const BASE_URL = "https://salonmimi-marrakech.com";

// APRÈS
const BASE_URL = "https://mimi-coiffure.com";
```

- [ ] **Step 4: Corriger `app/robots.ts`**

```typescript
// AVANT
sitemap: "https://salonmimi-marrakech.com/sitemap.xml",

// APRÈS
sitemap: "https://mimi-coiffure.com/sitemap.xml",
```

- [ ] **Step 5: Vérifier qu'il ne reste aucune occurrence de l'ancien domaine**

```bash
grep -rn "salonmimi-marrakech" app/ --include="*.ts" --include="*.tsx"
```

Expected : aucun résultat.

- [ ] **Step 6: Build check TypeScript**

```bash
cd /Users/Mouj/Desktop/salon-mimi
npx tsc --noEmit
```

Expected : aucune erreur.

- [ ] **Step 7: Commit**

```bash
git add app/[locale]/layout.tsx app/sitemap.ts app/robots.ts
git commit -m "fix: unifier domaine sur mimi-coiffure.com (layout, sitemap, robots)"
```

---

### Task 2: Focus-visible sur tous les inputs (P1 Accessibilité)

Tous les inputs du formulaire de réservation et du settings admin utilisent `outline-none` sans indicateur de focus de remplacement suffisant. `focus:border-ocre` change la couleur de la border mais depuis `border-white/12` (quasi invisible) — le changement est trop subtil pour la navigation clavier.

**Files:**
- Modify: `app/globals.css` — ajouter une règle globale focus-visible
- Modify: `components/sections/ReservationLayout.tsx` — retirer `outline-none` des inputs
- Modify: `components/admin/SettingsForm.tsx` — retirer `outline-none` de l'input ligne 139

- [ ] **Step 1: Ajouter règle globale dans `globals.css`**

Ajouter dans `@layer base` après le body :

```css
@layer base {
  body {
    @apply bg-nuit text-white font-inter;
  }

  /* Focus visible accessible sur tous les inputs/selects/textareas */
  input:focus-visible,
  select:focus-visible,
  textarea:focus-visible,
  button:focus-visible {
    @apply outline-none ring-2 ring-ocre ring-offset-1 ring-offset-nuit;
  }
}
```

- [ ] **Step 2: Retirer `outline-none` des inputs dans `ReservationLayout.tsx`**

Dans le fichier `components/sections/ReservationLayout.tsx`, remplacer `outline-none` par `focus-visible:outline-none` sur tous les inputs/selects/textarea. La règle globale CSS prend le relais.

Chercher toutes les occurrences :
```bash
grep -n "outline-none" components/sections/ReservationLayout.tsx
```

Pour chaque occurrence, remplacer `outline-none` → `focus-visible:outline-none` dans la className.

Exemple :
```tsx
// AVANT
className="border border-white/12 focus:border-ocre rounded-xl text-white text-[13px] px-4 py-2.5 outline-none transition-colors font-inter"

// APRÈS
className="border border-white/12 focus:border-ocre rounded-xl text-white text-[13px] px-4 py-2.5 focus-visible:outline-none transition-colors font-inter"
```

- [ ] **Step 3: Corriger l'input sans focus dans `SettingsForm.tsx`**

```bash
grep -n "outline-none" components/admin/SettingsForm.tsx
```

Ligne 139 — ajouter `focus-visible:ring-2 focus-visible:ring-ocre focus-visible:ring-offset-1 focus-visible:ring-offset-white` :

```tsx
// AVANT
className="flex-1 px-4 py-2.5 text-sm text-gray-900 outline-none"

// APRÈS
className="flex-1 px-4 py-2.5 text-sm text-gray-900 outline-none focus-visible:ring-2 focus-visible:ring-ocre focus-visible:ring-offset-1"
```

- [ ] **Step 4: Build check TypeScript**

```bash
cd /Users/Mouj/Desktop/salon-mimi
npx tsc --noEmit
```

Expected : aucune erreur.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css components/sections/ReservationLayout.tsx components/admin/SettingsForm.tsx
git commit -m "fix(a11y): focus-visible accessible sur tous les inputs et selects"
```

---

### Task 3: Corriger le responsive de la page réservation (P1)

`h-screen overflow-hidden` sur le container principal de `ReservationLayout.tsx` tronque le formulaire sur mobile quand le clavier virtuel est ouvert. Le bouton submit et le champ message deviennent inaccessibles.

**Files:**
- Modify: `components/sections/ReservationLayout.tsx`

- [ ] **Step 1: Identifier le container problématique**

```bash
grep -n "h-screen\|overflow-hidden" components/sections/ReservationLayout.tsx
```

Expected : ligne ~184 — `<div className="h-screen flex flex-col bg-nuit overflow-hidden">`

- [ ] **Step 2: Corriger le container principal**

```tsx
// AVANT
<div className="h-screen flex flex-col bg-nuit overflow-hidden">

// APRÈS
<div className="min-h-screen flex flex-col bg-nuit">
```

- [ ] **Step 3: Limiter overflow-hidden à la colonne photo droite uniquement**

La colonne photo droite a besoin de `overflow-hidden` pour masquer les images qui débordent. Vérifier qu'elle l'a :

```bash
grep -n "hidden md:block flex-1" components/sections/ReservationLayout.tsx
```

Si la div de la colonne photo (celle avec les `<Image>`) n'a pas `overflow-hidden`, l'ajouter uniquement sur elle. Elle doit ressembler à :
```tsx
<div className="hidden md:block flex-1 bg-panneau rounded-2xl border border-ocre/20 overflow-hidden relative">
```

Si `overflow-hidden` est déjà là, ne rien changer.

- [ ] **Step 4: Build check TypeScript**

```bash
cd /Users/Mouj/Desktop/salon-mimi
npx tsc --noEmit
```

Expected : aucune erreur.

- [ ] **Step 5: Commit**

```bash
git add components/sections/ReservationLayout.tsx
git commit -m "fix(responsive): remplacer h-screen overflow-hidden par min-h-screen sur la réservation"
```

---

### Task 4: Touch target hamburger (P1 Accessibilité)

Le bouton hamburger dans le Header a un padding `p-2` (8px), donnant une surface tactile d'environ 28×28px — sous le minimum WCAG 2.5.5 de 44×44px.

**Files:**
- Modify: `components/layout/Header.tsx`

- [ ] **Step 1: Localiser le bouton hamburger**

```bash
grep -n "hamburger\|md:hidden flex flex-col" components/layout/Header.tsx
```

Expected : trouver `className="md:hidden flex flex-col gap-1.5 p-2"`

- [ ] **Step 2: Agrandir le touch target**

```tsx
// AVANT
className="md:hidden flex flex-col gap-1.5 p-2"

// APRÈS
className="md:hidden flex flex-col gap-1.5 p-3 min-h-[44px] min-w-[44px] items-center justify-center"
```

- [ ] **Step 3: Build check**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add components/layout/Header.tsx
git commit -m "fix(a11y): touch target hamburger >= 44x44px (WCAG 2.5.5)"
```

---

### Task 5: Contraste des textes trop pâles (P1 Accessibilité)

Plusieurs textes utilisent `text-white/30`, `text-white/35`, `text-white/40` sur fond `#1A0D05` — ratio ~2.5:1, sous le minimum WCAG AA de 4.5:1.

**Files:**
- Modify: `components/sections/ReservationLayout.tsx`
- Modify: `components/sections/PackageSignature.tsx`
- Modify: `components/sections/ServicesPageClient.tsx`
- Modify: `components/sections/ServicesLookbook.tsx`

- [ ] **Step 1: Lister toutes les occurrences**

```bash
grep -rn "text-white/[123][0-9]\b\|text-white/[123]\b" components/ --include="*.tsx"
```

- [ ] **Step 2: Corriger dans `ReservationLayout.tsx`**

```tsx
// Ligne ~202 — texte "Tous les champs * sont obligatoires"
// AVANT: text-white/35
// APRÈS: text-white/55

// Ligne ~333 — texte "Confirmation par WhatsApp sous 24h"
// AVANT: text-white/30
// APRÈS: text-white/50
```

Les `placeholder:text-white/25` et `border-white/12` restent inchangés — ce sont des éléments décoratifs, pas du texte informatif.

- [ ] **Step 3: Corriger dans `PackageSignature.tsx`**

```tsx
// Ligne ~40 — durée du package
// AVANT: text-white/40
// APRÈS: text-white/55
```

- [ ] **Step 4: Corriger dans `ServicesPageClient.tsx`**

```tsx
// Ligne ~150 — sous-titre section
// AVANT: text-white/45
// APRÈS: text-white/60

// Ligne ~170 — label catégorie
// AVANT: text-white/35
// APRÈS: text-white/55
```

- [ ] **Step 5: Corriger dans `ServicesLookbook.tsx`**

```bash
grep -n "text-white/40\|text-white/35\|text-white/30" components/sections/ServicesLookbook.tsx
```

Pour chaque occurrence sous `/45`, monter à `/55` minimum.

- [ ] **Step 6: Build check**

```bash
npx tsc --noEmit
```

- [ ] **Step 7: Commit**

```bash
git add components/sections/ReservationLayout.tsx components/sections/PackageSignature.tsx components/sections/ServicesPageClient.tsx components/sections/ServicesLookbook.tsx
git commit -m "fix(a11y): contraste textes white/30-40 -> white/50-60 (WCAG AA)"
```

---

### Task 6: ServiceCard — sortir du bg-white (P2 Theming)

`ServiceCard` utilise `bg-white`, `text-gray-500`, `text-gray-400` — esthétique SaaS générique qui détone dans le projet dark. À remplacer par les tokens du projet.

**Files:**
- Modify: `components/ui/ServiceCard.tsx`

- [ ] **Step 1: Voir le fichier actuel**

```bash
cat components/ui/ServiceCard.tsx
```

- [ ] **Step 2: Remplacer les classes**

```tsx
// AVANT
<div className="bg-white rounded-2xl p-6 border border-or/20 shadow-sm hover:shadow-md transition-shadow">
  <h3 className="font-playfair text-lg text-brun mb-2">{name}</h3>
  {duration !== "—" && (
    <p className="text-sm text-gray-500 mb-4">{duration}</p>
  )}
  <div className="flex items-baseline gap-2 mb-4">
    <span className="text-2xl font-bold text-vert">{priceMad} MAD</span>
    <span className="text-sm text-gray-400">~{priceEur}€</span>
  </div>

// APRÈS
<div className="bg-panneau rounded-2xl p-6 border border-ocre/20 hover:border-ocre/40 transition-colors">
  <h3 className="font-playfair text-lg text-white mb-2">{name}</h3>
  {duration !== "—" && (
    <p className="text-sm text-white/55 mb-4">{duration}</p>
  )}
  <div className="flex items-baseline gap-2 mb-4">
    <span className="text-2xl font-bold text-ocre">{priceMad} MAD</span>
    <span className="text-sm text-white/50">~{priceEur}€</span>
  </div>
```

Le bouton CTA reste `bg-ocre text-white` — ne pas changer.

- [ ] **Step 3: Build check**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add components/ui/ServiceCard.tsx
git commit -m "fix(theming): ServiceCard bg-panneau au lieu de bg-white — cohérence dark theme"
```

---

### Task 7: Token Tailwind pour WhatsApp + nettoyage couleurs hardcodées (P2)

`#25D366` et `#1ebe5d`/`#128C7E` apparaissent dans 3 fichiers. `#2d1005` (options select) apparaît dans `ReservationLayout.tsx`. Les ajouter dans `tailwind.config.ts`.

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `components/sections/ReservationLayout.tsx`
- Modify: `components/ui/WhatsAppButton.tsx`
- Modify: `components/admin/ReservationsTable.tsx`

- [ ] **Step 1: Ajouter les tokens dans `tailwind.config.ts`**

```typescript
colors: {
  ocre: "#C17B3F",
  vert: "#1F7A4E",
  or: "#D4A843",
  fond: "#F6EFE3",
  nuit: "#1A0D05",
  brun: "#2C1508",
  panneau: "#3D1A06",
  // Nouveaux tokens
  whatsapp: "#25D366",
  "whatsapp-hover": "#1ebe5d",
  "select-bg": "#2d1005",
},
```

- [ ] **Step 2: Remplacer dans `WhatsAppButton.tsx`**

```bash
grep -n "#25D366\|#128C7E" components/ui/WhatsAppButton.tsx
```

```tsx
// AVANT
className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white px-5 py-3 rounded-full shadow-lg flex items-center gap-2 hover:bg-[#128C7E] transition-colors font-medium"

// APRÈS
className="fixed bottom-6 right-6 z-50 bg-whatsapp text-white px-5 py-3 rounded-full shadow-lg flex items-center gap-2 hover:bg-whatsapp-hover transition-colors font-medium"
```

- [ ] **Step 3: Remplacer dans `ReservationLayout.tsx`**

```bash
grep -n "#25D366\|#1ebe5d\|#2d1005" components/sections/ReservationLayout.tsx
```

Pour le bouton WhatsApp de confirmation (ligne ~172) :
```tsx
// AVANT
className="inline-block bg-[#25D366] hover:bg-[#1ebe5d] ..."

// APRÈS
className="inline-block bg-whatsapp hover:bg-whatsapp-hover ..."
```

Pour les options `<option style={{ background: "#2d1005" }}>` : remplacer par `style={{ background: "rgb(45,16,5)" }}` — Tailwind ne peut pas être utilisé dans les styles inline d'option, donc garder le style inline mais utiliser la valeur RGB explicite. Ou simplement les laisser (`#2d1005` est très proche de `brun` — acceptable comme exception pour les `<option>` dont le style inline est une nécessité de compatibilité navigateur).

- [ ] **Step 4: Remplacer dans `ReservationsTable.tsx`**

```bash
grep -n "#25D366\|#128C7E" components/admin/ReservationsTable.tsx
```

```tsx
// AVANT
className="bg-[#25D366] text-white text-xs px-3 py-1 rounded-lg hover:bg-[#128C7E] transition-colors"

// APRÈS
className="bg-whatsapp text-white text-xs px-3 py-1 rounded-lg hover:bg-whatsapp-hover transition-colors"
```

- [ ] **Step 5: Build check**

```bash
npx tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
git add tailwind.config.ts components/ui/WhatsAppButton.tsx components/sections/ReservationLayout.tsx components/admin/ReservationsTable.tsx
git commit -m "fix(theming): tokens Tailwind whatsapp + select-bg, supprimer couleurs hardcodées"
```

---

### Task 8: Tests de non-régression Playwright + déploiement Railway

Lancer la batterie de tests Playwright existante (`e2e/site.spec.ts`) contre `https://mimi-coiffure.com` (prod) pour vérifier la non-régression. En cas d'échec, diagnostiquer avant de pousser.

**Files:**
- Read: `e2e/site.spec.ts` — comprendre les 11 tests existants
- Read: `playwright.config.ts` — comprendre la config (baseURL, projets desktop/mobile)

- [ ] **Step 1: Lire la config Playwright**

```bash
cat /Users/Mouj/Desktop/salon-mimi/playwright.config.ts
cat /Users/Mouj/Desktop/salon-mimi/e2e/site.spec.ts
```

- [ ] **Step 2: Vérifier que les dépendances sont installées**

```bash
cd /Users/Mouj/Desktop/salon-mimi
npx playwright install chromium --with-deps 2>/dev/null || npx playwright install chromium
```

- [ ] **Step 3: Build Next.js local pour vérification rapide**

```bash
cd /Users/Mouj/Desktop/salon-mimi
npx tsc --noEmit
```

Expected : 0 erreurs TypeScript.

- [ ] **Step 4: Lancer les tests Playwright contre la prod**

```bash
cd /Users/Mouj/Desktop/salon-mimi
npx playwright test --project=desktop 2>&1
```

Expected : tous les tests passent. Si des tests échouent, lire le rapport et corriger avant de continuer.

- [ ] **Step 5: Lancer les tests mobile**

```bash
npx playwright test --project=mobile 2>&1
```

Expected : tous les tests passent.

- [ ] **Step 6: Si tous les tests passent — push vers Railway**

```bash
cd /Users/Mouj/Desktop/salon-mimi
git push origin main
```

Railway détecte le push et déclenche un déploiement automatique.

- [ ] **Step 7: Vérifier le déploiement**

Attendre ~2 minutes, puis vérifier que `https://mimi-coiffure.com` répond correctement :

```bash
curl -I https://mimi-coiffure.com 2>&1 | head -5
```

Expected : `HTTP/2 200` ou `HTTP/1.1 200 OK`.

- [ ] **Step 8: Rapport final**

Lister tous les commits poussés :

```bash
git log --oneline origin/main~8..origin/main
```

Rapporter : nb de commits, tests passés (desktop + mobile), URL de production confirmée.
