# Galerie dynamique + refonte visuelle — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** La galerie publique lit ses médias depuis une table Supabase au lieu du code, avec un nouveau rendu grille masonry + lightbox, activable/désactivable par un flag pour un déploiement réversible.

**Architecture:** Une table Supabase `gallery_items` + un bucket Storage `gallery` remplacent les tableaux `SECTIONS[]` / `VIDEOS[]` codés en dur. `lib/gallery.ts` lit la table côté serveur (cache `unstable_cache`, tag `gallery-items`). `app/[locale]/galerie/page.tsx` choisit entre l'ancien rendu (`GalerieClient`, conservé) et le nouveau (`GalleryMasonry`) selon `NEXT_PUBLIC_GALLERY_DYNAMIC`. Un script `scripts/migrate-gallery.ts` migre les ~38 médias existants une fois.

**Tech Stack:** Next.js 15 App Router, React 18, Supabase (Postgres + Storage), TypeScript strict, Playwright, `sharp` (dimensions images, déjà installé), `ffprobe` (dimensions vidéos, déjà sur la machine), `tsx` (à ajouter en devDep, exécution du script de migration).

---

## File Structure

| Fichier                                  | Responsabilité                                                                                                   | Nature   |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------- |
| `supabase-schema.sql`                    | Documentation du schéma réel — ajout de `gallery_items` + policies                                               | Modif    |
| `lib/gallery.ts`                         | Lecture serveur cachée de `gallery_items` (`getGalleryItems()`) + type `GalleryItem`                             | Création |
| `components/sections/GalleryMasonry.tsx` | Nouveau rendu : grille masonry CSS-colonnes + lightbox plein écran, lazy-load vidéos. Aucune dépendance externe. | Création |
| `app/[locale]/galerie/page.tsx`          | Fetch `getGalleryItems()`, choix de rendu via flag, texte indexable réécrit                                      | Modif    |
| `components/sections/GalerieClient.tsx`  | Ancien rendu — **inchangé**, sert de repli                                                                       | Intact   |
| `scripts/migrate-gallery.ts`             | Migration unique : upload des médias existants vers le bucket + insertion des lignes                             | Création |
| `e2e/galerie.spec.ts`                    | Tests : rendu SSR, lightbox, repli via flag                                                                      | Création |
| `.env.example`                           | Documente `NEXT_PUBLIC_GALLERY_DYNAMIC`                                                                          | Modif    |
| `package.json`                           | `tsx` en devDep + script `migrate:gallery`                                                                       | Modif    |

---

## Task 1 : Créer la table `gallery_items` dans Supabase + documenter le schéma

**Files:**

- Modify: `supabase-schema.sql` (fin du fichier)
- Action manuelle : dashboard Supabase (SQL Editor)

- [ ] **Step 1 : Appliquer le SQL dans le dashboard Supabase**

Ouvrir le dashboard Supabase du projet Salon Mimi → SQL Editor → coller et exécuter :

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

create policy "gallery_items_select_anon"
  on gallery_items for select
  to anon
  using (true);

create policy "gallery_items_select_authenticated"
  on gallery_items for select
  to authenticated
  using (true);

create policy "gallery_items_service_role_all"
  on gallery_items for all
  to service_role
  using (true)
  with check (true);

create index if not exists gallery_items_sort_idx
  on gallery_items (sort_order);
```

- [ ] **Step 2 : Créer le bucket Storage**

Dashboard Supabase → Storage → New bucket : nom `gallery`, **Public bucket** coché. Créer.

- [ ] **Step 3 : Vérifier l'accès `anon` en lecture**

Dashboard Supabase → SQL Editor :

```sql
set role anon;
select count(*) from gallery_items;
reset role;
```

Attendu : `0` (table vide, pas d'erreur de permission). Si erreur `permission denied`, la policy `select_anon` n'est pas active — la recréer.

- [ ] **Step 4 : Documenter dans `supabase-schema.sql`**

Ajouter à la fin de `supabase-schema.sql` :

```sql
-- ============================================================
-- Table: gallery_items
-- ============================================================
-- Médias de la galerie publique (/[locale]/galerie), gérés depuis /admin
-- (Spec 2). Remplace les tableaux SECTIONS[] / VIDEOS[] codés en dur dans
-- components/sections/GalerieClient.tsx.
-- Fichiers hébergés dans le bucket Storage public "gallery".
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

-- Lecture publique : le site sert la galerie à tous les visiteurs (client anon).
-- CRITIQUE : sans cette policy la galerie publique est vide en prod.
create policy "gallery_items_select_anon"
  on gallery_items for select
  to anon
  using (true);

-- Lecture admin (dashboard).
create policy "gallery_items_select_authenticated"
  on gallery_items for select
  to authenticated
  using (true);

-- Écriture réservée au service_role : toutes les mutations (INSERT/UPDATE/
-- DELETE) passent par les API routes admin de la Spec 2, côté serveur.
create policy "gallery_items_service_role_all"
  on gallery_items for all
  to service_role
  using (true)
  with check (true);

