# Refonte du tunnel de réservation (CRO) — Design

Date : 2026-08-29
Projet : Salon Mimi (mimi-coiffure.com)
Priorité : 1 (handoff § « Ce qui reste à faire »)

## 1. Objectif

Transformer le trafic existant (~456 vues/mois sur la fiche Google Business, trafic
site correct) en réservations réelles. Le point de fuite identifié est la
**conversion** : le visiteur arrive mais ne réserve pas. Le tunnel actuel est un
long formulaire unique (10 champs, email obligatoire) sans CTA WhatsApp direct,
sans prix visible avant d'ouvrir le sélecteur, sans réassurance, sans rappel
permanent sur mobile.

## 2. État actuel

`/reservation` → `ReservationLayout.tsx` :

- Un seul formulaire : coiffure, nom, téléphone, **email obligatoire**, date,
  heure, nombre de personnes, message.
- Soumission → `POST /api/reservations` → insert Supabase + notif push Mimi +
  email notif interne + accusé de réception client (si email) → puis
  `window.location.href = json.whatsappLink` (message WhatsApp détaillé généré
  côté serveur).
- Prix visibles uniquement sur le panneau photo à droite (desktop only, masqué
  mobile).
- Aucun CTA WhatsApp direct. Aucun élément sticky.

`app/api/reservations/route.ts` : validation serveur déjà tolérante (email vide OK,
heure vide OK, personnes vide OK). **Aucune modification serveur nécessaire.**

## 3. Décisions (brainstorm 2026-08-29)

