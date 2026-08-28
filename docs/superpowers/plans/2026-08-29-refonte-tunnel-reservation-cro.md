# Refonte du tunnel de réservation (CRO) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Faire du CTA WhatsApp l'action principale du tunnel de réservation, raccourcir le formulaire à 4 champs visibles, afficher le prix dès le choix de la coiffure, et ajouter un bandeau WhatsApp sticky sur mobile pour toutes les pages.

**Architecture:** Refonte de `ReservationLayout.tsx` (composant existant) : ajout d'un bloc CTA WhatsApp direct au-dessus du formulaire, repli des 4 champs non essentiels (heure, personnes, email, message) sous un lien, ligne de prix dynamique sous le `<select>`. Nouveau composant `StickyWhatsApp.tsx` monté dans le layout `[locale]`, visible en mobile uniquement. Le numéro WhatsApp et le générateur de lien générique sont centralisés dans `lib/social.ts` et `lib/whatsapp.ts`. Aucune modification serveur (`app/api/reservations/route.ts` accepte déjà email/heure/personnes vides).

**Tech Stack:** Next.js 14 App Router, React client components, next-intl, Tailwind (couleurs `whatsapp` / `whatsapp-hover` déjà définies), Playwright (config e2e pointe sur la prod — voir Task 6).

---

## Contexte pour l'implémenteur (à lire avant de commencer)

- **Repo :** `/Users/Mouj/Desktop/salon-mimi`. Déploiement auto Railway sur push `main`.
- **Spec source :** `docs/superpowers/specs/2026-08-29-refonte-tunnel-reservation-cro-design.md`.
- **Handoff projet :** `handoff.md` — lire les sections « Pièges à ne pas reproduire » et « Checklist obligatoire avant tout déploiement ».
- **Pièges connus (handoff) :**
  - Jamais de `window.open()` après un `await fetch()` — le navigateur bloque la popup. Utiliser `<a href>` ou `window.location.href`.
  - Toujours `text-nuit` (ou couleur explicite) sur les champs de formulaire, jamais de couleur héritée sur fond clair.
  - Ne pas toucher aux politiques RLS Supabase.