create index if not exists gallery_items_sort_idx
  on gallery_items (sort_order);
```

- [ ] **Step 5 : Commit**

```bash
git add supabase-schema.sql
git commit -m "docs(db): schema gallery_items pour la galerie dynamique"
```

---

## Task 2 : `lib/gallery.ts` — lecture serveur cachée

**Files:**

- Create: `lib/gallery.ts`
- Test: `lib/gallery.test.ts`

- [ ] **Step 1 : Écrire le test qui échoue**

Créer `lib/gallery.test.ts` :

```ts
import { describe, it, expect } from "vitest";
import type { GalleryItem } from "./gallery";
import { getGalleryItems } from "./gallery";

describe("lib/gallery", () => {
  it("exporte getGalleryItems comme fonction", () => {
    expect(typeof getGalleryItems).toBe("function");
  });

  it("retourne un tableau vide si les variables d'env Supabase sont absentes", async () => {
    const prevUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const prevKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    const items = await getGalleryItems();
    expect(Array.isArray(items)).toBe(true);
    expect(items).toEqual([]);

    if (prevUrl) process.env.NEXT_PUBLIC_SUPABASE_URL = prevUrl;
    if (prevKey) process.env.SUPABASE_SERVICE_ROLE_KEY = prevKey;
  });

  it("le type GalleryItem a les champs attendus", () => {
    const sample: GalleryItem = {
      id: "x",
      type: "photo",
      url: "https://example.com/a.jpg",
      poster_url: null,
      alt: "alt",
      sort_order: 0,
      width: 800,
      height: 1000,
    };
    expect(sample.type).toBe("photo");
  });
});
```

**Note :** le projet n'a pas de runner Vitest configuré (pas de `npm run test`). Ajouter Vitest est hors périmètre. **À la place**, ce fichier test sert de spec de référence ; la vérification réelle se fait par `npx tsc --noEmit` (types) + le test e2e de la Task 7 (comportement). Renommer le fichier en `lib/gallery.reference.ts` s'il fait échouer `tsc` faute de `vitest` — ou installer `vitest` en devDep si l'équipe le souhaite. **Décision par défaut : ne pas créer ce fichier test, se reposer sur `tsc` + e2e.** Passer directement au Step 2.

- [ ] **Step 2 : Écrire `lib/gallery.ts`**

Créer `lib/gallery.ts` :

```ts
// lib/gallery.ts
//
// Lecture serveur des médias de la galerie publique.
// Modèle identique à lib/settings.ts : client supabase-js avec la
// service_role key, résultat mis en cache par unstable_cache avec le tag
// "gallery-items" (que l'API admin de la Spec 2 invalidera après chaque
// modification).

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

  if (!url || !key) {
    return [];
  }

  const client = createClient(url, key);
  const { data, error } = await client
    .from("gallery_items")
    .select("id, type, url, poster_url, alt, sort_order, width, height")
    .order("sort_order", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data as GalleryItem[];
}

