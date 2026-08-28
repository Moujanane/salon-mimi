# Galerie → catalogue par style — design

Date : 2026-08-28
Statut : validé, prêt pour plan d'implémentation

## 1. Objectif

Transformer l'onglet **Photos** de la page `/galerie` : passer d'une grille unique de
37 images en vrac à un **catalogue organisé par type de coiffure** (30 images réelles
réparties en 9 sections), chaque section portant un titre et une phrase de description
trilingues (FR/EN/ES).

Objectif métier : une visiteuse qui cherche « box braids » ou « locks » voit tout de
suite les réalisations correspondantes, au lieu de faire défiler un pêle-mêle.
Objectif SEO : du texte indexable structuré par mot-clé coiffure sur une page qui
n'avait qu'un paragraphe d'introduction.

## 2. Périmètre

### Dans le périmètre

- Refonte du rendu de l'onglet **Photos** dans `components/sections/GalerieClient.tsx`
- Regroupement des images réelles existantes en 9 sections thématiques
- Rédaction des titres + phrases de description dans les 3 langues
- Retrait des 6 images `pomelli-image-1..6.png` de la galerie (visuels générés par IA,
  hors sujet pour un catalogue de réalisations réelles)

### Hors périmètre

- Aucune nouvelle page, aucune nouvelle route
- Aucune nouvelle image ajoutée au projet
- L'onglet **Vidéos** ne change pas (11 vidéos, inchangées)
- `app/[locale]/galerie/page.tsx` (composant serveur) ne change pas :
  URL, `generateMetadata`, canonical, hreflang, titre de page — tout est conservé
- Pas de lightbox / agrandissement au clic (décision explicite : certaines images
  sont en basse résolution, un agrandissement révélerait le flou)
- `next.config.mjs`, `app/sitemap.ts` : non touchés

## 3. Architecture

### Fichier unique touché

`components/sections/GalerieClient.tsx` — composant client `"use client"`, aucune
logique métier, aucun appel réseau, aucun état partagé. Le seul état est
`tab: "photos" | "videos"` (inchangé).

### Changement de structure de données

**Avant** — tableau plat :

```ts
const PHOTOS = [
  { src: "/images/salon-mimi-1.jpeg", alt: "..." },
  // ... 37 entrées
];
```

**Après** — tableau de sections :

```ts
interface GallerySection {
  id: string;
  title: Record<"fr" | "en" | "es", string>;
  desc: Record<"fr" | "en" | "es", string>;
  photos: { src: string; alt: string }[];
}

const SECTIONS: GallerySection[] = [/* 9 sections, voir §4 */];
```

### Changement de rendu (onglet Photos uniquement)

**Avant** : une seule `<div class="grid ...">` qui boucle sur `PHOTOS`.

**Après** : boucle sur `SECTIONS`. Pour chaque section :

- un en-tête : trait ocre + label en majuscules `tracking-widest` (même style que les
  autres bandeaux du site, cf. `GoogleReviews.tsx`), avec la phrase de description en
  petit dessous
- la grille d'images identique à l'existante :
  `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`, `aspect-square`,
  `rounded-2xl overflow-hidden`, `object-cover hover:scale-105`
- `sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"` conservé
- espace vertical généreux entre sections (`mt-16` sur les sections après la première)

L'onglet Vidéos : le bloc `tab === "videos"` reste identique au code actuel.

## 4. Contenu des 9 sections

Ordre d'affichage = ordre du tableau. 30 images réelles au total.

### Section 1 — Le salon (`id: "salon"`)

Images : `salon-mimi-1.jpeg`, `salon-mimi-2.jpeg`, `salon-mimi-3.jpeg`, `hero-salon.jpg`

- **FR** — titre : « Le salon » · desc : « Notre salon Place Jamaa El Fna, au cœur de la médina de Marrakech. »
- **EN** — title: "The salon" · desc: "Our salon on Jamaa El Fna Square, in the heart of the Marrakech medina."
- **ES** — título: "El salón" · desc: "Nuestro salón en la Plaza Jamaa El Fna, en el corazón de la medina de Marrakech."

### Section 2 — Box Braids (`id: "box-braids"`)

Images : `s-box-braids-longues.jpg`, `s-box-braids-profil.jpg`, `s-box-braids-xl.jpg`, `s-tresses-3.jpg`, `coiffure-1.jpg`

- **FR** — « Box Braids » · « Tresses individuelles nettes, du format medium au XL, avec ou sans extensions. »
- **EN** — "Box Braids" · "Clean individual braids, from medium to XL, with or without extensions."
- **ES** — "Box Braids" · "Trenzas individuales definidas, del tamaño medio al XL, con o sin extensiones."

### Section 3 — Knotless Braids (`id: "knotless"`)

Images : `s-knotless.jpg`, `s-tresses-4.jpg`, `tresses-mimi-1.jpeg`

- **FR** — « Knotless Braids » · « Tresses sans nœud, légères et sans tension sur le cuir chevelu. »
- **EN** — "Knotless Braids" · "Knotless braids, lightweight with no tension on the scalp."
- **ES** — "Knotless Braids" · "Trenzas sin nudo, ligeras y sin tensión en el cuero cabelludo."

### Section 4 — Cornrows & Fulani (`id: "cornrows-fulani"`)

Images : `s-cornrows.jpg`, `s-fulani.jpg`