- **`preview_start` est cassé sur ce Mac** (`EPERM uv_cwd`). Pour tester en local : `nohup node node_modules/.bin/next dev -p 3100 &` puis naviguer sur `http://localhost:3100`.
- **Couleurs Tailwind utiles :** `whatsapp` (#25D366), `whatsapp-hover` (#1ebe5d), `ocre` (#C17B3F), `fond` (#F6EFE3), `nuit` (#1A0D05), `or`.
- **Fichier principal à modifier :** `components/sections/ReservationLayout.tsx` (546 lignes). Structure actuelle :
  - `SERVICES` : tableau de 10 coiffures `{ id, label, subServices, price, image, imageAlt }`.
  - `TEXTS` : objet `Record<locale, {...}>` avec toutes les chaînes FR/EN/ES.
  - `Props` : `{ labels, prices: Record<string,string>, locale: string }`.
  - `prices` est indexé par `id` de coiffure (ex : `prices["box-braids"]`), valeurs sans « MAD » (ex : `"200"`), venant de `/admin/settings`.
  - `activeIndex` (state) : index de la coiffure sélectionnée dans `SERVICES`.
  - `handleSubmit` : construit `data`, `POST /api/reservations`, `if (!res.ok) throw`, lit `json.whatsappLink`, fait `window.location.href = json.whatsappLink`, `setSubmitted(true)`.
  - `submitted` (state) → écran de confirmation avec bouton fallback WhatsApp.
  - Panneau photo droite : `hidden md:block`, affiche l'image + `subServices` + `prices[s.id] ?? s.price` de la coiffure active.
  - Section « Vous ne trouvez pas le salon ? » en bas.

---

## File Structure

| Fichier                                     | Rôle                                              | Action                                                                                                             |
| ------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `lib/social.ts`                             | Constantes des profils externes + numéro WhatsApp | Modifier : ajouter `WHATSAPP_NUMBER`                                                                               |
| `lib/whatsapp.ts`                           | Génération des liens `wa.me`                      | Modifier : ajouter `genericWhatsAppLink(locale)`                                                                   |
| `components/sections/ReservationLayout.tsx` | Page de réservation (CTA + formulaire)            | Modifier : bloc CTA principal, formulaire court, prix dynamique, repli optionnel, bouton vert, nouvelles clés i18n |
| `components/layout/StickyWhatsApp.tsx`      | Bandeau WhatsApp sticky mobile                    | Créer                                                                                                              |
| `app/[locale]/layout.tsx`                   | Layout des pages publiques                        | Modifier : monter `<StickyWhatsApp />`, padding-bottom mobile sur `<main>`                                         |
| `e2e/site.spec.ts`                          | Tests Playwright                                  | Modifier : 4 nouveaux tests                                                                                        |

---

## Task 1 : Centraliser le numéro WhatsApp et le lien générique

**Files:**

- Modify: `lib/social.ts`
- Modify: `lib/whatsapp.ts`

- [ ] **Step 1 : Ajouter la constante `WHATSAPP_NUMBER` dans `lib/social.ts`**

Ajouter cette ligne à la fin du fichier (après `GOOGLE_REVIEW_URL`) :

```ts
// Numéro WhatsApp du salon, format international sans "+" (utilisable dans une URL wa.me).
export const WHATSAPP_NUMBER = "212710388204";
```

- [ ] **Step 2 : Ajouter `genericWhatsAppLink` dans `lib/whatsapp.ts`**

Le fichier actuel exporte `ReservationData` et `generateWhatsAppLink`. Ajouter en haut l'import, et en bas la nouvelle fonction. Fichier complet attendu :

```ts
// lib/whatsapp.ts
import { WHATSAPP_NUMBER } from "@/lib/social";

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
): string {
  const number =
    whatsappNumber ??
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ??
    WHATSAPP_NUMBER;
  const text = [
    `Bonjour Mimi, je souhaite réserver une prestation.`,
    `Nom : ${data.nom}`,
    `Service : ${data.service}`,
    data.dateSouhaitee ? `Date souhaitée : ${data.dateSouhaitee}` : null,
    data.message ? `Message : ${data.message}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

const GENERIC_MESSAGES: Record<string, string> = {
  fr: "Bonjour Mimi, je voudrais réserver une coiffure.",
  en: "Hello Mimi, I'd like to book an appointment.",
  es: "Hola Mimi, quería reservar una cita.",
};

// Lien wa.me avec un message d'ouverture générique (pas de données de formulaire).
// Utilisé par le CTA WhatsApp direct et le bandeau sticky.
export function genericWhatsAppLink(locale: string): string {
  const msg = GENERIC_MESSAGES[locale] ?? GENERIC_MESSAGES.fr;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}
```

Note : le remplacement du littéral `"212710388204"` par `WHATSAPP_NUMBER` dans `generateWhatsAppLink` est volontaire (source unique). Comportement identique.

- [ ] **Step 3 : Vérifier la compilation TypeScript**

Run: `cd /Users/Mouj/Desktop/salon-mimi && npx tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 4 : Commit**

```bash
cd /Users/Mouj/Desktop/salon-mimi
git add lib/social.ts lib/whatsapp.ts
git commit -m "feat(whatsapp): centralise le numéro + lien générique multilingue

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 2 : Composant `StickyWhatsApp` (bandeau mobile)

**Files:**

- Create: `components/layout/StickyWhatsApp.tsx`

- [ ] **Step 1 : Créer le composant**

Créer `components/layout/StickyWhatsApp.tsx` avec ce contenu exact :

```tsx
"use client";

import { useLocale } from "next-intl";
import { genericWhatsAppLink } from "@/lib/whatsapp";

const LABELS: Record<string, string> = {
  fr: "Réserver sur WhatsApp",
  en: "Book on WhatsApp",
  es: "Reservar por WhatsApp",
};

// Bandeau fixe en bas d'écran, visible en mobile uniquement (< lg).
// Monté dans le layout [locale] → présent sur toutes les pages publiques.
export default function StickyWhatsApp() {
  const locale = useLocale();
  const label = LABELS[locale] ?? LABELS.fr;

  return (
    <a
      href={genericWhatsAppLink(locale)}
      target="_blank"
      rel="noopener noreferrer"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 h-[52px] flex items-center justify-center gap-2 bg-whatsapp hover:bg-whatsapp-hover text-white text-sm font-inter font-medium transition-colors"
      aria-label={label}
    >
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35zM12.05 21.5h-.01a9.4 9.4 0 0 1-4.79-1.31l-.34-.2-3.56.93.95-3.47-.22-.36a9.42 9.42 0 1 1 8.31 4.4l-.35-.02zM12.05 2a11.32 11.32 0 0 0-9.8 17.04L1 23l4.06-1.07A11.32 11.32 0 1 0 12.05 2z" />
      </svg>
      {label}
    </a>
  );
}
```

- [ ] **Step 2 : Vérifier la compilation TypeScript**

Run: `cd /Users/Mouj/Desktop/salon-mimi && npx tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 3 : Commit**

```bash
cd /Users/Mouj/Desktop/salon-mimi
git add components/layout/StickyWhatsApp.tsx
git commit -m "feat(cta): composant StickyWhatsApp (bandeau mobile)

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 3 : Monter `StickyWhatsApp` dans le layout + compenser le contenu masqué

**Files:**

- Modify: `app/[locale]/layout.tsx:209-214`

- [ ] **Step 1 : Importer et monter le composant, ajouter le padding-bottom mobile**

Dans `app/[locale]/layout.tsx` :

1. Ajouter l'import à côté des autres imports de composants (près de la ligne 8) :

```tsx
import StickyWhatsApp from "@/components/layout/StickyWhatsApp";
```

2. Remplacer le bloc `<body>` (lignes ~209-216) par :

```tsx
<body>
  <NextIntlClientProvider messages={messages}>
    <Header />
    <main className="pb-[52px] lg:pb-0">{children}</main>
    <Footer />
    <CookieBanner locale={locale} />
    <StickyWhatsApp />
  </NextIntlClientProvider>
</body>
```

Le `pb-[52px] lg:pb-0` garantit que le bandeau (52px, mobile only) ne masque jamais le bas du footer.

- [ ] **Step 2 : Vérifier la compilation TypeScript**

Run: `cd /Users/Mouj/Desktop/salon-mimi && npx tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 3 : Vérifier visuellement en local**

```bash
cd /Users/Mouj/Desktop/salon-mimi
nohup node node_modules/.bin/next dev -p 3100 > /tmp/mimi-dev.log 2>&1 &
sleep 8
curl -s http://localhost:3100/fr | grep -c "Réserver sur WhatsApp"
```

Expected: au moins `1` (le bandeau est dans le HTML). Ouvrir `http://localhost:3100/fr` dans un navigateur en viewport mobile → le bandeau vert est fixé en bas. En desktop → absent. Vérifier que le footer n'est pas coupé sur mobile.

- [ ] **Step 4 : Commit**

```bash
cd /Users/Mouj/Desktop/salon-mimi
git add app/\[locale\]/layout.tsx
git commit -m "feat(cta): monte StickyWhatsApp dans le layout + padding bas mobile

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 4 : Bloc CTA WhatsApp principal + nouvelles clés i18n dans `ReservationLayout`

**Files:**

- Modify: `components/sections/ReservationLayout.tsx`

Cette tâche ajoute le bloc CTA vert au-dessus du formulaire et toutes les nouvelles chaînes i18n. Le formulaire lui-même est modifié en Task 5.

- [ ] **Step 1 : Ajouter les imports**

En haut de `components/sections/ReservationLayout.tsx`, après les imports existants (`useSearchParams`, `useState`, `Image`) :

```tsx
import { genericWhatsAppLink } from "@/lib/whatsapp";
```

- [ ] **Step 2 : Étendre le type de `TEXTS` et ajouter les clés FR/EN/ES**

Dans la définition du type `TEXTS` (le `Record<string, {...}>`), ajouter ces champs à l'interface :

```tsx
whatsappPrimaryBtn: string;
whatsappPrimaryHint: string;
orFillForm: string;
reassurance: string;
priceIndicative: string;
addDetails: string;
noOnlinePayment: string;
```

Puis dans chaque bloc de langue, ajouter les valeurs.

`fr` :

```tsx
    whatsappPrimaryBtn: "Réserver sur WhatsApp",
    whatsappPrimaryHint: "Le plus rapide — écris directement à Mimi",
    orFillForm: "ou remplis ce formulaire rapide",
    reassurance:
      "Réponse rapide par WhatsApp · Annulation gratuite · Paiement sur place",
    priceIndicative: "tarif indicatif, confirmé au salon",
    addDetails: "+ Ajouter des précisions",
    noOnlinePayment: "Aucun paiement en ligne",
```

`en` :

```tsx
    whatsappPrimaryBtn: "Book on WhatsApp",
    whatsappPrimaryHint: "Fastest way — message Mimi directly",
    orFillForm: "or fill in this quick form",
    reassurance:
      "Quick reply on WhatsApp · Free cancellation · Pay at the salon",
    priceIndicative: "indicative price, confirmed at the salon",
    addDetails: "+ Add details",
    noOnlinePayment: "No online payment",
```

`es` :

```tsx
    whatsappPrimaryBtn: "Reservar por WhatsApp",
    whatsappPrimaryHint: "Lo más rápido — escribe directamente a Mimi",
    orFillForm: "o rellena este formulario rápido",
    reassurance:
      "Respuesta rápida por WhatsApp · Cancelación gratuita · Pago en el salón",
    priceIndicative: "precio orientativo, confirmado en el salón",
    addDetails: "+ Añadir detalles",
    noOnlinePayment: "Sin pago online",
```

- [ ] **Step 3 : Insérer le bloc CTA principal entre l'en-tête et la grille formulaire**

Dans le JSX retourné (branche « not submitted »), repérer la fin du `<div>` d'en-tête (celui qui contient le `<h1>` avec `{tx.heading}`) — il se termine autour de la ligne 330, juste avant `<div className="flex flex-col md:flex-row flex-1 min-h-0 gap-4 p-4 pt-3">`.

Insérer ce bloc juste **avant** cette grille :

```tsx
{
  /* CTA WhatsApp principal */
}
<div className="flex-shrink-0 px-5 md:px-12 pt-4 pb-2">
  <a
    href={genericWhatsAppLink(locale)}
    target="_blank"
    rel="noopener noreferrer"
    className="w-full flex items-center justify-center gap-2.5 bg-whatsapp hover:bg-whatsapp-hover text-white font-inter font-semibold text-[15px] py-4 rounded-full transition-colors"
  >
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35zM12.05 21.5h-.01a9.4 9.4 0 0 1-4.79-1.31l-.34-.2-3.56.93.95-3.47-.22-.36a9.42 9.42 0 1 1 8.31 4.4l-.35-.02zM12.05 2a11.32 11.32 0 0 0-9.8 17.04L1 23l4.06-1.07A11.32 11.32 0 1 0 12.05 2z" />
    </svg>
    {tx.whatsappPrimaryBtn}
  </a>
  <p className="text-center text-nuit/50 text-[11px] font-inter mt-2">
    {tx.whatsappPrimaryHint}
  </p>
  <p className="text-center text-nuit/40 text-[10px] font-inter mt-1">
    {tx.reassurance}
  </p>
  <div className="flex items-center gap-3 mt-4 mb-1">
    <div className="h-px bg-ocre/20 flex-1" />
    <span className="text-nuit/40 text-[10px] tracking-[2px] uppercase font-inter">
      {tx.orFillForm}
    </span>
    <div className="h-px bg-ocre/20 flex-1" />
  </div>
</div>;
```

- [ ] **Step 4 : Vérifier la compilation TypeScript**

Run: `cd /Users/Mouj/Desktop/salon-mimi && npx tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 5 : Vérifier visuellement en local**

```bash
cd /Users/Mouj/Desktop/salon-mimi
# dev server déjà lancé en Task 3 ; sinon le relancer
curl -s http://localhost:3100/fr/reservation | grep -c "wa.me"
```

Expected: au moins `1`. Ouvrir `http://localhost:3100/fr/reservation` : le gros bouton vert apparaît sous le titre, avec le hint et la ligne de réassurance, puis le séparateur « ou remplis ce formulaire rapide », puis le formulaire existant. Le lien du bouton pointe vers `https://wa.me/212710388204?text=Bonjour%20Mimi...`.

- [ ] **Step 6 : Commit**

```bash
cd /Users/Mouj/Desktop/salon-mimi
git add components/sections/ReservationLayout.tsx
git commit -m "feat(reservation): bloc CTA WhatsApp principal + clés i18n CRO

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 5 : Formulaire court — prix dynamique, repli des champs optionnels, bouton vert

**Files:**

- Modify: `components/sections/ReservationLayout.tsx`

- [ ] **Step 1 : Ajouter un state pour le repli des champs optionnels**

Dans le composant, à côté des autres `useState` (`activeIndex`, `submitted`, `whatsappLink`, `error`) :

```tsx
const [showDetails, setShowDetails] = useState(false);
```

- [ ] **Step 2 : Ajouter la ligne de prix dynamique sous le `<select>` Service**

Repérer le bloc du `<select name="service">` (autour des lignes 344-361). Juste **après** la fermeture de son `<div className="flex flex-col gap-1.5">` (celui qui contient le label « Service » et le select), insérer :

```tsx
<p className="text-[12px] text-nuit/70 font-inter -mt-1.5">
  {activeSvc.label} — {tx.startingFrom}{" "}
  <span className="text-ocre font-semibold">
    {prices[activeSvc.id] ?? activeSvc.price} MAD
  </span>{" "}
  · {tx.priceIndicative}
</p>
```

`activeSvc` est déjà défini (`const activeSvc = SERVICES[activeIndex];`). `prices` est indexé par `id`.

- [ ] **Step 3 : Envelopper les 4 champs optionnels (email, date/heure, personnes, message) dans le repli**

L'ordre actuel des blocs dans le formulaire est : Service → séparateur → (Nom + Téléphone) → Email → séparateur → (Date + Heure) → Personnes → Message → erreur → bouton → footer.

Nouvelle organisation voulue : Service + prix → séparateur → (Nom + Téléphone) → **Date seule (visible, requise)** → lien « + Ajouter des précisions » → [replié : Heure, Personnes, Email, Message] → erreur → bouton → réassurance.

Concrètement :

**a.** Sortir le champ **Date** de la grille `(Date + Heure)`. Remplacer le bloc `<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">` qui contient Date et Heure par un champ Date seul, pleine largeur :

```tsx
            <div className="h-px bg-ocre/15" />

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] tracking-[1px] uppercase text-nuit/70 font-inter">
                {tx.date} <span className="text-ocre">*</span>
              </label>
              <input
                name="date"
                type="date"
                required
                className="border border-nuit/15 focus:border-ocre rounded-xl text-nuit text-[13px] px-4 py-2.5 focus-visible:outline-none transition-colors font-inter bg-fond"
              />
            </div>
```

**b.** Supprimer le bloc **Email** de sa position actuelle (entre Téléphone et le premier séparateur). Il sera réintroduit dans le repli.

**c.** Après le champ Date, ajouter le lien de repli et le conteneur des champs optionnels :

```tsx
<button
  type="button"
  onClick={() => setShowDetails((v) => !v)}
  className="text-ocre text-[12px] font-inter font-medium self-start hover:underline"
>
  {tx.addDetails}
</button>;

{
  showDetails && (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] tracking-[1px] uppercase text-nuit/70 font-inter">
            {tx.time}
          </label>
          <input
            name="time"
            type="time"
            className="border border-nuit/15 focus:border-ocre rounded-xl text-nuit text-[13px] px-4 py-2.5 focus-visible:outline-none transition-colors font-inter bg-fond"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] tracking-[1px] uppercase text-nuit/70 font-inter">
            {tx.persons}
          </label>
          <select
            name="persons"
            className="border border-nuit/15 focus:border-ocre rounded-xl text-nuit text-[13px] px-4 py-2.5 focus-visible:outline-none transition-colors font-inter appearance-none bg-fond"
          >
            <option>{tx.person1}</option>
            <option>{tx.person2}</option>
            <option>{tx.person3}</option>
            <option>{tx.person4}</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] tracking-[1px] uppercase text-nuit/70 font-inter">
          {tx.email}
        </label>
        <input
          name="email"
          type="email"
          placeholder={tx.emailPlaceholder}
          className="border border-nuit/15 focus:border-ocre rounded-xl text-nuit text-[13px] px-4 py-2.5 focus-visible:outline-none transition-colors font-inter placeholder:text-nuit/30 bg-fond"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] tracking-[1px] uppercase text-nuit/70 font-inter">
          {tx.message}
        </label>
        <textarea
          name="message"
          rows={3}
          placeholder={tx.messagePlaceholder}
          className="border border-nuit/15 focus:border-ocre rounded-xl text-nuit text-[13px] px-4 py-2.5 focus-visible:outline-none transition-colors font-inter placeholder:text-nuit/30 resize-none bg-fond"
        />
      </div>
    </div>
  );
}
```

**d.** Supprimer les anciens blocs autonomes **Personnes** et **Message** (ceux qui étaient hors repli) pour ne pas les avoir en double.

**Important sur `handleSubmit` :** il lit les champs via `form.elements.namedItem("email")`, `"time"`, `"persons"`, `"message"`. Quand le repli est fermé, ces éléments n'existent pas dans le DOM → `form.elements.namedItem(...)` renvoie `null` → `(... as HTMLInputElement).value` lève `TypeError`. Il faut rendre ces lectures sûres.

- [ ] **Step 4 : Sécuriser la lecture des champs optionnels dans `handleSubmit`**

Remplacer la construction de l'objet `data` dans `handleSubmit` par :

```tsx
const form = e.currentTarget;
const getVal = (name: string) => {
  const el = form.elements.namedItem(name) as
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
  return el?.value ?? "";
};
const data = {
  nom: getVal("name"),
  telephone: getVal("phone"),
  email: getVal("email"),
  service: activeSvc.label,
  date_souhaitee: getVal("date"),
  heure_souhaitee: getVal("time"),
  nombre_personnes: getVal("persons"),
  message: getVal("message"),
  locale,
};
```

Le reste de `handleSubmit` (le `try/fetch/if (!res.ok)/window.location.href/setSubmitted`) ne change pas.

- [ ] **Step 5 : Passer le bouton de soumission en vert WhatsApp**

Remplacer le `<button type="submit">` actuel (classes `bg-ocre hover:bg-or ...`) par :

```tsx
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-whatsapp hover:bg-whatsapp-hover text-white text-[13px] font-inter font-semibold py-3.5 rounded-full transition-colors"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35zM12.05 21.5h-.01a9.4 9.4 0 0 1-4.79-1.31l-.34-.2-3.56.93.95-3.47-.22-.36a9.42 9.42 0 1 1 8.31 4.4l-.35-.02zM12.05 2a11.32 11.32 0 0 0-9.8 17.04L1 23l4.06-1.07A11.32 11.32 0 1 0 12.05 2z" />
              </svg>
              {tx.whatsappPrimaryBtn}
            </button>

            <p className="text-center text-nuit/40 text-[10px] font-inter leading-relaxed">
              {tx.reassurance} · {tx.noOnlinePayment}
            </p>
```

Supprimer l'ancien `<p>` de footer (`{tx.footer}`) qu'on vient de remplacer.

- [ ] **Step 6 : Vérifier la compilation TypeScript**

Run: `cd /Users/Mouj/Desktop/salon-mimi && npx tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 7 : Test manuel du golden path en local**

Ouvrir `http://localhost:3100/fr/reservation` :

1. Le formulaire montre 4 champs : Service, Nom, Téléphone, Date. Sous Service : la ligne de prix (« Tresses africaines — À partir de 150 MAD · tarif indicatif… »).
2. Changer le Service → la ligne de prix change.
3. Cliquer « + Ajouter des précisions » → Heure, Personnes, Email, Message apparaissent. Re-cliquer → ils disparaissent.
4. Remplir Nom + Téléphone + Date, laisser le repli fermé, cliquer le bouton vert → pas d'erreur JS (vérifier la console), l'écran de confirmation s'affiche, redirection WhatsApp déclenchée.
5. Recommencer en dépliant et en remplissant l'email → même comportement.

Vérifier `console` : aucune `TypeError`. Vérifier les logs du dev server : `tail -20 /tmp/mimi-dev.log`.

- [ ] **Step 8 : Commit**

```bash
cd /Users/Mouj/Desktop/salon-mimi
git add components/sections/ReservationLayout.tsx
git commit -m "feat(reservation): formulaire court — prix dynamique, champs optionnels repliés, bouton WhatsApp

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 6 : Tests Playwright

**Files:**

- Modify: `e2e/site.spec.ts`

**Note importante :** `playwright.config.ts` a `baseURL: "https://mimi-coiffure.com"` — les tests tournent contre la **prod**. Les nouveaux tests ne passeront donc en vert qu'**après déploiement**. Pour les valider en local avant push, lancer avec un baseURL override :

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3100 npx playwright test --project=desktop
```

…mais la config ne lit pas cette variable actuellement. Ajouter cette lecture dans `playwright.config.ts` fait partie du Step 1.

- [ ] **Step 1 : Rendre le baseURL surchargeable par variable d'environnement**

Dans `playwright.config.ts`, remplacer :

```ts
    baseURL: "https://mimi-coiffure.com",
```

par :

```ts
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "https://mimi-coiffure.com",
```

- [ ] **Step 2 : Ajouter le bloc de tests CRO à la fin de `e2e/site.spec.ts`**

Ajouter à la fin du fichier :

```ts
test.describe("Tunnel de réservation (CRO)", () => {
  test("le CTA WhatsApp principal pointe vers wa.me avec un message", async ({
    page,
  }) => {
    await page.goto("/fr/reservation");
    const cta = page
      .getByRole("link", { name: /réserver sur whatsapp/i })
      .first();
    await expect(cta).toBeVisible();
    const href = await cta.getAttribute("href");
    expect(href).toMatch(/^https:\/\/wa\.me\/\d+\?text=.+/);
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
    // Sélectionne une autre option (index 5 = Locks & dreads)
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

  test("le bandeau WhatsApp sticky est visible en mobile", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== "mobile",
      "Bandeau sticky mobile uniquement",
    );
    await page.goto("/fr");
    const sticky = page
      .locator("a.fixed.bottom-0")
      .filter({ hasText: /whatsapp/i });
    await expect(sticky.first()).toBeVisible();
  });

  test("le bandeau WhatsApp sticky est absent en desktop", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== "desktop",
      "Vérifie l'absence en desktop",
    );
    await page.goto("/fr");
    const sticky = page
      .locator("a.fixed.bottom-0")
      .filter({ hasText: /whatsapp/i });
    await expect(sticky).toHaveCount(0);
  });
});
```

- [ ] **Step 3 : Lancer les nouveaux tests en local contre le dev server**

```bash
cd /Users/Mouj/Desktop/salon-mimi
# dev server sur :3100 doit tourner
PLAYWRIGHT_BASE_URL=http://localhost:3100 npx playwright test --project=desktop -g "CRO"
PLAYWRIGHT_BASE_URL=http://localhost:3100 npx playwright test --project=mobile -g "CRO"
```

Expected: tous les tests `CRO` passent (le test « absent en desktop » skippé en mobile et inversement).

- [ ] **Step 4 : Lancer la suite complète en local pour vérifier la non-régression**

```bash
cd /Users/Mouj/Desktop/salon-mimi
PLAYWRIGHT_BASE_URL=http://localhost:3100 npx playwright test --project=desktop
PLAYWRIGHT_BASE_URL=http://localhost:3100 npx playwright test --project=mobile
```

Expected: 100% vert (11 tests existants + 5 nouveaux). Si un test existant casse, corriger la régression avant de continuer.

- [ ] **Step 5 : Commit**

```bash
cd /Users/Mouj/Desktop/salon-mimi
git add e2e/site.spec.ts playwright.config.ts
git commit -m "test(e2e): couverture tunnel de réservation CRO + baseURL surchargeable

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 7 : Vérification finale et livraison

**Files:** aucun (vérification)

- [ ] **Step 1 : TypeScript propre**

Run: `cd /Users/Mouj/Desktop/salon-mimi && npx tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 2 : Build de production**

Run: `cd /Users/Mouj/Desktop/salon-mimi && npm run build`
Expected: build réussi, aucune erreur de type ou de lint bloquante.

- [ ] **Step 3 : Revue manuelle golden path + cas limites (local, viewport mobile ET desktop)**

Sur `http://localhost:3100` :

- `/fr/reservation` desktop : bloc CTA vert visible en haut, séparateur, formulaire 4 champs, ligne de prix dynamique, repli fonctionnel, bouton vert, panneau photo droite intact, section « Vous ne trouvez pas le salon ? » intacte.
- `/fr/reservation` mobile : idem + bandeau sticky en bas. Le bandeau ne masque pas la section basse.
- `/fr`, `/fr/services`, `/fr/galerie`, `/fr/contact` mobile : bandeau sticky présent, footer non coupé.
- `/en/reservation` et `/es/reservation` : toutes les chaînes traduites (bouton, hint, réassurance, prix, « ajouter des précisions »).
- Soumission réelle du formulaire court avec un email de test → vérifier dans les logs qu'il n'y a pas d'erreur, et (si accès) que la réservation apparaît dans `/admin/dashboard`.
- Console navigateur : zéro erreur sur les 3 langues.

- [ ] **Step 4 : Logs du dev server**

Run: `tail -40 /tmp/mimi-dev.log`
Expected: aucune stack trace, aucune erreur 500 sur les routes visitées.

- [ ] **Step 5 : Arrêter le dev server**

```bash
pkill -f "next dev -p 3100"
```

- [ ] **Step 6 : Push**

```bash
cd /Users/Mouj/Desktop/salon-mimi
git push origin main
```

Railway déploie automatiquement.

- [ ] **Step 7 : Vérification post-déploiement (attendre ~3 min)**

```bash
curl -s https://mimi-coiffure.com/fr/reservation | grep -c "wa.me"
curl -sI https://mimi-coiffure.com/fr/reservation | head -1
```

Expected: HTTP 200, `wa.me` présent. Puis ouvrir `https://mimi-coiffure.com/fr/reservation` dans un navigateur mobile et desktop, refaire le golden path.

- [ ] **Step 8 : Lancer la suite Playwright contre la prod**

```bash
cd /Users/Mouj/Desktop/salon-mimi
npx playwright test --project=desktop
npx playwright test --project=mobile
```

Expected: 100% vert contre `https://mimi-coiffure.com`.

- [ ] **Step 9 : Mettre à jour le handoff**

Dans `handoff.md`, section « Ce qui reste à faire » : retirer la priorité 1 (refonte tunnel) de la liste, ajouter une nouvelle section datée décrivant ce qui a été livré (bloc CTA WhatsApp, formulaire court, prix dynamique, bandeau sticky) et les fichiers touchés. Commit + push.

---

## Self-Review (rempli par l'auteur du plan)

**1. Couverture de la spec :**

- § 4 structure page → Task 4 (CTA + séparateur), Task 5 (formulaire), reste inchangé. ✅
- § 5 formulaire court (4 champs + prix + repli + soumission + style) → Task 5. ✅
- § 6 sticky mobile → Task 2 (composant) + Task 3 (montage + padding). ✅
- § 7 constantes/helpers (`WHATSAPP_NUMBER`, `genericWhatsAppLink`) → Task 1. ✅
- § 8 i18n (7 clés FR/EN/ES) → Task 4 Step 2. ✅
- § 9 tests (sticky visible/absent, CTA href, prix dynamique, repli) → Task 6 (4 tests demandés + 1 bonus repli = 5). ✅
- § 10 fichiers touchés → tous couverts. ✅
- Aucune modif `route.ts` / `settings.ts` / RLS → respecté. ✅

**2. Placeholders :** aucun « TBD / TODO / à compléter ». Tout le code est fourni en entier.

**3. Cohérence des types :** `genericWhatsAppLink(locale: string): string` — signature identique en Task 1, 2, 4. `getVal(name)` défini et utilisé dans le même step (Task 5 Step 4). `showDetails` déclaré Task 5 Step 1, utilisé Step 3. `activeSvc` / `prices` : déjà existants, usage conforme (indexation par `id`). Classe CSS ciblée par les tests (`a.fixed.bottom-0` + texte WhatsApp) présente sur le composant `StickyWhatsApp` (Task 2) et absente ailleurs.

Note résiduelle : le champ caché `<select name="service">` du formulaire reste en place (utilisé pour l'UX du panneau photo). `getVal("service")` n'est pas appelé — `data.service` vient de `activeSvc.label`. Cohérent avec le comportement actuel.