export const getGalleryItems = unstable_cache(
  fetchGalleryItems,
  ["gallery-items"],
  { revalidate: 3600, tags: ["gallery-items"] },
);
```

- [ ] **Step 3 : Vérifier les types**

Run: `npx tsc --noEmit`
Expected: PASS (aucune erreur)

- [ ] **Step 4 : Commit**

```bash
git add lib/gallery.ts
git commit -m "feat(galerie): lib/gallery.ts — lecture serveur cachee de gallery_items"
```

---

## Task 3 : `GalleryMasonry.tsx` — grille masonry (sans lightbox pour l'instant)

**Files:**

- Create: `components/sections/GalleryMasonry.tsx`

- [ ] **Step 1 : Écrire le composant grille (photos + vidéos, pas encore de lightbox)**

Créer `components/sections/GalleryMasonry.tsx` :

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { GalleryItem } from "@/lib/gallery";

const DEFAULT_RATIO = "4 / 5";

function ratioOf(item: GalleryItem): string {
  if (item.width && item.height && item.width > 0 && item.height > 0) {
    return `${item.width} / ${item.height}`;
  }
  return DEFAULT_RATIO;
}

/** Une cellule vidéo : poster + badge lecture, fichier chargé seulement à l'approche. */
function VideoCell({
  item,
  onOpen,
}: {
  item: GalleryItem;
  onOpen: () => void;
}) {
  const ref = useRef<HTMLButtonElement | null>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [near]);

  return (
    <button
      ref={ref}
      type="button"
      onClick={onOpen}
      className="group relative block w-full overflow-hidden rounded-xl bg-gray-800"
      style={{ aspectRatio: ratioOf(item) }}
      aria-label={item.alt || "Voir la vidéo"}
    >
      {near && item.poster_url ? (
        <img
          src={item.poster_url}
          alt={item.alt}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <span className="absolute inset-0 bg-gray-800" />
      )}
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/45 text-white text-lg">
          ▶
        </span>
      </span>
    </button>
  );
}

/** Une cellule photo. */
function PhotoCell({
  item,
  onOpen,
}: {
  item: GalleryItem;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative block w-full overflow-hidden rounded-xl bg-gray-800"
      style={{ aspectRatio: ratioOf(item) }}
      aria-label={item.alt || "Agrandir la photo"}
    >
      <Image
        src={item.url}
        alt={item.alt}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        sizes="(max-width: 768px) 50vw, 33vw"
        loading="lazy"
      />
    </button>
  );
}

export default function GalleryMasonry({ items }: { items: GalleryItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-brun/50">
        La galerie sera bientôt disponible.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div
        className="[column-gap:12px] [columns:2] md:[columns:3]"
        style={{ columnFill: "balance" }}
      >
        {items.map((item, i) => (
          <div key={item.id} className="mb-3 break-inside-avoid">
            {item.type === "video" ? (
              <VideoCell item={item} onOpen={() => setOpenIndex(i)} />
            ) : (
              <PhotoCell item={item} onOpen={() => setOpenIndex(i)} />
            )}
          </div>
        ))}
      </div>

      {/* Lightbox ajoutée en Task 4 — placeholder d'état pour l'instant */}
      {openIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          onClick={() => setOpenIndex(null)}
        >
          <p className="text-white">Lightbox — Task 4</p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2 : Vérifier les types**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 3 : Commit**

```bash
git add components/sections/GalleryMasonry.tsx
git commit -m "feat(galerie): GalleryMasonry — grille masonry photos + videos (lazy)"
```

---

## Task 4 : Lightbox plein écran dans `GalleryMasonry.tsx`

**Files:**

- Modify: `components/sections/GalleryMasonry.tsx`

- [ ] **Step 1 : Remplacer le placeholder lightbox par le vrai composant**

Dans `components/sections/GalleryMasonry.tsx`, remplacer le bloc
`{openIndex !== null && ( ... )}` par un appel à un composant `<Lightbox>` et
ajouter ce composant dans le même fichier, au-dessus de `GalleryMasonry` :

```tsx
function Lightbox({
  items,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  items: GalleryItem[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const item = items[index];
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    closeBtnRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, onPrev, onNext]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Média en plein écran"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
      onClick={onClose}
    >
      <button
        ref={closeBtnRef}
        type="button"
        onClick={onClose}
        aria-label="Fermer"
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20"
      >
        ×
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        aria-label="Précédent"
        className="absolute left-2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-3xl text-white hover:bg-white/20 md:left-6"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        aria-label="Suivant"
        className="absolute right-2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-3xl text-white hover:bg-white/20 md:right-6"
      >
        ›
      </button>

      <div
        className="max-h-[88vh] max-w-[92vw]"
        onClick={(e) => e.stopPropagation()}
      >
        {item.type === "video" ? (
          <video
            src={item.url}
            poster={item.poster_url ?? undefined}
            controls
            autoPlay
            playsInline
            className="max-h-[88vh] max-w-[92vw] rounded-lg bg-black"
          />
        ) : (
          <img
            src={item.url}
            alt={item.alt}
            className="max-h-[88vh] max-w-[92vw] rounded-lg object-contain"
          />
        )}
      </div>
    </div>
  );
}
```

Et dans `GalleryMasonry`, remplacer le placeholder par :

```tsx
{
  openIndex !== null && (
    <Lightbox
      items={items}
      index={openIndex}
      onClose={() => setOpenIndex(null)}
      onPrev={() =>
        setOpenIndex((i) =>
          i === null ? null : (i - 1 + items.length) % items.length,
        )
      }
      onNext={() =>
        setOpenIndex((i) => (i === null ? null : (i + 1) % items.length))
      }
    />
  );
}
```

- [ ] **Step 2 : Vérifier les types**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 3 : Commit**

```bash
git add components/sections/GalleryMasonry.tsx
git commit -m "feat(galerie): lightbox plein ecran avec navigation clavier"
```

---

## Task 5 : Brancher le flag dans `app/[locale]/galerie/page.tsx`

**Files:**

- Modify: `app/[locale]/galerie/page.tsx`

- [ ] **Step 1 : Modifier la page pour fetch + choix de rendu**

Remplacer le corps de `app/[locale]/galerie/page.tsx` (garder `generateMetadata` et `revalidate` intacts) :

```tsx
export const revalidate = 3600;

import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import GalerieClient from "@/components/sections/GalerieClient";
import GalleryMasonry from "@/components/sections/GalleryMasonry";
import { getGalleryItems } from "@/lib/gallery";

// ... generateMetadata inchangé ...

const titles: Record<string, string> = {
  fr: "Galerie photos — Tresses africaines Marrakech",
  en: "Photo gallery — African braids Marrakech",
  es: "Galería de fotos — Trenzas africanas Marrakech",
};

const subtitles: Record<string, string> = {
  fr: "Nos réalisations",
  en: "Our work",
  es: "Nuestras creaciones",
};

