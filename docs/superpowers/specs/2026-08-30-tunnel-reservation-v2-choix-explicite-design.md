# Tunnel de réservation v2 — choix explicite WhatsApp / formulaire — Design

Date : 2026-08-30
Projet : Salon Mimi (mimi-coiffure.com)
Suite de : `2026-08-29-refonte-tunnel-reservation-cro-design.md` (v1, déployée)

## 1. Problème constaté sur la v1 en prod

La v1 met un gros bouton WhatsApp vert en tête de `/reservation`, suivi d'un
séparateur texte « ou remplis ce formulaire rapide » en petits caractères gris,
puis le formulaire.

Sur mobile, au chargement, le visiteur ne voit que le bouton vert plein écran.
Le lien vers le formulaire est en trop petit, gris, souvent hors de l'écran
initial. **Résultat perçu : la page ne propose que la réservation par WhatsApp.**
Un visiteur sans WhatsApp, ou qui préfère un formulaire, croit qu'il n'a pas le
choix.

## 2. Décision (brainstorm 2026-08-30)

| Sujet                              | Décision                                                                                                                                                                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Structure au chargement            | **Deux boutons de même taille** : « Réserver par WhatsApp » (vert plein) et « Réserver par formulaire » (contour ocre). Empilés sur mobile, côte à côte sur desktop.                                                      |
| Hiérarchie visuelle                | WhatsApp légèrement mis en avant (vert plein vs contour), mais le bouton formulaire est un **vrai bouton pleine largeur**, plus une ligne de texte.                                                                       |
| Formulaire                         | **Masqué par défaut** (`showForm = false`). Le bouton « Réserver par formulaire » le déplie.                                                                                                                              |
| Boutons après dépli                | **Restent visibles** au-dessus du formulaire. Le bouton « formulaire » prend un état actif (fond ocre plein) quand ouvert.                                                                                                |
| Bouton de soumission du formulaire | Repasse en **ocre** (`bg-ocre`), plus vert — pour ne pas le confondre avec le bouton WhatsApp du haut. Libellé « Confirmer ma réservation » (nouvelle clé i18n `submitBtn`).                                              |
| Email dans le parcours WhatsApp    | **Aucun email échangé** par le bouton WhatsApp direct (pas d'API, comme en v1). L'accusé de réception client ne part que via le formulaire, si email rempli.                                                              |
| Panneau photo droite (desktop)     | Affiché **seulement quand le formulaire est déplié**. Tant que seuls les 2 boutons sont montrés → pas de panneau.                                                                                                         |
| Bandeau sticky mobile              | Pointe désormais vers **`/{locale}/reservation`** (plus vers `wa.me` direct), pour que les visiteurs sans WhatsApp aient accès aux 2 options. Libellé « Réserver un rendez-vous ». Composant renommé **`StickyBooking`**. |

## 3. Page `/reservation` — structure détaillée

De haut en bas :

1. **En-tête** — inchangé (sous-titre « Réservation en ligne · Marrakech » + titre).
2. **Bloc de choix** (nouveau, remplace le bloc CTA v1) :
   - Conteneur `px-5 md:px-12 pt-4 pb-2`.
   - Sur mobile : `flex flex-col gap-3`. Sur desktop : `sm:flex-row`.
   - **Bouton A — « Réserver par WhatsApp »** : `<a>` pleine largeur (ou `flex-1` en row), `bg-whatsapp hover:bg-whatsapp-hover text-white font-semibold text-[15px] py-4 rounded-full`, `<WhatsAppIcon className="w-5 h-5" />` + `{tx.whatsappPrimaryBtn}`. `href={genericWhatsAppLink(locale)}`, `target="_blank"`, `rel="noopener noreferrer"`. Aucune API.
   - **Bouton B — « Réserver par formulaire »** : `<button type="button">` pleine largeur (ou `flex-1`), même `py-4 rounded-full text-[15px] font-semibold`. État fermé : `border-2 border-ocre text-ocre bg-transparent`. État ouvert (`showForm === true`) : `bg-ocre text-white border-2 border-ocre`. `onClick={() => setShowForm(v => !v)}`.
   - Sous les deux boutons : `<p>` réassurance `{tx.reassurance}`, centré, `text-nuit/40 text-[10px]`.
3. **Formulaire + panneau photo** — rendus seulement si `showForm` :
   - `{showForm && (<div className="flex flex-col md:flex-row flex-1 min-h-0 gap-4 p-4 pt-3"> ... </div>)}`
   - Le `<form>` : identique à la v1 (Service + ligne de prix dynamique, Nom + Téléphone, Date, « + Ajouter des précisions » → Heure/Personnes/Email/Message repliés). Champs et `name=` inchangés.
   - Bouton de soumission : `<button type="submit" className="w-full bg-ocre hover:bg-or text-white text-[13px] font-inter font-semibold py-3.5 rounded-full transition-colors">{tx.submitBtn}</button>` (pas d'icône WhatsApp, pas de vert).
   - `<p>` sous le bouton : `{tx.reassurance} · {tx.noOnlinePayment}` (inchangé).
   - Panneau photo droite : `<div className="hidden md:block flex-1 bg-nuit ...">` — inchangé, dans le même `{showForm && ...}`.
4. **Section « Vous ne trouvez pas le salon ? »** — inchangée, **toujours affichée** (hors du `{showForm}`).

### `handleSubmit`

Inchangé par rapport à la v1 : `getVal()` helper, `POST /api/reservations`,
`if (!res.ok) throw`, `window.location.href = json.whatsappLink`,
`setSubmitted(true)`. L'écran de confirmation `submitted` : inchangé.

## 4. Composant `StickyBooking` (ex-`StickyWhatsApp`)

- Renommer le fichier `components/layout/StickyWhatsApp.tsx` →
  `components/layout/StickyBooking.tsx`. Renommer le composant `StickyWhatsApp` →
  `StickyBooking`.
- `href` : `/{locale}/reservation` au lieu de `genericWhatsAppLink(locale)`.
  Pas de `target="_blank"` (navigation interne), garder un simple `<a href>`.
  Idéalement `next/link`, mais un `<a>` marche aussi ; suivre le pattern des
  autres liens internes du projet (`Header.tsx` utilise `next/link`).
- Libellé : nouvelle table `LABELS` — `{ fr: "Réserver un rendez-vous", en: "Book an appointment", es: "Reservar una cita" }`.
- Garde `lg:hidden fixed bottom-0 inset-x-0 z-40 h-sticky-wa ... bg-whatsapp ...`.
  (Le fond reste vert — c'est le CTA de réservation, le vert marche bien ; on ne
  change que la destination et le texte.)
- L'icône : garder `<WhatsAppIcon />` OU passer à une icône neutre (calendrier).
  Décision : **garder `<WhatsAppIcon />`** — le vert + le pictogramme restent
  associés à « contacter le salon », et la page de destination propose WhatsApp
  en premier. Pas de sur-ingénierie.
- Import dans `app/[locale]/layout.tsx` : `StickyWhatsApp` → `StickyBooking`.
  Le token `pb-sticky-wa` sur `<main>` : inchangé (même hauteur 52px).

## 5. i18n — clés (objet `TEXTS` de `ReservationLayout.tsx`)

Ajuster :

- `whatsappPrimaryBtn` — inchangé : « Réserver par WhatsApp » / « Book via WhatsApp » / « Reservar por WhatsApp »
  (v1 avait « Réserver sur WhatsApp » ; passer à « par » pour la symétrie avec « par formulaire ». EN : « Book via WhatsApp ». ES : « Reservar por WhatsApp ».)
- **Nouveau** `formBtn` — « Réserver par formulaire » / « Book via form » / « Reservar con formulario »
- **Nouveau** `submitBtn` — « Confirmer ma réservation » / « Confirm my booking » / « Confirmar mi reserva »
- `whatsappPrimaryHint` — **supprimé** (le hint « Le plus rapide — écris directement à Mimi » disparaît, les 2 boutons parlent d'eux-mêmes)
- `orFillForm` — **supprimé** (plus de séparateur texte)
- `reassurance`, `priceIndicative`, `addDetails`, `noOnlinePayment`, `startingFrom` — inchangés

## 6. Tests Playwright — `e2e/site.spec.ts`

Les 5 tests CRO de la v1 doivent être adaptés :

1. **« le bouton Réserver par WhatsApp pointe vers wa.me »** — inchangé sur le
   fond : `getByRole("link", { name: /réserver par whatsapp/i })`, `href` matche
   `/^https:\/\/wa\.me\/\d+\?text=.+/`. (Ajuster le regex du nom : « par » au lieu
   de « sur ».)
2. **« la ligne de prix change quand on change de coiffure »** — ajouter en
   préambule : `await page.getByRole("button", { name: /réserver par formulaire/i }).click();`
   avant de manipuler `select[name='service']`.
3. **« les champs optionnels sont masqués puis dépliables »** — idem : cliquer
   d'abord « Réserver par formulaire », puis vérifier `input[name='email']`
   count 0, cliquer « + Ajouter des précisions », vérifier visible.
4. **Nouveau** — **« le formulaire est masqué au chargement, visible après clic »** :
   `page.goto("/fr/reservation")`, `expect(page.locator("select[name='service']")).toHaveCount(0)`,
   click « Réserver par formulaire », `expect(select).toBeVisible()`.
5. **« le bandeau sticky est visible en mobile »** — inchangé (visible), mais
   changer l'assertion de `href` : il doit maintenant matcher `/\/fr\/reservation$/`
   (ou `/reservation`), **plus** `wa.me`.
6. **« le bandeau sticky est absent en desktop »** — inchangé (`toBeHidden()`).

Gate : `npx tsc --noEmit` + `npm run build` + Playwright local
(`PLAYWRIGHT_BASE_URL=http://localhost:3100`) desktop + mobile 100 % vert.

## 7. Fichiers touchés

```
components/sections/ReservationLayout.tsx   — bloc 2 boutons, state showForm, formulaire + photo dans {showForm}, bouton submit ocre, clés i18n (formBtn, submitBtn ajoutées ; whatsappPrimaryHint, orFillForm supprimées)
components/layout/StickyBooking.tsx          — RENOMMÉ depuis StickyWhatsApp.tsx : href → /{locale}/reservation, libellés, nom du composant
app/[locale]/layout.tsx                      — import StickyWhatsApp → StickyBooking
e2e/site.spec.ts                             — 6 tests CRO adaptés (formulaire masqué au chargement, sticky href interne)
```

Pas de changement : `lib/whatsapp.ts` (`genericWhatsAppLink` toujours utilisé par
le bouton A), `lib/social.ts`, `app/api/reservations/route.ts`, `tailwind.config.ts`
(token `sticky-wa` gardé), `components/ui/WhatsAppIcon.tsx`.

## 8. Risques

| Risque                                                                         | Mitigation                                                                                                                                                     |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Le formulaire masqué = un clic de plus avant de réserver par formulaire        | Assumé : le bénéfice (choix clair, pas d'effet « une seule option ») dépasse le coût d'un clic. Les 2 boutons sont au-dessus de la ligne de flottaison mobile. |
| Régression sur les tests e2e existants (formulaire plus visible au chargement) | Les 3 tests concernés sont explicitement listés en § 6 avec le préambule de clic à ajouter.                                                                    |
| Le bandeau sticky renommé casse un import ailleurs                             | Grep `StickyWhatsApp` avant/après — un seul import (le layout).                                                                                                |
| `next/link` vs `<a>` pour le sticky                                            | Le sticky est un client component ; `next/link` y fonctionne. Suivre `Header.tsx`.                                                                             |
| Perte du hint « le plus rapide » qui poussait vers WhatsApp                    | Compensé : WhatsApp reste vert plein (vs contour pour le formulaire), l'œil y va d'abord.                                                                      |
