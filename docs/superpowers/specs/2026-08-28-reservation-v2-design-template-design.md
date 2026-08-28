# Spec — Refonte du design de `/reservation` (v2) — Salon Mimi

Date : 2026-08-28
Statut : validé (brainstorming), en attente review écrite
Projet : `/Users/Mouj/Desktop/salon-mimi` (mimi-coiffure.com)

---

## 1. Objectif

Créer une **version 2 de la page de réservation**, inspirée d'un template de design
fourni (hero sombre premium, logo doré centré, titre serif, carte formulaire crème,
deux boutons d'envoi WhatsApp / email, badges de réassurance).

La page de réservation actuelle (`/reservation`) reste **strictement inchangée et en
production**. La v2 vit sur une URL de preview `/reservation-v2` le temps que Mouj la
valide visuellement sur `mimi-coiffure.com`. La bascule v2 → prod est **hors périmètre
de cette session**.

---

## 2. Contexte et contraintes

### 2.1 Ce qui existe

- `components/sections/ReservationLayout.tsx` — composant client, layout 2 colonnes
  (formulaire à gauche 44 %, panneau photo qui change selon la coiffure à droite),
  section « Vous ne trouvez pas le salon ? » en bas.
- `app/[locale]/reservation/page.tsx` — Server Component : `revalidate = 3600`,
  `getSettings()` pour les prix, `getTranslations` pour les labels, `metadata` avec
  canonical + hreflang fr/en/es/x-default.
- `lib/whatsapp.ts` → `generateWhatsAppLink()`.
- `app/api/reservations/route.ts` → POST : INSERT Supabase + notif push Mimi +
  email de confirmation client (si email fourni) + renvoie `{ whatsappLink }`.
- Tests e2e `e2e/site.spec.ts`, bloc « Tunnel de réservation (CRO) » — 8 tests qui
  ciblent `/reservation` (pas `/reservation-v2`).

### 2.2 Pièges documentés (handoff Salon Mimi §19bis, §20)

- **INTERDIT : `useSearchParams()`** dans un composant client au rendu initial
  conditionnel/minimal sur une page pré-rendue (`revalidate`). Ça met le composant en
  CSR bailout / Offscreen et les vrais clics utilisateur sont perdus en prod. Lire
  `?service=` via `useEffect` + `new URLSearchParams(window.location.search)`.
- **Ne pas réintroduire `<Suspense>`** autour du composant sur la page.
- `window.open()` après `await fetch()` est bloqué par les navigateurs — utiliser
  `window.location.href` ou un `<a href>` cliqué (déjà le cas dans la v1, à conserver).

### 2.3 Contraintes de non-régression

La v1 `/reservation` n'étant pas touchée, les 8 tests e2e CRO restent verts par
construction. Malgré tout, la v2 **conserve mot pour mot** les libellés et sélecteurs
suivants (pour permettre l'ajout de tests v2 à la bascule, sans réécriture) :

- `<select name="service">`
- `<input name="name">`, `<input name="phone">`, `<input name="email">`
- `<input name="date">`, `<input name="time">`
- `<select name="persons">`, `<textarea name="message">`
- Libellé bouton submit : **« Confirmer ma réservation »** (clé `tx.submitBtn`)
- Libellé bouton WhatsApp : **« Réserver par WhatsApp »** (clé `tx.whatsappPrimaryBtn`)
- Libellé toggle : **« + Ajouter des précisions »** (clé `tx.addDetails`)
- Texte de la ligne de prix contenant **« tarif indicatif, confirmé au salon »**
  (clé `tx.priceIndicative`)

Aucun fichier serveur / API / lib n'est modifié.

---

## 3. Décisions de design (issues du brainstorming)

| Sujet           | Décision                                                                                                                                                                                                                                                                                                     |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Layout          | **Formulaire centré, une seule colonne** (`max-w-[640px]`). Le panneau photo latéral de la v1 est **supprimé** dans la v2.                                                                                                                                                                                   |
| Hero            | **Compact centré** : logo doré + kicker + titre serif + sous-titre, sur `bg-nuit` avec halo radial ocre. **Pas de photo de fond.**                                                                                                                                                                           |
| Boutons d'envoi | Look du template (2 cartes cliquables à égalité, icône dans un rond, kicker « ENVOYER PAR » + libellé + sous-titre) **mais libellés honnêtes inchangés** : « Réserver par WhatsApp » (carte verte) et « Confirmer ma réservation » (carte ocre, icône enveloppe, sous-titre « Mimi vous répond par email »). |
| Coexistence     | Nouveau composant `ReservationLayoutV2.tsx` + nouvelle route `/reservation-v2` (`noindex`). v1 intacte.                                                                                                                                                                                                      |
| Comportement JS | **Identique à la v1** — `handleSubmit`, `handleWhatsApp`, states, lecture `?service=`. Aucune logique nouvelle.                                                                                                                                                                                              |

### 3.1 Améliorations retenues par rapport au template brut

- **Ligne de prix dynamique** sous le select (déjà en v1, testée e2e) — conservée.
- **Repli « + Ajouter des précisions »** (Nombre de personnes, Email, Message) —
  conservé : formulaire court comme le template, sans perdre de champs.
- **Section « Vous ne trouvez pas le salon ? »** — conservée en bas (le salon est
  difficile à trouver Place Jamaa El Fna ; c'est un besoin terrain réel).
- **3 badges de réassurance** (Réponse rapide / Données sécurisées / Service
  personnalisé) — repris du template, nouveaux par rapport à la v1.
- **Écran de confirmation** enrichi : logo doré + ✦ + message + bouton WhatsApp de
  secours (au lieu du ✦ nu de la v1).

---

## 4. Livrables

### 4.1 Assets logo

- Source : `/Users/Mouj/Downloads/Logo Mimi-coiffure.png` (1254×1254, RGBA, fond
  transparent).
- Produire :
  - `public/images/logo-mimi.webp` — 512×512, qualité ~82, cible < 45 KB
  - `public/images/logo-mimi.png` — 512×512, fallback, `pngquant`/`sips` si dispo
- Commande de référence (à adapter selon outils dispo) :
  ```bash
  sips -Z 512 "/Users/Mouj/Downloads/Logo Mimi-coiffure.png" \
    --out public/images/logo-mimi.png
  cwebp -q 82 -resize 512 512 "/Users/Mouj/Downloads/Logo Mimi-coiffure.png" \
    -o public/images/logo-mimi.webp
  ```
- Le halo rouge/vert du contour (artefact de génération) est acceptable sur fond
  `bg-nuit` — ne pas passer de temps à le détourer dans cette session.

### 4.2 `components/sections/ReservationLayoutV2.tsx` (nouveau)

Composant client. Structure (colonne centrée `max-w-[640px] mx-auto`, `bg-fond`) :

1. **Hero** `bg-nuit`, `text-center`, padding vertical généreux
   - `<div>` halo : `radial-gradient(ellipse at 50% 0%, rgba(193,123,63,0.18), transparent 60%)`
   - Logo : `next/image`, `src="/images/logo-mimi.webp"` (ou `<picture>` webp+png),
     largeur ~160 px, `priority`, `alt="Salon Mimi — Rasta Africain Coiffure"`
   - Kicker : `tx.subheading` (ocre, `tracking-[3px]`, uppercase, ~10 px)
   - `<h1>` Georgia bold : `tx.heading` + `<em>` doré avec le mot final
     (`rendez-vous` / `cita` / `appointment`, même logique que la v1)
   - Sous-titre : `tx.heroSubtitle` (nouveau, blanc/60)

2. **Carte formulaire** `bg-white rounded-[20px] border border-ocre/25 shadow-sm p-6`,
   `-mt-6` pour chevaucher le bas du hero
   - En-tête : pastille `✦` (rond `bg-ocre/12`) + `tx.formTitle` (nouveau,
     « Votre réservation », Georgia bold) + `tx.required`
   - `<select name="service" value={activeIndex} onChange=...>` — options = `SERVICES`
   - Ligne de prix : `` `${activeSvc.label} — ${tx.startingFrom} <b>${prix} MAD</b> · ${tx.priceIndicative}` ``
   - Séparateur `h-px bg-ocre/15`
   - Grille `grid-cols-1 sm:grid-cols-2 gap-3` : Nom (`name="name"`, required) +
     Téléphone (`name="phone"`, `type="tel"`, required)
   - Grille `grid-cols-1 sm:grid-cols-2 gap-3` : Date (`name="date"`, `type="date"`,
     required) + Heure (`name="time"`, `type="time"`, optionnel)
   - `<button type="button" onClick={() => setShowDetails(v => !v)}>` → `tx.addDetails`
   - Repli `showDetails` : `<select name="persons">` (4 options), `<input name="email"
type="email">`, `<textarea name="message" rows={3}>`
   - `{error && ...}` et `{whatsappError && ...}` en `text-red-500 text-[12px]`
   - Séparateur label centré : `tx.chooseSend` (nouveau, « — Choisissez votre envoi — »)
   - **2 cartes d'envoi** : `grid grid-cols-2 gap-3` (empilées `max-[380px]:grid-cols-1`)
     - Carte verte — `<button type="button" onClick={handleWhatsApp}>` :
       rond `bg-whatsapp` avec `<WhatsAppIcon>`, kicker `tx.sendVia` (« Envoyer par »),
       libellé **`tx.whatsappPrimaryBtn`** (« Réserver par WhatsApp »), sous-titre
       `tx.whatsappCardHint` (« Réponse rapide assurée »)
     - Carte ocre — `<button type="submit">` :
       rond `bg-ocre` avec une icône enveloppe (SVG inline simple, pas de lib),
       kicker `tx.sendVia`, libellé **`tx.submitBtn`** (« Confirmer ma réservation »),
       sous-titre `tx.emailCardHint` (« Mimi vous répond par email »)
   - Micro-ligne : `` `${tx.reassurance} · ${tx.noOnlinePayment}` `` (`text-nuit/40 text-[10px]`)

3. **3 badges de réassurance** — `grid grid-cols-3 gap-2` sous la carte
   - Chaque badge : icône ocre (SVG inline ou glyphe), titre (`tx.badge1Title`…),
     sous-texte (`tx.badge1Text`…). 3 entrées : Réponse rapide / Données sécurisées /
     Service personnalisé. Traduits FR/EN/ES.

4. **Section « Vous ne trouvez pas le salon ? »** — reprise de la v1 :
   photo `/images/restaurant-argana.jpg`, `tx.lostTitle`, `tx.lostText`,
   `<a href="tel:+212710388204">` → `tx.lostCallLabel`. Adaptée à la colonne 640 px
   (grille `grid-cols-1 md:grid-cols-2`, `bg-nuit rounded-2xl`).

5. **Écran de confirmation** `if (submitted)` — logo doré (`next/image`, ~90 px) +
   `✦` ocre + `<h2>` `labels.success` + `tx.confirmSubtitle` + si `whatsappLink` :
   `<a href={whatsappLink} target="_blank" rel="noopener noreferrer">` bouton vert
   `tx.whatsappBtn`.

**Logique (copiée telle quelle de la v1, ne rien inventer) :**

- `const [activeIndex, setActiveIndex] = useState(0)` + `useEffect(() => { ... }, [])`
  qui lit `new URLSearchParams(window.location.search).get("service")` et fait
  `setActiveIndex(i)` si trouvé. **Pas de `useSearchParams`.**
- `submitted`, `whatsappLink`, `error`, `showDetails`, `whatsappError`,
  `formRef = useRef<HTMLFormElement>(null)`.
- `handleSubmit(e)` : `e.preventDefault()`, `getVal()` via `form.elements.namedItem()`,
  `data = { nom, telephone, email, service: activeSvc.label, date_souhaitee,
heure_souhaitee, nombre_personnes, message, locale }`, `fetch("/api/reservations",
{ method: "POST", ... })`, `if (!res.ok) throw`, `if (json.whatsappLink) {
setWhatsappLink(...); window.location.href = json.whatsappLink; }`,
  `setSubmitted(true)`, `catch { setError(labels.error) }`.
- `handleWhatsApp()` : lit `formRef.current`, exige `nom` + `telephone` sinon
  `setWhatsappError(tx.whatsappMissing)` + `focus()` sur le champ manquant, sinon
  construit `details` (heure / personnes / message) et
  `generateWhatsAppLink({ nom, telephone, service, dateSouhaitee, message })`,
  `window.location.href = url`.
- `Props` : `{ labels, prices, locale }` — **identique à la v1**.

**Objet `TEXTS` (FR/EN/ES)** — réutiliser les clés existantes de la v1 et **ajouter** :
`heroSubtitle`, `formTitle`, `chooseSend`, `sendVia`, `whatsappCardHint`,
`emailCardHint`, `badge1Title`, `badge1Text`, `badge2Title`, `badge2Text`,
`badge3Title`, `badge3Text`.

### 4.3 `app/[locale]/reservation-v2/page.tsx` (nouveau)

Copie de `app/[locale]/reservation/page.tsx` avec 3 changements :

- `import ReservationLayoutV2 from "@/components/sections/ReservationLayoutV2"`
- `generateMetadata` : garder `title` / `description` (mêmes textes que v1 OK), **retirer
  le bloc `alternates`** (pas de canonical ni hreflang vers la page de test) et
  **ajouter** `robots: { index: false, follow: false }`
- `export const revalidate = 3600` conservé
- Le corps (`getSettings()`, mapping `prices`, `labels`) est identique ; il rend
  `<ReservationLayoutV2 labels={labels} prices={prices} locale={locale} />`

Vérifier que le middleware i18n laisse bien passer `/reservation-v2` (routing
`[locale]` standard — a priori aucun ajout nécessaire ; à confirmer à
l'implémentation en ouvrant `/fr/reservation-v2`).

---

## 5. Plan de vérification (obligatoire avant « terminé »)

1. `npm run test` (Vitest) — vert
2. `npm run test:e2e` (Playwright desktop + mobile) — vert, **0 régression** sur les
   8 tests CRO de `/reservation`
3. `npx tsc --noEmit` — 0 erreur
4. `npm run build` — compile, `/reservation-v2` listée dans la sortie
5. Navigateur (dev server) :
   - `/fr/reservation-v2`, `/en/reservation-v2`, `/es/reservation-v2` — HTTP 200,
     hero + logo + formulaire rendus, textes traduits
   - Golden path : remplir Nom + Téléphone + Date → clic « Confirmer ma réservation »
     → écran de confirmation (nécessite Supabase/Resend configurés en local, sinon
     vérifier au moins l'appel réseau et l'absence d'exception JS)
   - Clic « Réserver par WhatsApp » sans Nom/Téléphone → message d'erreur + focus,
     pas de navigation
   - Clic « Réserver par WhatsApp » avec Nom + Téléphone → navigation `api.whatsapp.com`
   - `/fr/reservation-v2?service=locks-dreads` → `<select>` présélectionné sur
     « Locks & dreads » + ligne de prix correspondante
   - Console : 0 erreur (hormis le 400 Umami pré-existant, hors sujet)
   - Repli « + Ajouter des précisions » : `input[name="email"]` absent puis visible
6. `/fr/reservation` (v1) — inchangée visuellement (contrôle rapide)
7. Responsive : 375 px et 1280 px — pas de scroll horizontal, cartes d'envoi
   lisibles (côte à côte desktop, empilées très petit écran)

---

## 6. Hors périmètre (YAGNI)

- Bascule `/reservation-v2` → `/reservation` en prod (décidée après review visuelle de
  Mouj, dans une session ultérieure)
- Suppression de `ReservationLayout.tsx` (v1) ou de sa route
- Modification du `StickyBooking`, du header, du footer, des autres pages
- Nouveaux tests e2e dédiés à `/reservation-v2` (viendront à la bascule ; la page est
  temporaire et `noindex`)
- Détourage du halo du logo
- Refactor du `TEXTS` partagé entre v1 et v2 (duplication assumée le temps de la
  coexistence)

---

## 7. Risques et mitigations

| Risque                                                  | Mitigation                                                                                                                     |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| CSR bailout / clics perdus en prod (piège §19bis)       | `useEffect` + `window.location.search`, jamais `useSearchParams`, pas de `<Suspense>`.                                         |
| Régression e2e                                          | v1 intacte ; libellés et sélecteurs conservés à l'identique dans v2.                                                           |
| Logo trop lourd → LCP dégradé                           | Redimension 512 px + WebP < 45 KB + `priority`.                                                                                |
| Page de test indexée par Google                         | `robots: { index: false, follow: false }`, pas de canonical/hreflang, pas d'entrée sitemap.                                    |
| Confusion « Email » vs vraie réservation                | Libellé « Confirmer ma réservation » conservé ; le mot « email » n'apparaît qu'en sous-titre (« Mimi vous répond par email »). |
| `next dev` fantôme sur le port (note outillage handoff) | Vérifier `lsof -ti:3100` avant de tester ; demander à Mouj de `kill` si besoin.                                                |