const indexText: Record<string, string> = {
  fr: "Tresses africaines, box braids, knotless braids, cornrows, locks, tresses rasta et coiffures enfants réalisées au Salon Mimi, Place Jamaa El Fna, Marrakech.",
  en: "African braids, box braids, knotless braids, cornrows, locks, rasta braids and children's styles done at Salon Mimi, Jamaa El Fna Square, Marrakech.",
  es: "Trenzas africanas, box braids, knotless braids, cornrows, locks, trenzas rasta y peinados infantiles realizados en el Salon Mimi, Plaza Jamaa El Fna, Marrakech.",
};

const GALLERY_DYNAMIC = process.env.NEXT_PUBLIC_GALLERY_DYNAMIC === "true";

export default async function GaleriePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const displayLocale = locale || "fr";

  const items = GALLERY_DYNAMIC ? await getGalleryItems() : [];

  return (
    <div className="bg-fond min-h-screen">
      <div className="bg-nuit py-16 text-center">
        <h1 className="font-playfair text-5xl text-or">
          {titles[displayLocale] ?? titles.fr}
        </h1>
        <p className="text-white/60 mt-3">
          {subtitles[displayLocale] ?? subtitles.fr}
        </p>
      </div>
      <div className="max-w-2xl mx-auto px-4 pt-10 text-center">
        <p className="text-brun/60 text-sm leading-relaxed">
          {indexText[displayLocale] ?? indexText.fr}
        </p>
      </div>
      {GALLERY_DYNAMIC ? (
        <GalleryMasonry items={items} />
      ) : (
        <GalerieClient locale={displayLocale} />
      )}
    </div>
  );
}
```

- [ ] **Step 2 : Vérifier les types + build**

Run: `npx tsc --noEmit && npm run build`
Expected: PASS, 38 pages générées

- [ ] **Step 3 : Vérifier le rendu par défaut (flag absent = ancien rendu)**

```bash
pkill -9 -f next-server 2>/dev/null; sleep 1
/usr/local/Cellar/trash/0.9.2/bin/trash .next 2>/dev/null
npm run build && (PORT=3100 npm run start &) && sleep 8
curl -s http://localhost:3100/fr/galerie | grep -c "Photos\|Vidéos"
```

Expected: > 0 (les onglets Photos/Vidéos de l'ancien `GalerieClient` sont présents car `NEXT_PUBLIC_GALLERY_DYNAMIC` n'est pas `"true"`).

```bash
pkill -9 -f next-server 2>/dev/null
```

- [ ] **Step 4 : Commit**

```bash
git add app/[locale]/galerie/page.tsx
git commit -m "feat(galerie): flag NEXT_PUBLIC_GALLERY_DYNAMIC — ancien rendu par defaut"
```

---

## Task 6 : Script de migration `scripts/migrate-gallery.ts`

**Files:**

- Modify: `package.json` (devDep `tsx` + script `migrate:gallery`)
- Create: `scripts/migrate-gallery.ts`

- [ ] **Step 1 : Ajouter `tsx` en devDep**

```bash
npm install --save-dev tsx
```

Puis ajouter dans `package.json`, section `scripts` :

```json
    "migrate:gallery": "tsx scripts/migrate-gallery.ts"
```

- [ ] **Step 2 : Écrire le script de migration**

Créer `scripts/migrate-gallery.ts` :

```ts
// scripts/migrate-gallery.ts
//
// Migration UNIQUE des médias existants (photos public/images/ + vidéos jsDelivr
// référencées dans components/sections/GalerieClient.tsx) vers :
//   - le bucket Supabase Storage "gallery"
//   - la table "gallery_items"
//
// Idempotent : ne réinsère pas une ligne si son `url` finale existe déjà.
// N'écrit rien si NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY absents.
//
// Lancer : npm run migrate:gallery
// Prérequis : ffprobe sur le PATH (dimensions vidéo), variables Supabase dans
// l'environnement (charger .env.local au besoin : `set -a; source .env.local`).

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Variables Supabase absentes. Abandon (aucune écriture).");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
const PUBLIC_URL_BASE = `${SUPABASE_URL}/storage/v1/object/public/gallery`;
const REPO_ROOT = process.cwd();