| Sujet                                            | Décision                                                                                                                                          |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stratégie CTA                                    | **Double** : bouton WhatsApp direct en haut (pour les pressés) + formulaire court en dessous (pour ceux qui veulent cadrer leur demande)          |
| Champs du formulaire court                       | 4 visibles (coiffure, date, nom, téléphone) + bloc optionnel replié (heure, nombre de personnes, email, message)                                  |
| Nombre d'étapes                                  | **1 seule étape** (pas de wizard « Suivant »)                                                                                                     |
| Affichage prix                                   | Ligne dynamique **sous le `<select>`** : « Box braids — dès X MAD · tarif indicatif, confirmé au salon », branchée sur les prix `/admin/settings` |
| Réassurance                                      | « Réponse rapide par WhatsApp · Annulation gratuite · Paiement sur place » (pas de promesse chiffrée type « moins d'1h »)                         |
| Bandeau sticky mobile                            | **Toutes les pages du site**, mobile uniquement (`< lg`)                                                                                          |
| Trace en base pour le formulaire court           | **Oui** : on garde `POST /api/reservations` (insert + push + emails) puis redirection WhatsApp                                                    |
| Boutons WhatsApp directs (haut de page + sticky) | Aucun appel API, `wa.me` + message générique traduit                                                                                              |

## 4. Structure de la page `/reservation` (de haut en bas)

1. **En-tête** — inchangé (sous-titre + titre).
2. **Bloc CTA WhatsApp principal** — nouveau. Grand bouton vert pleine largeur
   « Réserver sur WhatsApp » + hint « Le plus rapide — écris directement à Mimi ».
   Sous le bouton : ligne de réassurance. Action : `<a href>` vers `wa.me` avec
   message générique traduit. **Aucune API.**
3. **Séparateur** — « ou remplis ce formulaire rapide » (petit, centré, discret).
4. **Formulaire court** — voir § 5. Bouton de soumission vert « Réserver sur
   WhatsApp » (celui-ci enregistre en base puis ouvre WhatsApp avec message
   détaillé). Réassurance répétée sous le bouton + « Aucun paiement en ligne ».
5. **Panneau photo droite** — desktop only, inchangé (vignette + sous-services de
   la coiffure sélectionnée + prix).
6. **Section « Vous ne trouvez pas le salon ? »** — inchangée.

Hiérarchie visuelle : le bloc CTA WhatsApp (2) est dominant (vert, gros). Le
formulaire (4) est présenté comme l'alternative.

## 5. Le formulaire court

### Champs visibles (4, tous requis côté client)

| Champ                | Type                         | Note                |
| -------------------- | ---------------------------- | ------------------- |
| Coiffure             | `<select>` natif, 10 options | inchangé (SERVICES) |
| Date souhaitée       | `<input type="date">`        |                     |
| Nom complet          | `<input type="text">`        |                     |
| Téléphone / WhatsApp | `<input type="tel">`         |                     |

### Ligne de prix dynamique

Sous le `<select>` coiffure : `{label} — {startingFrom} {prix} MAD · {priceIndicative}`
où `prix = prices[serviceId] ?? fallback`. Se met à jour au `onChange`.
Traduite FR/EN/ES (`startingFrom` existe déjà, ajouter `priceIndicative`).

### Bloc optionnel replié

Lien « + Ajouter des précisions » (`addDetails`). Au clic (`useState`), déplie :
Heure souhaitée (`time`), Nombre de personnes (`select`), Email (`email`),
Message (`textarea`). **Email non obligatoire.** S'il est rempli, l'accusé de
réception client (commit `4b6c44b`) se déclenche côté serveur — comportement
existant, rien à coder.

### Soumission (logique inchangée sur le fond)

1. `POST /api/reservations` avec `{ nom, telephone, email, service, date_souhaitee,
heure_souhaitee, nombre_personnes, message, locale }`.
2. `if (!res.ok) throw` → message d'erreur existant.
3. `if (json.whatsappLink)` → `window.location.href = json.whatsappLink`.
4. `setSubmitted(true)` → écran de confirmation existant (avec bouton fallback
   WhatsApp si la redirection n'a pas abouti).

Le champ caché `service` du form actuel (name="service", value=activeIndex) est
conservé — la soumission lit `activeSvc.label`.

### Style

Bouton de soumission : passe de `bg-ocre` à vert WhatsApp (`bg-whatsapp
hover:bg-whatsapp-hover`), icône WhatsApp, libellé « Réserver sur WhatsApp ».

## 6. Bandeau sticky mobile — `components/layout/StickyWhatsApp.tsx`

- **Nouveau client component**, monté dans `app/[locale]/layout.tsx`.
- **Mobile uniquement** : `lg:hidden` (cohérent avec le breakpoint hamburger du header).
- **Position** : `fixed bottom-0 inset-x-0`, hauteur ~52px, `bg-whatsapp`, texte
  blanc « Réserver sur WhatsApp » + icône. `z-40` (sous d'éventuelles modales,
  au-dessus du contenu).
- **Action** : `<a href>` vers `wa.me/${WHATSAPP_NUMBER}?text=...` message
  générique traduit. Pas de `window.open` après async (piège documenté handoff).
- **Compensation** : `pb-[52px] lg:pb-0` sur le conteneur `<main>` du layout pour
  que le sticky ne masque jamais le bas du footer.
- **i18n** : 3 traductions (FR/EN/ES) dans le composant lui-même (pattern
  `LangPills`).
- **Exclusions** : `/mimi.html` est hors layout Next (rien à faire). `/admin`
  n'est pas sous le layout `[locale]` (rien à faire). Si le composant est monté
  dans le layout `[locale]`, il ne s'affiche que sur les pages publiques — pas de
  garde de pathname nécessaire. À vérifier au montage.

## 7. Constantes & helpers

### `lib/social.ts`

Ajouter : `export const WHATSAPP_NUMBER = "212710388204";`
Le sticky et le CTA principal l'importent de là.
**Ne pas toucher** aux usages existants de `settings.whatsapp_number` (contact,
CTAFinal, LocationSection) — hors périmètre. Note : consolidation à prévoir plus
tard (le défaut `+212600000000` dans `settings.ts` est incohérent).

### `lib/whatsapp.ts`

Ajouter `export function genericWhatsAppLink(locale: string): string` :

| Locale | Message                                          |
| ------ | ------------------------------------------------ |
| fr     | Bonjour Mimi, je voudrais réserver une coiffure. |
| en     | Hello Mimi, I'd like to book an appointment.     |
| es     | Hola Mimi, quería reservar una cita.             |

Retourne `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`.
`generateWhatsAppLink` (message détaillé, serveur) reste inchangé.

## 8. i18n — nouvelles clés

Objet `TEXTS` de `ReservationLayout.tsx` (FR/EN/ES) :

- `whatsappPrimaryBtn` — « Réserver sur WhatsApp »
- `whatsappPrimaryHint` — « Le plus rapide — écris directement à Mimi »
- `orFillForm` — « ou remplis ce formulaire rapide »
- `reassurance` — « Réponse rapide par WhatsApp · Annulation gratuite · Paiement sur place »
- `priceIndicative` — « tarif indicatif, confirmé au salon »
- `addDetails` — « + Ajouter des précisions »
- `noOnlinePayment` — « Aucun paiement en ligne »

Traductions EN/ES à rédiger dans le même registre que l'existant.

## 9. Tests (règle 0 — zéro régression)

### `e2e/site.spec.ts` — nouveaux tests

1. Viewport mobile (Pixel 5) : `StickyWhatsApp` visible sur `/fr` et
   `/fr/reservation` ; absent en viewport desktop.
2. `/fr/reservation` : le CTA WhatsApp principal a un `href` commençant par
   `https://wa.me/` avec `text=` non vide.
3. `/fr/reservation` : la ligne de prix change quand on change la valeur du
   `<select>` coiffure.
4. `/fr/reservation` : remplir coiffure + date + nom + téléphone → submit →
   l'écran de confirmation (`booking.success`) apparaît.

### Vérifications obligatoires avant livraison

- `npx tsc --noEmit` — zéro erreur.
- `npx playwright test --project=desktop` — 11 tests existants + nouveaux, tous verts.
- `npx playwright test --project=mobile` — verts.
- Test manuel navigateur (contournement `preview_start` cassé : `next dev -p 3100`
  via terminal) : golden path des 3 CTA + bloc optionnel replié/déplié + prix
  dynamique + sticky sur 3 pages différentes en mobile.
- Checklist déploiement du handoff (§ « Checklist obligatoire avant tout
  déploiement ») : `/admin/dashboard` affiche les réservations, champ carte s.o.
  (pas de Stripe ici), réservation test → dashboard + notif push.

## 10. Fichiers touchés

```
components/sections/ReservationLayout.tsx   — CTA principal, formulaire court, prix dynamique,
                                              bloc optionnel replié, bouton vert, nouvelles clés i18n
components/layout/StickyWhatsApp.tsx         — NOUVEAU : sticky mobile toutes pages
app/[locale]/layout.tsx                      — montage <StickyWhatsApp/> + pb-[52px] lg:pb-0 sur <main>
lib/social.ts                                — WHATSAPP_NUMBER
lib/whatsapp.ts                              — genericWhatsAppLink(locale)
e2e/site.spec.ts                             — 4 nouveaux tests
```

Aucune modification de `app/api/reservations/route.ts`, `lib/settings.ts`,
`lib/sendClientConfirmationEmail.ts`, ni des politiques RLS Supabase.

## 11. Risques

| Risque                                                         | Mitigation                                                                                                      |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Deux CTA WhatsApp diluent l'attention                          | Hiérarchie visuelle stricte : bloc principal vert et gros, formulaire présenté comme alternative                |
| Sticky masque le footer / contenu bas de page                  | `pb-[52px] lg:pb-0` sur `<main>` ; hauteur limitée à 52px                                                       |
| Perte de la trace en base si le visiteur utilise le CTA direct | Assumé : le CTA direct cible les pressés ; le formulaire court (avec trace) reste mis en avant juste en dessous |
| Numéro WhatsApp en dur dupliqué                                | `WHATSAPP_NUMBER` dans `lib/social.ts` pour les nouveaux usages ; consolidation globale notée pour plus tard    |
| `StickyWhatsApp` s'afficherait sur une page où il gêne         | Monté dans le layout `[locale]` → pages publiques uniquement ; vérif au montage                                 |

```

```
