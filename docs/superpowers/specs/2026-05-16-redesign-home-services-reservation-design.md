# Redesign — Home, Services, Réservation · Salon Mimi

**Date :** 2026-05-16  
**Projet :** salon-mimi  
**Stack :** Next.js 14 App Router · Tailwind CSS · TypeScript · Supabase · Stripe  
**Pages concernées :** Home (`/`), Services (`/services`), Réservation (`/reservation`)

---

## 1. Contexte et objectif

Le design actuel du site ne convainc pas visuellement. Malgré une référence donnée (Africa Beauty), le résultat précédent manquait d'impact. L'objectif est de refaire les 3 pages avec un style **Bold & Culture** — affirmé, culturel, premium — sans tomber dans les clichés "site généré par IA".

La référence reste Africa Beauty (`salonafricabeauty.com`) pour la structure et l'énergie, mais la palette et les détails doivent être suffisamment distincts pour éviter tout risque de plagia.

---

## 2. Identité visuelle

### Palette de couleurs

| Rôle             | Valeur                   | Usage                                    |
| ---------------- | ------------------------ | ---------------------------------------- |
| Fond principal   | `#1a0d05`                | Background global de toutes les pages    |
| Panneau / carte  | `#3d1a06`                | Background des panneaux left/right       |
| Ocre accent      | `#c17b3f`                | CTAs primaires, badges, highlights, prix |
| Or secondaire    | `#d4a843`                | Hover des boutons ocre                   |
| Texte principal  | `#ffffff`                | Titres, textes importants                |
| Texte secondaire | `rgba(255,255,255,0.55)` | Corps de texte, descriptions             |
| Bordure subtile  | `rgba(193,123,63,0.2)`   | Bordures des panneaux                    |

### Typographie

- **Titres** : Georgia serif — bold + italic pour les accents
- **Corps, nav, labels** : Inter sans-serif
- **Taille titres hero** : `clamp(52px, 6vw, 88px)`
- **Taille titres sections** : `clamp(20px, 2.5vw, 30px)`

### Animations (micro-animations sobres uniquement)

- Fade-in + translateY au scroll (`opacity 0` → `1`, `translateY(20px)` → `0`)
- Hover sur boutons : `background` + `transform: translateY(-1px)`
- Hover sur cartes/pills : `border-color` + `color`
- Transitions : `0.2s–0.25s ease`
- Pas d'animations lourdes, pas de parallax, pas de cursor custom

### Composants globaux

- **Nav fixe** : liens à gauche · logo centré · bouton RDV ocre arrondi à droite · `backdrop-filter: blur(8px)`
- **Bouton primaire** : fond `#c17b3f`, arrondi `border-radius: 40px`, lettres espacées
- **Bouton secondaire** : transparent, bordure `rgba(255,255,255,0.22)`, hover ocre
- **Panneaux** : `background: #3d1a06`, `border-radius: 16px`, `border: 1px solid rgba(193,123,63,0.2)`

---

## 3. Page Home (`/`)

### 3.1 Nav

Nav fixe, fond `rgba(26,13,5,0.92)` avec blur. Logo "Salon Mimi" centré en letterspacing large.

### 3.2 Section Hero (100vh)

Layout split 50/50 :

**Colonne gauche :**

- Badge : `— Salon afro · Marrakech` en ocre, letterspacing
- Titre H1 : `SALON` + `Mimi` en italic ocre — Georgia bold, `clamp(52px, 6vw, 88px)`
- Accroche : _"Tes cheveux méritent mieux qu'une coiffure ordinaire."_ — Georgia serif 18px
- Texte corps : mots-clés SEO en blanc (`Salon Mimi`, `mains expertes`) et en ocre (`tresses africaines`) — max 380px
- 2 CTA : "→ Prendre rendez-vous" (primaire) + "Découvrir les services" (secondaire)

**Colonne droite — grille photos animées :**

- 3 colonnes de photos en `aspect-ratio: 0.68`
- Col 1 : scroll vers le haut, 22s
- Col 2 : scroll vers le bas, 28s (décalée verticalement)
- Col 3 : scroll vers le haut, 19s (décalée)
- Chaque colonne contient 4 photos dupliquées (8 items) pour un scroll infini sans saut
- Fade haut/bas via `::before` et `::after` avec gradient fond
- Photos : images réelles du salon (`/images/s-*.jpg|png`)

### 3.3 Section Localisation (NEW — SEO local)

Section dédiée à l'emplacement du salon. Objectif : faire apparaître Salon Mimi dans les recherches "salon coiffure Marrakech", "coiffure Jamaa El Fna", "salon afro Médina Marrakech".

**Contenu :**

- Badge : `Où nous trouver`
- Titre : `Au cœur de la Médina · *Place Jamaa El Fna*`
- Texte : mention explicite de "Place Jamaa El Fna", "Médina de Marrakech", "centre historique" — naturellement intégré, pas du keyword stuffing
- Layout split : carte Google Maps iframe à gauche + informations pratiques à droite (adresse, horaires, WhatsApp, bouton itinéraire)
- Markup JSON-LD `LocalBusiness` avec `address`, `geo`, `openingHours` (géré séparément dans le SEO)

### 3.4 Section CTA bas

- Titre : "Prends soin de ta couronne"
- Texte court
- Bouton "→ Réserver maintenant"
- Fond légèrement différent du hero pour créer une séparation visuelle (`border-top: 1px solid rgba(193,123,63,0.18)`)

---

## 4. Page Services (`/services`)

### 4.1 Nav

Même nav globale. Lien "Services" marqué actif en ocre.

### 4.2 Hero compact (flex-shrink: 0)

