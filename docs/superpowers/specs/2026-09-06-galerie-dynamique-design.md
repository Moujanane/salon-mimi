# Spec 1 — Galerie dynamique + refonte visuelle publique

Date : 2026-09-06
Statut : validé, prêt pour le plan d'implémentation

## Contexte

La galerie publique (`/[locale]/galerie`) affiche aujourd'hui ses médias depuis
deux tableaux codés en dur dans `components/sections/GalerieClient.tsx` :

- `SECTIONS[]` : ~30 photos réparties en 9 sections thématiques (Le salon, Box
  braids, Knotless, Cornrows & Fulani, Boho, Locks, Enfants, Rasta & afro, En
  cabine), chacune avec titre + description trilingues.
- `VIDEOS[]` : 8 vidéos servies via jsDelivr depuis le repo séparé
  `github.com/Moujanane/salon-mimi-media`.

Deux problèmes :

1. **Mouj ne peut pas gérer la galerie sans passer par le code / git.** Chaque
   ajout ou retrait de média demande une intervention développeur.
2. **Le design a vieilli.** Trop de sections empilées (page très longue),
   grille carrée basique, onglets Photos/Vidéos qui séparent, photos affichées
   en grand.

Cette spec couvre la **lecture dynamique** (la galerie lit une base de données)
et la **refonte visuelle publique**. L'interface d'administration pour
ajouter/supprimer les médias fait l'objet d'une **Spec 2 séparée**, livrée
ensuite.

## Objectifs

- La page galerie publique lit ses médias depuis une table Supabase
  `gallery_items`, plus depuis le code.
- Nouveau rendu : une seule grille masonry (colonnes à hauteurs variables),
  photos et vidéos mélangées, sans sections ni onglets.
- Clic sur un média → lightbox plein écran avec navigation.
- Vidéos chargées uniquement à l'approche (lazy-load) pour économiser la bande
  passante Supabase.
- Déploiement réversible : flag d'activation + ancien code conservé.
- Aucune régression SEO : contenu rendu côté serveur, texte indexable et
  JSON-LD conservés.

## Non-objectifs (hors périmètre de cette spec)