// --- Sources : listes reprises telles quelles de GalerieClient.tsx ---
// (photos avec leur alt et l'ordre des sections actuelles)
type PhotoSrc = { file: string; alt: string };
const PHOTOS: PhotoSrc[] = [
  {
    file: "salon-mimi-1.jpeg",
    alt: "Salon Mimi Marrakech — intérieur salon coiffure africaine",
  },
  {
    file: "salon-mimi-2.jpeg",
    alt: "Salon Mimi Marrakech — ambiance salon tresses africaines",
  },
  {
    file: "salon-mimi-3.jpeg",
    alt: "Salon Mimi Marrakech — coiffeuse au travail Place Jamaa El Fna",
  },
  {
    file: "hero-salon.jpg",
    alt: "Salon Mimi Marrakech — coiffeuse africaine Médina",
  },
  {
    file: "s-box-braids-longues.jpg",
    alt: "Box braids longues Salon Mimi Marrakech",
  },
  {
    file: "s-box-braids-profil.jpg",
    alt: "Box braids profil Salon Mimi Marrakech",
  },
  { file: "s-box-braids-xl.jpg", alt: "Box braids XL Salon Mimi Marrakech" },
  {
    file: "s-tresses-3.jpg",
    alt: "Tresses africaines Salon Mimi Marrakech — box braids",
  },
  {
    file: "coiffure-1.jpg",
    alt: "Box braids knotless Salon Mimi Marrakech — Place Jamaa El Fna",
  },
  { file: "s-knotless.jpg", alt: "Knotless braids Salon Mimi Marrakech" },
  {
    file: "s-tresses-4.jpg",
    alt: "Tresses africaines Salon Mimi Marrakech — knotless",
  },
  {
    file: "tresses-mimi-1.jpeg",
    alt: "Tresses africaines Salon Mimi Marrakech — réalisation knotless",
  },
  {
    file: "s-cornrows.jpg",
    alt: "Cornrows Salon Mimi Marrakech — tresses collées africaines",
  },
  { file: "s-fulani.jpg", alt: "Tresses Fulani Salon Mimi Marrakech" },
  {
    file: "cornrows-mimi-2509-1.jpeg",
    alt: "Cornrows dessin spirale Salon Mimi Marrakech — tresses collées géométriques",
  },
  { file: "s-boho.jpg", alt: "Tresses Boho Salon Mimi Marrakech" },
  {
    file: "s-tressage-mains.jpg",
    alt: "Mains tresseuse Salon Mimi Marrakech — savoir-faire africain",
  },
  {
    file: "boho-mimi-2509-1.jpeg",
    alt: "Tresses boho cornrows et boucles Salon Mimi Marrakech — effet naturel",
  },
  {
    file: "s-depart-locks.jpg",
    alt: "Départ locks Salon Mimi Marrakech — pose de locks",
  },
  {
    file: "s-retouche-locks.jpg",
    alt: "Retouche locks Salon Mimi Marrakech — entretien locks",
  },
  {
    file: "s-tresses-5.jpg",
    alt: "Tresses africaines Salon Mimi Marrakech — locks",
  },
  { file: "s-tresse-fille1.png", alt: "Tresses fille Salon Mimi Marrakech" },
  {
    file: "s-tresse-fille2.png",
    alt: "Tresses petite fille Salon Mimi Marrakech",
  },
  { file: "s-tresse-garcon.png", alt: "Tresses garçon Salon Mimi Marrakech" },
  {
    file: "tresses-mimi-2.jpeg",
    alt: "Box braids Salon Mimi Marrakech — tresses africaines Médina",
  },
  {
    file: "tresses-mimi-3.jpeg",
    alt: "Tresses rasta Salon Mimi Marrakech — coiffure afro Marrakech",
  },
  {
    file: "tresses-mimi-4.jpeg",
    alt: "Tresses africaines Salon Mimi — Place Jamaa El Fna Marrakech",
  },
  {
    file: "tresses-mimi-5.jpeg",
    alt: "Tresses africaines Salon Mimi Marrakech — juin 2026",
  },
  {
    file: "tresses-mimi-6.jpeg",
    alt: "Tresses africaines Salon Mimi — réalisation récente",
  },
  {
    file: "tresses-mimi-7.jpeg",
    alt: "Coiffure afro Salon Mimi Marrakech — tresses récentes",
  },
  { file: "s-tresses-2.jpg", alt: "Tresses africaines Salon Mimi Marrakech" },
  {
    file: "s-tressage-action.jpg",
    alt: "Tressage en cours Salon Mimi Marrakech",
  },
];

type VideoSrc = { file: string; alt: string; poster: string };
const VIDEOS: VideoSrc[] = [
  {
    file: "tresses-mimi-wa-1.mp4",
    alt: "Tresses — Salon Mimi Marrakech",
    poster: "tresses-mimi-5.jpeg",
  },
  {
    file: "tresses-mimi-wa-2.mp4",
    alt: "Coiffure afro — Salon Mimi Marrakech",
    poster: "tresses-mimi-6.jpeg",
  },
  {
    file: "salon-mimi-vid-1.mp4",
    alt: "Coiffure afro — Médina Marrakech",
    poster: "s-fulani.jpg",
  },
  {
    file: "salon-mimi-vid-2.mp4",
    alt: "Salon Mimi — Place Jamaa El Fna Marrakech",
    poster: "s-boho.jpg",
  },
  {
    file: "salon-mimi-boxbraids-2509-1.mp4",
    alt: "Box braids longues Salon Mimi Marrakech",
    poster: "s-box-braids-xl.jpg",
  },
  {
    file: "salon-mimi-twists-2509-1.mp4",
    alt: "Twists Salon Mimi Marrakech",
    poster: "s-marley.webp",
  },
  {
    file: "salon-mimi-enfants-2509-1.mp4",
    alt: "Tresses enfants Salon Mimi Marrakech",
    poster: "s-tresse-fille1.png",
  },
  {
    file: "salon-mimi-enfants-2509-2.mp4",
    alt: "Cornrows enfants Salon Mimi Marrakech",
    poster: "s-tresse-garcon.png",
  },
];

const JSDELIVR_BASE = "https://cdn.jsdelivr.net/gh/Moujanane/salon-mimi-media";