- Badge : `Ce qu'on fait · ce qu'on maîtrise`
- Titre H1 : `Des services pensés pour chaque texture` — mots-clés SEO intégrés
- Texte : liste les services nommément (`tresses africaines`, `knotless braids`, `locks`) pour le SEO
- 2 CTA : "→ Réserver maintenant" + "Voir les tarifs"
- Hauteur compacte — ne prend pas plus de 20% de la hauteur écran

### 4.3 Split carousel (flex: 1, min-height: 0)

Tout l'espace restant sous le hero. Marge `16px 48px 20px`, gap `16px`.

**Panneau gauche (36%) — boutons pill :**

- Fond `#3d1a06`, `border-radius: 16px`
- Label : `Choisir un service`
- 5 boutons pill avec icône décorative + nom du service
- Style : `border: 1px solid rgba(255,255,255,0.15)`, arrondi `border-radius: 50px`
- État actif : `background: #c17b3f`
- Services : Tresses africaines · Knotless braids · Fulani braids · Boho braids · Locks & dreads

**Panneau droit (flex: 1) — photo + overlay texte :**

- Fond `#3d1a06`, `border-radius: 16px`
- Stack de 5 slides absolus
- Transition tourne-page : `opacity` + `perspective(1400px) rotateY()`, `transform-origin: left center`
- Overlay : dégradé fort vers le bas (`rgba(10,4,0,0.95)` en bas)
- Sur chaque slide en overlay :
  - Badge catégorie (pill blanc semi-transparent)
  - Liste des sous-services en Georgia serif (ex: "Box braids · Cornrows · Tribal braids")
  - Prix `À partir de X MAD` en ocre
  - Bouton blanc "→ Réserver ce service" — hover devient ocre
- Auto-avance toutes les 4.5s
- Clic sur pill gauche = changement de slide immédiat

**Données des 5 services :**
| Service | Sous-services | Prix |
|---|---|---|
| Tresses africaines | Box braids · Cornrows · Tribal braids · Tresse frontale · Micro braids | dès 150 MAD |
| Knotless braids | Knotless classiques · Jumbo · Avec couleur · Fini perles | dès 200 MAD |
| Fulani braids | Classiques · Avec perles · Fils de couleur · Tribal | dès 180 MAD |
| Boho braids | Boho knotless · Avec frisures · Jumbo · Colorées | dès 220 MAD |
| Locks & dreads | Pose · Sisterlocks · Entretien · Retouche racines | dès 250 MAD |

---

## 5. Page Réservation (`/reservation`)

### 5.1 Nav

Même nav globale.

### 5.2 Header compact

- Badge : `Réservation en ligne · Marrakech`
- Titre H1 : `Réserve ton rendez-vous`

### 5.3 Split formulaire/photo (flex: 1)

Marge et gap identiques aux autres pages.

**Panneau gauche (44%) — formulaire :**

- Fond `#3d1a06`, `border-radius: 16px`, scrollable si nécessaire
- Ordre des champs :
  1. **Service** (select, pré-rempli depuis la page Services via query param `?service=knotless-braids`) — modifiable
  2. Nom complet + Téléphone/WhatsApp (2 colonnes)
  3. Date souhaitée + Heure souhaitée (2 colonnes)
  4. Nombre de personnes (select : 1 / 2 / 3 / 4+)
  5. Message optionnel (textarea)
- Bouton submit : "→ Confirmer la réservation" — pleine largeur, ocre
- Note bas : "Confirmation par WhatsApp sous 24h · Aucun paiement requis maintenant"

**Passage du service depuis la page Services :**

- Bouton "Réserver ce service" sur `/services` redirige vers `/reservation?service=knotless-braids`
- Le composant Réservation lit le query param au montage (`useSearchParams`) et pré-sélectionne le service dans le select + affiche la slide photo correspondante

**Panneau droit (flex: 1) — photo du service :**

- Même stack de slides que la page Services
- S'affiche au chargement avec le service pré-sélectionné
- Change dynamiquement si l'utilisateur modifie le select
- Overlay identique : badge + nom du service + sous-services + prix

---

## 6. SEO — points clés

- H1 de chaque page contient les mots-clés cibles : "tresses africaines Marrakech", "knotless braids", "salon afro Marrakech"
- Section localisation sur la Home : "Jamaa El Fna", "Médina de Marrakech", "centre historique"
- JSON-LD `LocalBusiness` avec adresse complète, coordonnées GPS, horaires
- Textes des overlays sur les photos (Services) sont du contenu indexable — pas juste des images
- Balises `alt` sur toutes les images avec descriptions précises (ex: "knotless braids salon Marrakech")

---

## 7. Ce qui ne change pas

- Logique de réservation Supabase (tables, RLS)
- Paiement Stripe
- Pages À propos, Contact, Admin dashboard
- Middleware i18n (fr/en/es)
- API routes existantes

---

## 8. Fichiers impactés (estimation)

- `components/sections/Hero.tsx` → réécriture complète
- `components/sections/HeroHome.tsx` → réécriture complète
- `components/sections/ServicesCarousel.tsx` → réécriture complète
- `components/sections/LocationSection.tsx` → **nouveau composant**
- `components/sections/CTAFinal.tsx` → mise à jour mineure
- `app/[locale]/page.tsx` → ajout de la section Localisation
- `app/[locale]/services/page.tsx` → mise à jour layout
- `app/[locale]/reservation/page.tsx` → lecture query param + layout
- `app/globals.css` → variables couleurs (déjà en place, vérification)
- `tailwind.config.ts` → couleur `#3d1a06` à ajouter (`panneau`)