- L'interface admin d'upload / suppression / réordonnancement → **Spec 2**.
- Les filtres par catégorie sur la galerie publique (grille brute décidée ;
  la colonne `category` n'est pas créée maintenant, elle pourra l'être plus
  tard sans casser l'existant).
- Toute optimisation vidéo automatique à l'upload (transcodage) → Spec 2, elle
  concerne l'écriture.
- La suppression du repo `salon-mimi-media` : les fichiers vidéo actuels y
  restent, on les migre vers Supabase Storage une fois (voir Migration).

## Architecture

### Stockage des fichiers — Supabase Storage

Bucket **public** nommé `gallery`.

- Photos : compressées (~150 Ko, largeur max ~1400 px) avant upload.
- Vidéos : compressées H.264 (~1–2 Mo, largeur ~720 px) avant upload.

Pour cette Spec 1, l'upload est fait **une seule fois** par un script de
migration (voir section Migration). L'upload interactif depuis l'admin est en
Spec 2.

Justification bande passante : Supabase gratuit = 1 Go stockage (large : ~40
photos + ~30 vidéos compressées ≈ 150 Mo) + 5 Go/mois de transfert. Avec le
lazy-load des vidéos (chargées seulement à l'entrée dans le viewport) et des
fichiers compressés, la limite de transfert est confortable. Si elle est un
jour dépassée, le plan Supabase payant est à 25 $/mois — décision différée,
pas un blocage.

### Table `gallery_items`

```sql
create table if not exists gallery_items (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('photo', 'video')),
  url text not null,
  poster_url text,
  alt text not null default '',
  sort_order integer not null default 0,
  width integer,
  height integer,
  created_at timestamptz default now()
);

alter table gallery_items enable row level security;

-- Lecture publique : le site sert la galerie à tous les visiteurs.
create policy "gallery_items_select_anon"
  on gallery_items for select
  to anon
  using (true);

-- Lecture admin.
create policy "gallery_items_select_authenticated"
  on gallery_items for select
  to authenticated
  using (true);

-- Écriture réservée au service_role (API admin en Spec 2).
create policy "gallery_items_service_role_all"
  on gallery_items for all
  to service_role
  using (true)
  with check (true);

create index if not exists gallery_items_sort_idx
  on gallery_items (sort_order);
```

| Colonne            | Type               | Rôle                                                                                                                  |
| ------------------ | ------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `id`               | uuid               | identifiant auto                                                                                                      |
| `type`             | text               | `'photo'` ou `'video'`                                                                                                |
| `url`              | text               | URL publique du fichier dans le bucket `gallery`                                                                      |
| `poster_url`       | text (nullable)    | vidéos : image d'aperçu avant lecture                                                                                 |
| `alt`              | text               | texte alternatif SEO                                                                                                  |
| `sort_order`       | integer            | ordre d'affichage (croissant, plus petit = plus haut)                                                                 |
| `width` / `height` | integer (nullable) | dimensions du média — permettent de réserver la hauteur exacte dans le masonry, évite le saut de layout au chargement |
| `created_at`       | timestamptz        | auto                                                                                                                  |

**Mise à jour obligatoire de `supabase-schema.sql`** avec cette table et ses
policies (règle du handoff : toute modif RLS doit y être reflétée).

### Lecture côté serveur — `lib/gallery.ts`

Nouveau module sur le modèle de `lib/settings.ts` :

```ts
// lib/gallery.ts
import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";

export type GalleryItem = {
  id: string;
  type: "photo" | "video";
  url: string;
  poster_url: string | null;
  alt: string;
  sort_order: number;
  width: number | null;
  height: number | null;
};

async function fetchGalleryItems(): Promise<GalleryItem[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return [];

  const client = createClient(url, key);
  const { data, error } = await client
    .from("gallery_items")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !data) return [];
  return data as GalleryItem[];
}

export const getGalleryItems = unstable_cache(
  fetchGalleryItems,
  ["gallery-items"],
  { revalidate: 3600, tags: ["gallery-items"] },
);
```

`revalidate: 3600` aligné sur le `revalidate = 3600` déjà en tête de
`galerie/page.tsx`. Le tag `gallery-items` permettra à l'API admin (Spec 2)
d'invalider le cache après une modification via `revalidateTag`.

### Rendu — `app/[locale]/galerie/page.tsx`

Reste un Server Component. Ajouts :

1. `const items = await getGalleryItems();`
2. Choix du rendu selon le flag `NEXT_PUBLIC_GALLERY_DYNAMIC` :
   - `"true"` → nouveau composant `GalleryMasonry` alimenté par `items`
   - autre / absent → ancien `GalerieClient` inchangé (tableaux en dur)
3. Le **texte indexable trilingue** en haut de page est conservé, réécrit pour
   ne plus énumérer les sections (ex. « Tresses africaines, box braids,
   knotless, cornrows, locks, tresses rasta et coiffures enfants réalisées au
   Salon Mimi, Place Jamaa El Fna, Marrakech. »).
4. Le JSON-LD de la page (s'il y en a un spécifique galerie) est conservé tel
   quel.

### Nouveau composant — `components/sections/GalleryMasonry.tsx`

Client Component (`"use client"`), sans librairie externe.

**Grille masonry**

- CSS colonnes natives : `columns: 3` desktop, `columns: 2` tablette et mobile.
  `gap` via `column-gap` + `margin-bottom` sur chaque cellule, `break-inside:
avoid`.
- Chaque cellule garde les proportions du média : `aspect-ratio: <width> /
<height>` quand les dimensions sont connues (sinon `aspect-ratio: 4 / 5` par
  défaut). La place est réservée avant le chargement → pas de saut.
- Photos : `next/image` avec `fill` + `object-cover`, `sizes` adapté aux
  colonnes, `loading="lazy"`.
- Vidéos : vignette = `poster_url` (ou 1re frame), badge ▶ centré, **pas de
  lecture ni de chargement du fichier** tant que la vignette n'est pas visible.
  Techniquement : `<video preload="none">` + `IntersectionObserver` qui règle
  `preload="metadata"` et charge le poster quand la cellule entre dans le
  viewport. La lecture ne se déclenche jamais dans la grille — seulement dans
  la lightbox.

**Lightbox (plein écran au clic)**

- État local `openIndex: number | null`.
- Overlay `position: fixed; inset: 0` fond noir ~95 % d'opacité.
- Média centré, taille contrainte à `max-width: 92vw; max-height: 88vh`.
- Photo → `<img>` plein écran (pas `next/image`, on veut l'original).
- Vidéo → `<video controls autoPlay playsInline>` — la lecture est permise ici.
- Contrôles : flèches ‹ › (précédent / suivant, cyclique), croix de fermeture
  en haut à droite.
- Fermeture : clic sur le fond, touche `Échap`.
- Navigation clavier : `ArrowLeft` / `ArrowRight`.
- `document.body` overflow bloqué pendant l'ouverture, restauré à la fermeture.
- Piège connu du projet (leçon handoff) : ne pas appeler `window.open()` ni de
  navigation après un traitement asynchrone. Ici pas de fetch dans la lightbox,
  rien de concerné, mais le composant reste purement local.

**Accessibilité minimale**

- `role="dialog"` + `aria-modal="true"` sur l'overlay.
- Focus piégé dans la lightbox tant qu'elle est ouverte, rendu au déclencheur
  à la fermeture.
- `alt` de chaque média provient de la colonne `alt`.

### Ce qui disparaît du rendu

- Les onglets Photos / Vidéos.
- Les 9 titres de sections et leurs descriptions trilingues.
- La séparation photos / vidéos : tout est dans une grille unique, ordonnée par
  `sort_order`.

### Ce qui est conservé

- `components/sections/GalerieClient.tsx` et ses tableaux `SECTIONS[]` /
  `VIDEOS[]` : **non supprimés**. Servent de rendu de repli tant que le flag
  est à `false`, et de filet en cas de rollback.
- Le texte indexable trilingue (réécrit).
- Le `revalidate = 3600` de la page.

## Migration des médias existants

Un script `scripts/migrate-gallery.ts` (lancé une fois, en local, par le
développeur) :

1. Pour chaque photo de `public/images/` référencée dans `SECTIONS[]` : upload
   dans le bucket `gallery`, lecture des dimensions, insertion d'une ligne
   `gallery_items` (`type='photo'`, `alt` repris du tableau, `sort_order`
   incrémental).
2. Pour chaque vidéo de `VIDEOS[]` : téléchargement depuis jsDelivr, upload dans
   le bucket `gallery`, insertion (`type='video'`, `poster_url` = upload du
   poster actuel, `alt` dérivé du `title`).
3. `sort_order` : les 8 vidéos et ~30 photos sont intercalées dans un ordre
   choisi par Mouj (par défaut : photos d'abord dans l'ordre des sections
   actuelles, puis vidéos — ajustable ensuite depuis l'admin en Spec 2).

Le script est **idempotent** (ne réinsère pas si l'`url` existe déjà) et
n'écrit rien si les variables d'env Supabase sont absentes.

## Déploiement et rollback

### Séquence de mise en production

1. Créer la table `gallery_items` + policies dans le dashboard Supabase, mettre
   à jour `supabase-schema.sql`.
2. Créer le bucket public `gallery`.
3. Lancer `scripts/migrate-gallery.ts` en local (remplit table + bucket).
4. Déployer le code avec `NEXT_PUBLIC_GALLERY_DYNAMIC` **absent ou `"false"`**
   dans Railway → la galerie garde exactement l'ancien rendu. Vérifier qu'il
   n'y a aucun changement visible sur `/fr/galerie`, `/en/galerie`,
   `/es/galerie`.
5. Passer `NEXT_PUBLIC_GALLERY_DYNAMIC="true"` dans Railway → bascule sur le
   nouveau rendu (redéploiement Railway, ~2–3 min, car c'est une var
   `NEXT_PUBLIC_` bakée au build).
6. Vérifier le nouveau rendu sur les 3 langues : grille masonry, lightbox,
   lazy-load des vidéos, aucune erreur console, texte indexable présent.

### Rollback

- **Immédiat, sans redéploiement de code** : repasser
  `NEXT_PUBLIC_GALLERY_DYNAMIC` à `"false"` dans Railway (redéploiement Railway
  seul, ~2 min). La galerie reprend l'ancien rendu.
- **Rollback complet du code** : `git revert <commit>` + `git push`. L'ancien
  `GalerieClient` étant conservé, la galerie est identique à avant.
- La table `gallery_items` et le bucket peuvent rester en place sans effet
  (l'ancien code ne les lit pas). Aucun nettoyage requis pour un rollback.

### Nettoyage post-validation

Une fois Mouj satisfait du nouveau design (après quelques jours en prod) :
commit de nettoyage qui retire le flag, l'ancien `GalerieClient`, et les
tableaux `SECTIONS[]` / `VIDEOS[]`. Optionnel, non bloquant.

## Vérifications (règles du projet)

- `npx tsc --noEmit`
- `npm run build` (38 pages générées)
- `npx playwright test` — la suite complète passe (les specs SEO
  `seo-canonical`, `seo-cache-headers`, `site` en particulier).
- Ajout d'une spec Playwright `e2e/galerie.spec.ts` :
  - `/fr/galerie` répond 200 et contient au moins un média
  - le HTML initial (rendu serveur) contient les URLs des médias (SEO)
  - clic sur une vignette ouvre la lightbox ; `Échap` la ferme
  - avec le flag à `false`, l'ancien rendu (onglets Photos/Vidéos) est présent
- Vérif navigateur manuelle sur `/fr`, `/en`, `/es` : masonry, lightbox,
  lazy-load vidéos, pas de scroll horizontal mobile, pas d'erreur console.
- Vérif que le JSON-LD global du site (chantier AI-readiness) n'est pas affecté.

## Fichiers touchés

| Fichier                                  | Nature                                                                  |
| ---------------------------------------- | ----------------------------------------------------------------------- |
| `supabase-schema.sql`                    | + table `gallery_items` + policies                                      |
| `lib/gallery.ts`                         | **créé** — `getGalleryItems()`                                          |
| `components/sections/GalleryMasonry.tsx` | **créé** — grille masonry + lightbox                                    |
| `app/[locale]/galerie/page.tsx`          | fetch Supabase + choix de rendu selon le flag + texte indexable réécrit |
| `components/sections/GalerieClient.tsx`  | **conservé tel quel** (repli)                                           |
| `scripts/migrate-gallery.ts`             | **créé** — migration unique des médias existants                        |
| `e2e/galerie.spec.ts`                    | **créé** — tests galerie                                                |
| `.env.example` / doc Railway             | + `NEXT_PUBLIC_GALLERY_DYNAMIC`                                         |

## Risques

| Risque                                                                            | Mitigation                                                                                                                  |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Le nouveau design ne plaît pas                                                    | Flag réversible en ~2 min sans toucher au code ; ancien rendu conservé                                                      |
| Bande passante Supabase dépassée                                                  | Vidéos compressées + lazy-load ; surveiller le dashboard Supabase la 1re semaine ; plan payant 25 $/mois si besoin          |
| Masonry CSS colonnes : ordre de lecture vertical par colonne, pas ligne par ligne | Accepté — `sort_order` reste respecté colonne par colonne ; c'est le comportement attendu d'un mur d'images                 |
| Saut de layout au chargement des images                                           | `width`/`height` en base → `aspect-ratio` CSS, hauteur réservée d'avance                                                    |
| Migration : une vidéo jsDelivr injoignable au moment du script                    | Script idempotent, relançable ; log clair des échecs                                                                        |
| RLS mal configurée → galerie vide en prod                                         | Policy `select` pour `anon` testée immédiatement après création (règle handoff : tester le dashboard après toute modif RLS) |

## Spec 2 (aperçu, hors périmètre)

Interface `/admin/galerie` : grille des médias avec icône poubelle (suppression
définitive + confirmation), bloc « Ajouter une photo / vidéo » avec upload +
compression serveur, édition du `alt`, réordonnancement (glisser-déposer sur
`sort_order`). API routes protégées par l'auth admin existante, écritures via
`service_role`, invalidation du cache via `revalidateTag("gallery-items")`.