async function alreadyMigrated(url: string): Promise<boolean> {
  const { data } = await supabase
    .from("gallery_items")
    .select("id")
    .eq("url", url)
    .limit(1);
  return !!data && data.length > 0;
}

async function uploadBuffer(
  path: string,
  buf: Buffer,
  contentType: string,
): Promise<string> {
  const { error } = await supabase.storage
    .from("gallery")
    .upload(path, buf, { contentType, upsert: true });
  if (error) throw error;
  return `${PUBLIC_URL_BASE}/${path}`;
}

function videoDimensions(buf: Buffer): { w: number; h: number } | null {
  try {
    // ffprobe lit depuis stdin
    const out = execFileSync(
      "ffprobe",
      [
        "-v",
        "error",
        "-select_streams",
        "v:0",
        "-show_entries",
        "stream=width,height",
        "-of",
        "csv=p=0:s=x",
        "-",
      ],
      { input: buf },
    )
      .toString()
      .trim();
    const [w, h] = out.split("x").map((n) => parseInt(n, 10));
    if (w > 0 && h > 0) return { w, h };
  } catch {
    /* ignore */
  }
  return null;
}

async function main() {
  let order = 0;
  let inserted = 0;
  let skipped = 0;

  // --- Photos ---
  for (const p of PHOTOS) {
    const finalUrl = `${PUBLIC_URL_BASE}/photos/${p.file}`;
    if (await alreadyMigrated(finalUrl)) {
      skipped++;
      order++;
      continue;
    }
    const localPath = join(REPO_ROOT, "public", "images", p.file);
    let buf: Buffer;
    try {
      buf = readFileSync(localPath);
    } catch {
      console.warn(`  photo introuvable, ignorée : ${p.file}`);
      order++;
      continue;
    }
    const meta = await sharp(buf).metadata();
    const url = await uploadBuffer(
      `photos/${p.file}`,
      buf,
      p.file.endsWith(".png") ? "image/png" : "image/jpeg",
    );
    const { error } = await supabase.from("gallery_items").insert({
      type: "photo",
      url,
      poster_url: null,
      alt: p.alt,
      sort_order: order,
      width: meta.width ?? null,
      height: meta.height ?? null,
    });
    if (error) throw error;
    inserted++;
    order++;
    console.log(`  photo OK : ${p.file}`);
  }

  // --- Vidéos ---
  for (const v of VIDEOS) {
    const finalUrl = `${PUBLIC_URL_BASE}/videos/${v.file}`;
    if (await alreadyMigrated(finalUrl)) {
      skipped++;
      order++;
      continue;
    }
    const res = await fetch(`${JSDELIVR_BASE}/${v.file}`);
    if (!res.ok) {
      console.warn(`  vidéo injoignable (${res.status}), ignorée : ${v.file}`);
      order++;
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const dims = videoDimensions(buf);
    const url = await uploadBuffer(`videos/${v.file}`, buf, "video/mp4");

    // poster : upload de l'image locale correspondante si elle existe
    let posterUrl: string | null = null;
    try {
      const posterBuf = readFileSync(
        join(REPO_ROOT, "public", "images", v.poster),
      );
      posterUrl = await uploadBuffer(
        `posters/${v.poster}`,
        posterBuf,
        v.poster.endsWith(".png")
          ? "image/png"
          : v.poster.endsWith(".webp")
            ? "image/webp"
            : "image/jpeg",
      );
    } catch {
      console.warn(`  poster introuvable pour ${v.file} : ${v.poster}`);
    }

    const { error } = await supabase.from("gallery_items").insert({
      type: "video",
      url,
      poster_url: posterUrl,
      alt: v.alt,
      sort_order: order,
      width: dims?.w ?? null,
      height: dims?.h ?? null,
    });
    if (error) throw error;
    inserted++;
    order++;
    console.log(`  vidéo OK : ${v.file}`);
  }

  console.log(
    `\nMigration terminée : ${inserted} insérés, ${skipped} déjà présents.`,
  );
}

main().catch((e) => {
  console.error("Échec de la migration :", e);
  process.exit(1);
});
```

- [ ] **Step 3 : Vérifier les types du script**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 4 : Lancer la migration (une fois, en local)**

```bash
set -a; source .env.local; set +a
npm run migrate:gallery
```

Expected: liste de `photo OK` / `vidéo OK`, puis `Migration terminée : N insérés, 0 déjà présents.` (N ≈ 38, moins les fichiers introuvables signalés).

- [ ] **Step 5 : Vérifier en base**

Dashboard Supabase → Table Editor → `gallery_items` : ~38 lignes, `sort_order` de 0 à N, `width`/`height` renseignés, `url` pointant vers `.../storage/v1/object/public/gallery/...`.

- [ ] **Step 6 : Relancer pour vérifier l'idempotence**

```bash
npm run migrate:gallery
```

Expected: `Migration terminée : 0 insérés, N déjà présents.`

- [ ] **Step 7 : Commit**

```bash
git add package.json package-lock.json scripts/migrate-gallery.ts
git commit -m "feat(galerie): script de migration unique des medias existants"
```

---

## Task 7 : Test e2e `e2e/galerie.spec.ts`

**Files:**

- Create: `e2e/galerie.spec.ts`

- [ ] **Step 1 : Écrire le test**

Créer `e2e/galerie.spec.ts` :

```ts
import { test, expect } from "@playwright/test";

// Ces tests s'exécutent contre l'URL PLAYWRIGHT_BASE_URL (prod par défaut,
// localhost:3100 en local). Le comportement dépend du flag
// NEXT_PUBLIC_GALLERY_DYNAMIC de l'environnement testé.

test.describe("Galerie", () => {
  test("la page répond et affiche un titre", async ({ page }) => {
    const res = await page.goto("/fr/galerie");
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toContainText(/galerie/i);
  });

  test("le texte indexable est présent (SEO)", async ({ page }) => {
    await page.goto("/fr/galerie");
    await expect(page.locator("body")).toContainText(
      /Place Jamaa El Fna, Marrakech/,
    );
  });

  test("au moins un média est affiché", async ({ page }) => {
    await page.goto("/fr/galerie");
    // soit l'ancien rendu (img dans .grid), soit le nouveau (masonry)
    const media = page.locator("img, video");
    await expect(media.first()).toBeVisible();
  });

  test("ouvrir puis fermer un média en plein écran", async ({ page }) => {
    await page.goto("/fr/galerie");

    // Nouveau rendu : les cellules sont des <button>. Ancien rendu : pas de
    // lightbox — on saute le test proprement.
    const cell = page
      .locator(
        "button[aria-label*='photo'], button[aria-label*='vidéo'], button[aria-label*='Agrandir'], button[aria-label*='Voir']",
      )
      .first();
    const hasLightbox = (await cell.count()) > 0;
    test.skip(!hasLightbox, "Lightbox absente (ancien rendu, flag off)");

    await cell.click();
    const dialog = page.locator("[role='dialog'][aria-modal='true']");
    await expect(dialog).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });
});
```

- [ ] **Step 2 : Lancer les tests contre le build local avec le flag ON**

```bash
pkill -9 -f next-server 2>/dev/null; sleep 1
/usr/local/Cellar/trash/0.9.2/bin/trash .next 2>/dev/null
NEXT_PUBLIC_GALLERY_DYNAMIC=true npm run build
(PORT=3100 NEXT_PUBLIC_GALLERY_DYNAMIC=true npm run start &) && sleep 8
PLAYWRIGHT_BASE_URL=http://localhost:3100 npx playwright test e2e/galerie.spec.ts --project=desktop
pkill -9 -f next-server 2>/dev/null
```

Expected: 4 passed (le test lightbox s'exécute, ne skip pas).

- [ ] **Step 3 : Lancer la suite complète (non-régression)**

```bash
pkill -9 -f next-server 2>/dev/null; sleep 1
/usr/local/Cellar/trash/0.9.2/bin/trash .next 2>/dev/null
npm run build
(PORT=3100 npm run start &) && sleep 8
PLAYWRIGHT_BASE_URL=http://localhost:3100 npx playwright test --project=desktop
pkill -9 -f next-server 2>/dev/null
```

Expected: toute la suite passe (le test lightbox de `galerie.spec.ts` skip car flag off ; les autres passent). 0 failed.

- [ ] **Step 4 : Commit**

```bash
git add e2e/galerie.spec.ts
git commit -m "test(e2e): galerie — rendu SSR, texte indexable, lightbox"
```

---

## Task 8 : Documentation du flag + vérif finale

**Files:**

- Modify: `.env.example` (le créer s'il n'existe pas)

- [ ] **Step 1 : Documenter la variable**

Ajouter à `.env.example` (créer le fichier si absent) :

```
# Galerie : "true" active le nouveau rendu (grille masonry + lightbox, données
# depuis la table Supabase gallery_items). Absent ou toute autre valeur = ancien
# rendu (tableaux codés en dur dans GalerieClient.tsx). Variable NEXT_PUBLIC_ :
# bakée au build, un changement nécessite un redéploiement Railway (~2 min).
NEXT_PUBLIC_GALLERY_DYNAMIC=false
```

- [ ] **Step 2 : Vérif TypeScript + build finale**

Run:

```bash
npx tsc --noEmit
/usr/local/Cellar/trash/0.9.2/bin/trash .next 2>/dev/null
npm run build
```

Expected: PASS, 38 pages.

- [ ] **Step 3 : Vérif navigateur manuelle (flag ON, en local)**

```bash
pkill -9 -f next-server 2>/dev/null; sleep 1
/usr/local/Cellar/trash/0.9.2/bin/trash .next 2>/dev/null
NEXT_PUBLIC_GALLERY_DYNAMIC=true npm run build
(PORT=3100 NEXT_PUBLIC_GALLERY_DYNAMIC=true npm run start &) && sleep 8
```

Ouvrir `http://localhost:3100/fr/galerie`, `/en/galerie`, `/es/galerie` et vérifier :

- grille masonry 3 colonnes desktop / 2 mobile (redimensionner la fenêtre)
- clic sur une photo → plein écran, flèches ‹ › fonctionnent, Échap ferme
- clic sur une vidéo → plein écran avec lecteur, lecture OK
- scroller vite : les vidéos ne se chargent qu'à l'approche (onglet Réseau : les `.mp4` n'apparaissent qu'au scroll)
- pas de scroll horizontal sur mobile
- 0 erreur dans la console

```bash
pkill -9 -f next-server 2>/dev/null
```

- [ ] **Step 4 : Commit**

```bash
git add .env.example
git commit -m "docs(galerie): documente NEXT_PUBLIC_GALLERY_DYNAMIC"
```

---

## Task 9 : Déploiement

**Files:** aucun (opérations Railway + git)

- [ ] **Step 1 : Merge la branche dans main**

```bash
git checkout main
git pull origin main
git merge --ff-only <branche-de-travail>
```

- [ ] **Step 2 : Push (déploie le code, flag OFF)**

```bash
git push origin main
```

Railway déploie. `NEXT_PUBLIC_GALLERY_DYNAMIC` n'est pas encore dans Railway →
la galerie garde **exactement** l'ancien rendu.

- [ ] **Step 3 : Vérifier en prod que rien n'a bougé**

Ouvrir `https://mimi-coiffure.com/fr/galerie` : onglets Photos/Vidéos toujours
là, sections thématiques présentes, aucune régression.

- [ ] **Step 4 : Activer le nouveau rendu**

Railway → Variables → ajouter `NEXT_PUBLIC_GALLERY_DYNAMIC` = `true`. Railway
redéploie (~2-3 min, variable bakée au build).

- [ ] **Step 5 : Vérifier le nouveau rendu en prod, 3 langues**

`https://mimi-coiffure.com/fr/galerie`, `/en/`, `/es/` :

- grille masonry, lightbox, lazy-load vidéos
- 0 erreur console
- HTML initial (View Source) contient les URLs des médias (SEO)
- checklist du handoff §5 rappelée : ce changement ne touche ni réservation ni
  dashboard, mais vérifier quand même que `/admin/dashboard` et `/fr/reservation`
  répondent.

- [ ] **Step 6 : Rollback si insatisfaisant**

Si le rendu ne convient pas : Railway → passer `NEXT_PUBLIC_GALLERY_DYNAMIC` à
`false` (redéploiement ~2 min) → l'ancien rendu revient. Aucun changement de
code nécessaire.

- [ ] **Step 7 : Mettre à jour le handoff**

Ajouter une section au `handoff.md` : galerie dynamique déployée, flag
`NEXT_PUBLIC_GALLERY_DYNAMIC`, table `gallery_items`, bucket `gallery`, Spec 2
(admin) à faire. Commit + push.

---

## Nettoyage post-validation (optionnel, après quelques jours en prod)

Une fois Mouj satisfait :

- Retirer le `if (GALLERY_DYNAMIC)` de `galerie/page.tsx` (garder seulement `GalleryMasonry`)
- Supprimer `components/sections/GalerieClient.tsx`
- Retirer la variable `NEXT_PUBLIC_GALLERY_DYNAMIC` de Railway et `.env.example`
- Commit `refactor(galerie): retire l'ancien rendu et le flag`

---

## Self-review (fait à l'écriture)

**Couverture de la spec :**

- Table `gallery_items` + RLS → Task 1 ✓
- `lib/gallery.ts` / `getGalleryItems()` → Task 2 ✓
- Grille masonry → Task 3 ✓
- Lightbox → Task 4 ✓
- Flag `NEXT_PUBLIC_GALLERY_DYNAMIC` + choix de rendu + texte indexable réécrit → Task 5 ✓
- Migration des ~38 médias → Task 6 ✓
- Lazy-load vidéos → Task 3 (IntersectionObserver dans `VideoCell`) ✓
- Tests Playwright + non-régression → Task 7 ✓
- Doc du flag → Task 8 ✓
- Déploiement réversible + rollback → Task 9 ✓
- `supabase-schema.sql` mis à jour → Task 1 Step 4 ✓
- `GalerieClient.tsx` conservé → confirmé Task 5 (branche `else`)

**Placeholders :** le "test Vitest" de Task 2 Step 1 est explicitement neutralisé (pas de runner dans le projet) avec une décision claire : s'appuyer sur `tsc` + e2e. Pas d'autre TODO/TBD.

**Cohérence des types :** `GalleryItem` défini en Task 2, utilisé identiquement en Task 3 (`ratioOf`, `VideoCell`, `PhotoCell`) et Task 4 (`Lightbox`). `getGalleryItems()` : signature stable Task 2 → Task 5. Nom du tag cache `"gallery-items"` cohérent Task 2 (défini) et mentionné pour Spec 2.

**Écart spec/plan corrigé inline :** la spec parle d'un helper `lib/` pour `getGalleryItems()` « comme `getSettings()` » — le plan le nomme `lib/gallery.ts` avec le même pattern `unstable_cache`, cohérent.