- **FR** — « Cornrows & Fulani » · « Tresses collées géométriques, ornées de perles cauris sur demande. »
- **EN** — "Cornrows & Fulani" · "Geometric cornrows, finished with cowrie beads on request."
- **ES** — "Cornrows y Fulani" · "Trenzas pegadas geométricas, con perlas cauri si se desea."

### Section 5 — Boho & Goddess (`id: "boho"`)

Images : `s-boho.jpg`, `s-tressage-mains.jpg`

- **FR** — « Boho & Goddess » · « Tresses bohème ondulées, effet naturel et volumineux. »
- **EN** — "Boho & Goddess" · "Wavy boho braids, for a natural and voluminous look."
- **ES** — "Boho y Goddess" · "Trenzas boho onduladas, efecto natural y voluminoso."

### Section 6 — Locks (`id: "locks"`)

Images : `s-depart-locks.jpg`, `s-retouche-locks.jpg`, `s-tresses-5.jpg`

- **FR** — « Locks » · « Pose de départ, entretien des racines et faux locks. »
- **EN** — "Locs" · "Starter locs, root maintenance and faux locs."
- **ES** — "Locks" · "Inicio de rastas, mantenimiento de raíz y faux locks."

### Section 7 — Enfants (`id: "enfants"`)

Images : `s-tresse-fille1.png`, `s-tresse-fille2.png`, `s-tresse-garcon.png`

- **FR** — « Enfants » · « Mini braids et tresses adaptées aux enfants, en douceur. »
- **EN** — "Children" · "Mini braids and gentle styles made for children."
- **ES** — "Niños" · "Mini trenzas y peinados suaves pensados para niños."

### Section 8 — Tresses rasta & afro (`id: "rasta-afro"`)

Images : `tresses-mimi-2.jpeg`, `tresses-mimi-3.jpeg`, `tresses-mimi-4.jpeg`, `tresses-mimi-5.jpeg`, `tresses-mimi-6.jpeg`, `tresses-mimi-7.jpeg`, `s-tresses-2.jpg`

- **FR** — « Tresses rasta & afro » · « Nos réalisations récentes en tresses africaines et rasta. »
- **EN** — "Rasta & afro braids" · "Our recent work in African and rasta braids."
- **ES** — "Trenzas rasta y afro" · "Nuestros trabajos recientes en trenzas africanas y rasta."

### Section 9 — En cabine (`id: "en-cabine"`)

Images : `s-tressage-action.jpg`

- **FR** — « En cabine » · « Le tressage en cours — plusieurs heures de savoir-faire. »
- **EN** — "In the chair" · "Braiding in progress — several hours of craftsmanship."
- **ES** — "En cabina" · "Trenzado en proceso — varias horas de oficio."

### Images retirées

`pomelli-image-1.png` à `pomelli-image-6.png` — retirées de `GalerieClient.tsx`.
Les fichiers restent dans `public/images/` (utilisés comme posters vidéo dans le
tableau `VIDEOS`, qui n'est pas modifié). Ne pas supprimer les fichiers.

### Textes `alt`

Chaque image conserve le `alt` défini actuellement dans `GalerieClient.tsx`.
Pour les images dont l'`alt` actuel est générique (`s-tresses-2.jpg` →
« Tresses africaines Salon Mimi Marrakech »), garder tel quel — pas de sur-optimisation.

## 5. Gestion des erreurs

Aucun cas d'erreur runtime : données statiques, pas de fetch, pas d'entrée utilisateur.
Le seul risque est un chemin d'image invalide → `next/image` afficherait une image
cassée. Mitigation : toutes les images listées sont vérifiées présentes dans
`public/images/` pendant l'implémentation (`ls`), et `npm run build` échoue si
`next/image` référence un fichier absent en import statique — ici ce sont des chemins
`src` string, donc la vérification `ls` manuelle est obligatoire avant commit.

## 6. Tests / vérification

Le projet n'a pas de script `npm test` ni `npm run test:e2e` (constaté :
`package.json` ne définit que `dev`, `build`, `lint`). Le dossier `e2e/` cible la
prod distante `https://mimi-coiffure.com` et n'est pas exécutable avant déploiement.

Vérifications applicables :

1. `npx tsc --noEmit` → aucune erreur TypeScript
2. `npm run build` → build de production réussi
3. Dev server + navigateur : ouvrir `/fr/galerie`, `/en/galerie`, `/es/galerie`
   - onglet Photos : 9 sections dans l'ordre, titres et phrases dans la bonne langue
   - toutes les images se chargent (aucune image cassée)
   - onglet Vidéos : inchangé, 11 vidéos
   - `read_console_messages` : aucune erreur
4. `git diff` relu : un seul fichier modifié (`GalerieClient.tsx`) + la spec

## 7. Non-régression

- Composant client isolé, pas de logique métier, pas d'état partagé → risque quasi nul
- URL, métadonnées SEO, canonical, hreflang : non touchés (fichier serveur inchangé)
- Onglet Vidéos et tableau `VIDEOS` : non touchés
- Les fichiers `pomelli-image-*.png` restent en place (posters vidéo)

## 8. Livraison

- Commit unique : `feat(galerie): catalogue par type de coiffure — 9 sections trilingues`
- Push sur `main` → déploiement automatique Railway
- Après déploiement : vérifier `/fr/galerie` en prod, onglet Photos, 3 langues
