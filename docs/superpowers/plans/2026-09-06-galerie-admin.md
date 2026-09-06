# Admin galerie — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Une page `/admin/galerie` où Mouj ajoute, supprime et réordonne les médias de la galerie sans passer par Supabase, plus un bouton qui exporte un PDF récapitulatif.

**Architecture:** Page server (auth + fetch direct) → composant client `GalleryAdmin` (état optimiste) qui orchestre `AddMediaForm` (upload multipart, photos compressées serveur via `sharp`, vidéos ≤ 8 Mo avec poster+dims extraits navigateur), `SortableGrid` (`@dnd-kit`, chaque tuile a une poubelle), et un bouton Export PDF (`jspdf` en import dynamique). Trois API routes (`POST`/`GET /api/gallery`, `DELETE /api/gallery/[id]`, `PATCH /api/gallery/order`) protégées par un helper d'auth partagé `lib/adminAuth.ts`, écritures via `supabaseAdmin`, `revalidateTag("gallery-items")` après chaque mutation.

**Tech Stack:** Next.js 15 App Router, React 18, Supabase (Storage + Postgres), TypeScript strict, Tailwind, `sharp` (compression photo serveur — déjà installé, à passer en dependencies), `@dnd-kit/{core,sortable,modifiers}` (drag-and-drop), `jspdf` (export PDF navigateur), Playwright (e2e contrats 401).

---

## File Structure

| Fichier                             | Responsabilité                                                                                                         | Nature   |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | -------- |
| `lib/adminAuth.ts`                  | `getAuthUser()` — session admin via cookies. Une seule définition, importée par toutes les routes admin.               | Création |
| `lib/slug.ts`                       | `slugify(name)` (nom de fichier Storage sûr) + `storagePathFromUrl(url)` (extrait le chemin bucket d'une URL publique) | Création |
| `app/api/settings/route.ts`         | Refactor : importe `getAuthUser` de `lib/adminAuth` au lieu de sa copie locale                                         | Modif    |
| `app/api/gallery/route.ts`          | `POST` (ajouter un média) + `GET` (relire la liste, fallback du réordonnancement)                                      | Création |
| `app/api/gallery/[id]/route.ts`     | `DELETE` (supprimer un média : ligne DB + fichiers Storage)                                                            | Création |
| `app/api/gallery/order/route.ts`    | `PATCH` (réordonner : lot `[{id, sort_order}]`)                                                                        | Création |
| `app/admin/galerie/page.tsx`        | Page server : auth, fetch `gallery_items`, rend `<GalleryAdmin>`                                                       | Création |
| `app/admin/layout.tsx`              | + lien de nav « Galerie »                                                                                              | Modif    |
| `components/admin/GalleryAdmin.tsx` | Orchestrateur client : état `items`, monte `AddMediaForm` + `SortableGrid`, bouton Export PDF                          | Création |
| `components/admin/AddMediaForm.tsx` | Formulaire d'ajout (fichier + description, extraction poster/dims vidéo navigateur)                                    | Création |
| `components/admin/SortableGrid.tsx` | Grille `@dnd-kit` + sous-composant `SortableTile` (vignette + poubelle)                                                | Création |
| `lib/galleryPdf.ts`                 | `exportGalleryPdf(items)` — charge les vignettes, construit le PDF via import dynamique `jspdf`                        | Création |
| `e2e/galerie-admin.spec.ts`         | Contrats : redirect login + 401 sur les 3 routes sans session                                                          | Création |
| `package.json`                      | + `@dnd-kit/*`, `jspdf` ; `sharp` déplacé devDeps → deps                                                               | Modif    |

---

## Task 1 : `lib/adminAuth.ts` + refactor `app/api/settings/route.ts`

**Files:**

- Create: `lib/adminAuth.ts`
- Modify: `app/api/settings/route.ts`

- [ ] **Step 1 : Créer `lib/adminAuth.ts`**

```ts
// lib/adminAuth.ts
//
// Vérifie qu'une session admin Supabase valide est présente sur la requête.
// Utilisé par toutes les API routes /api/* qui écrivent des données admin.
// Retourne l'utilisateur ou null (jamais d'exception).

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function getAuthUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } },
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
```

- [ ] **Step 2 : Refactor `app/api/settings/route.ts` pour l'importer**

Dans `app/api/settings/route.ts`, supprimer la fonction locale `getAuthUser` (les lignes `async function getAuthUser() { ... }` avec son bloc `createServerClient`) et son import `createServerClient` / `cookies` s'ils ne servent plus ailleurs dans le fichier. Ajouter en haut :

```ts
import { getAuthUser } from "@/lib/adminAuth";
```

Le reste du fichier (les appels `await getAuthUser()`) est inchangé.

- [ ] **Step 3 : Vérifier types + que la route settings compile**

Run: `cd /Users/Mouj/Desktop/salon-mimi && npx tsc --noEmit`
Expected: PASS

- [ ] **Step 4 : Vérifier la non-régression de /api/settings**

```bash
cd /Users/Mouj/Desktop/salon-mimi
pkill -9 -f "next-server" 2>/dev/null; sleep 1
/usr/local/Cellar/trash/0.9.2/bin/trash .next 2>/dev/null
npm run build > /tmp/t1-build.log 2>&1
grep -E "Compiled successfully|error" /tmp/t1-build.log | head
(PORT=3100 npm run start > /tmp/t1-start.log 2>&1 &) && sleep 8
curl -s -o /dev/null -w "GET /api/settings -> %{http_code}\n" http://localhost:3100/api/settings
curl -s -o /dev/null -w "PATCH sans session -> %{http_code}\n" -X PATCH -H "Content-Type: application/json" -d '{"whatsapp_number":"+212600000000"}' http://localhost:3100/api/settings
pkill -9 -f "next-server" 2>/dev/null
```

Expected: `GET /api/settings -> 200`, `PATCH sans session -> 401` (comportement inchangé).

- [ ] **Step 5 : Commit**

```bash
cd /Users/Mouj/Desktop/salon-mimi
git add lib/adminAuth.ts app/api/settings/route.ts
git commit -m "refactor(admin): getAuthUser extrait dans lib/adminAuth"
```

---

## Task 2 : `lib/slug.ts`

**Files:**

- Create: `lib/slug.ts`

- [ ] **Step 1 : Créer `lib/slug.ts`**

```ts
// lib/slug.ts
//
// Helpers pour l'admin galerie :
//  - slugify : nom de fichier sûr pour Supabase Storage (pas d'accent, pas
//    d'espace, pas de séparateur de chemin)
//  - storagePathFromUrl : chemin dans le bucket "gallery" à partir d'une URL
//    publique Supabase (pour supprimer le fichier)

/**
 * Transforme un nom de fichier arbitraire en slug ASCII sûr, sans extension.
 * "Ma Photo Été (2).JPG" -> "ma-photo-ete-2"
 */
export function slugify(name: string): string {
  const withoutExt = name.replace(/\.[^.]+$/, "");
  return (
    withoutExt
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "") // enlève les diacritiques
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "media"
  );
}

/**
 * Extrait le chemin relatif dans le bucket "gallery" à partir d'une URL
 * publique. Retourne null si l'URL n'a pas le format attendu.
 * ".../storage/v1/object/public/gallery/photos/x.jpg" -> "photos/x.jpg"
 */
export function storagePathFromUrl(url: string): string | null {
  const marker = "/storage/v1/object/public/gallery/";
  const i = url.indexOf(marker);
  if (i === -1) return null;
  return url.slice(i + marker.length) || null;
}
```

- [ ] **Step 2 : Vérifier types**

Run: `cd /Users/Mouj/Desktop/salon-mimi && npx tsc --noEmit`
Expected: PASS

- [ ] **Step 3 : Commit**

```bash
cd /Users/Mouj/Desktop/salon-mimi
git add lib/slug.ts
git commit -m "feat(admin): lib/slug — slugify + storagePathFromUrl pour la galerie"
```

---

## Task 3 : Dépendances

**Files:**

- Modify: `package.json`

- [ ] **Step 1 : Installer les libs**

```bash
cd /Users/Mouj/Desktop/salon-mimi
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/modifiers jspdf
```

- [ ] **Step 2 : Déplacer `sharp` de devDependencies vers dependencies**

Dans `package.json` : retirer la ligne `"sharp": "..."` de `"devDependencies"` et l'ajouter à `"dependencies"` (garder la même version). `POST /api/gallery` l'utilisera au runtime en prod.

Puis :

```bash
cd /Users/Mouj/Desktop/salon-mimi
npm install
```

(pour resynchroniser `package-lock.json`)

- [ ] **Step 3 : Vérifier build**

```bash
cd /Users/Mouj/Desktop/salon-mimi
npx tsc --noEmit
/usr/local/Cellar/trash/0.9.2/bin/trash .next 2>/dev/null
npm run build 2>&1 | grep -E "Compiled successfully|error" | head
```

Expected: PASS, "✓ Compiled successfully".

- [ ] **Step 4 : Commit**

```bash
cd /Users/Mouj/Desktop/salon-mimi
git add package.json package-lock.json
git commit -m "chore(deps): @dnd-kit, jspdf, sharp en dependencies (admin galerie)"
```

---

## Task 4 : `POST` + `GET /api/gallery`

**Files:**

- Create: `app/api/gallery/route.ts`

- [ ] **Step 1 : Créer `app/api/gallery/route.ts`**

```ts
// app/api/gallery/route.ts
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import sharp from "sharp";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getAuthUser } from "@/lib/adminAuth";
import { slugify } from "@/lib/slug";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const PUBLIC_BASE = `${SUPABASE_URL}/storage/v1/object/public/gallery`;
const MAX_ANY = 20 * 1024 * 1024; // garde-fou global
const MAX_VIDEO = 8 * 1024 * 1024;

// --- GET : relecture de la liste (fallback du réordonnancement) ---
export async function GET() {
  const user = await getAuthUser();
  if (!user)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("gallery_items")
    .select("id, type, url, poster_url, alt, sort_order, width, height")
    .order("sort_order", { ascending: true });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// --- POST : ajouter un média ---
export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const form = await request.formData();
  const file = form.get("file");
  const alt = String(form.get("alt") ?? "").trim();

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
  }
  if (file.size > MAX_ANY) {
    return NextResponse.json(
      { error: "Fichier trop volumineux" },
      { status: 413 },
    );
  }
  if (alt.length < 10) {
    return NextResponse.json(
      { error: "Description trop courte (10 caractères minimum)" },
      { status: 400 },
    );
  }

  const isImage = /^image\/(jpeg|png|webp)$/.test(file.type);
  const isVideo = file.type === "video/mp4";
  if (!isImage && !isVideo) {
    return NextResponse.json(
      { error: "Format non supporté (JPEG, PNG, WebP ou MP4)" },
      { status: 400 },
    );
  }

  const stamp = Date.now();
  const base = slugify(file.name);

  let type: "photo" | "video";
  let url: string;
  let posterUrl: string | null = null;
  let width: number | null = null;
  let height: number | null = null;

  if (isImage) {
    type = "photo";
    const input = Buffer.from(await file.arrayBuffer());
    const processed = await sharp(input)
      .rotate()
      .resize({ width: 1400, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();
    const meta = await sharp(processed).metadata();
    width = meta.width ?? null;
    height = meta.height ?? null;

    const path = `photos/${base}-${stamp}.jpg`;
    const { error: upErr } = await supabaseAdmin.storage
      .from("gallery")
      .upload(path, processed, { contentType: "image/jpeg", upsert: false });
    if (upErr)
      return NextResponse.json({ error: upErr.message }, { status: 500 });
    url = `${PUBLIC_BASE}/${path}`;
  } else {
    type = "video";
    if (file.size > MAX_VIDEO) {
      return NextResponse.json(
        {
          error:
            "Vidéo trop lourde, compressez-la avant l'envoi — 8 Mo maximum.",
        },
        { status: 400 },
      );
    }
    const buf = Buffer.from(await file.arrayBuffer());
    const path = `videos/${base}-${stamp}.mp4`;
    const { error: upErr } = await supabaseAdmin.storage
      .from("gallery")
      .upload(path, buf, { contentType: "video/mp4", upsert: false });
    if (upErr)
      return NextResponse.json({ error: upErr.message }, { status: 500 });
    url = `${PUBLIC_BASE}/${path}`;

    // poster (fourni par le navigateur), optionnel
    const poster = form.get("poster");
    if (poster instanceof File && poster.size > 0) {
      const posterBuf = Buffer.from(await poster.arrayBuffer());
      const posterPath = `posters/${base}-${stamp}.jpg`;
      const { error: pErr } = await supabaseAdmin.storage
        .from("gallery")
        .upload(posterPath, posterBuf, {
          contentType: "image/jpeg",
          upsert: false,
        });
      if (!pErr) posterUrl = `${PUBLIC_BASE}/${posterPath}`;
    }

    const w = parseInt(String(form.get("width") ?? ""), 10);
    const h = parseInt(String(form.get("height") ?? ""), 10);
    width = Number.isFinite(w) && w > 0 ? w : null;
    height = Number.isFinite(h) && h > 0 ? h : null;
  }

  // sort_order = max existant + 1
  const { data: last } = await supabaseAdmin
    .from("gallery_items")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1);
  const nextOrder = (last?.[0]?.sort_order ?? -1) + 1;

  const { data: inserted, error: insErr } = await supabaseAdmin
    .from("gallery_items")
    .insert({
      type,
      url,
      poster_url: posterUrl,
      alt,
      sort_order: nextOrder,
      width,
      height,
    })
    .select("id, type, url, poster_url, alt, sort_order, width, height")
    .single();

  if (insErr)
    return NextResponse.json({ error: insErr.message }, { status: 500 });

  revalidateTag("gallery-items");
  return NextResponse.json(inserted, { status: 201 });
}
```

- [ ] **Step 2 : Vérifier types + build**

Run: `cd /Users/Mouj/Desktop/salon-mimi && npx tsc --noEmit && npm run build 2>&1 | grep -E "Compiled successfully|error|/api/gallery" | head`
Expected: PASS, `/api/gallery` dans la table des routes.

- [ ] **Step 3 : Vérifier le contrat 401 sans session**

```bash
cd /Users/Mouj/Desktop/salon-mimi
pkill -9 -f "next-server" 2>/dev/null; sleep 1
(PORT=3100 npm run start > /tmp/t4-start.log 2>&1 &) && sleep 8
curl -s -o /dev/null -w "GET /api/gallery sans session -> %{http_code}\n" http://localhost:3100/api/gallery
curl -s -o /dev/null -w "POST /api/gallery sans session -> %{http_code}\n" -X POST http://localhost:3100/api/gallery
pkill -9 -f "next-server" 2>/dev/null
```

Expected: les deux répondent `401`.

- [ ] **Step 4 : Commit**

```bash
cd /Users/Mouj/Desktop/salon-mimi
git add app/api/gallery/route.ts
git commit -m "feat(admin): POST + GET /api/gallery — ajout de media et relecture"
```

---

## Task 5 : `DELETE /api/gallery/[id]`

**Files:**

- Create: `app/api/gallery/[id]/route.ts`

- [ ] **Step 1 : Créer `app/api/gallery/[id]/route.ts`**

```ts
// app/api/gallery/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getAuthUser } from "@/lib/adminAuth";
import { storagePathFromUrl } from "@/lib/slug";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser();
  if (!user)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;

  const { data: row, error: selErr } = await supabaseAdmin
    .from("gallery_items")
    .select("url, poster_url")
    .eq("id", id)
    .single();

  if (selErr || !row) {
    return NextResponse.json({ error: "Média introuvable" }, { status: 404 });
  }

  // Supprime les fichiers Storage (best-effort : on continue même si ça échoue)
  const paths: string[] = [];
  const mainPath = storagePathFromUrl(row.url);
  if (mainPath) paths.push(mainPath);
  if (row.poster_url) {
    const posterPath = storagePathFromUrl(row.poster_url);
    if (posterPath) paths.push(posterPath);
  }
  if (paths.length > 0) {
    const { error: rmErr } = await supabaseAdmin.storage
      .from("gallery")
      .remove(paths);
    if (rmErr) {
      console.error("[gallery DELETE] suppression Storage échouée", rmErr);
    }
  }

  const { error: delErr } = await supabaseAdmin
    .from("gallery_items")
    .delete()
    .eq("id", id);

  if (delErr)
    return NextResponse.json({ error: delErr.message }, { status: 500 });

  revalidateTag("gallery-items");
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2 : Vérifier types + build**

Run: `cd /Users/Mouj/Desktop/salon-mimi && npx tsc --noEmit && npm run build 2>&1 | grep -E "Compiled successfully|error|/api/gallery" | head`
Expected: PASS.

- [ ] **Step 3 : Contrat 401**

```bash
cd /Users/Mouj/Desktop/salon-mimi
pkill -9 -f "next-server" 2>/dev/null; sleep 1
(PORT=3100 npm run start > /tmp/t5-start.log 2>&1 &) && sleep 8
curl -s -o /dev/null -w "DELETE /api/gallery/xxx sans session -> %{http_code}\n" -X DELETE http://localhost:3100/api/gallery/00000000-0000-0000-0000-000000000000
pkill -9 -f "next-server" 2>/dev/null
```

Expected: `401`.

- [ ] **Step 4 : Commit**

```bash
cd /Users/Mouj/Desktop/salon-mimi
git add app/api/gallery/\[id\]/route.ts
git commit -m "feat(admin): DELETE /api/gallery/[id] — supprime ligne + fichiers Storage"
```

---

## Task 6 : `PATCH /api/gallery/order`

**Files:**

- Create: `app/api/gallery/order/route.ts`

- [ ] **Step 1 : Créer `app/api/gallery/order/route.ts`**

```ts
// app/api/gallery/order/route.ts
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getAuthUser } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

type OrderEntry = { id: string; sort_order: number };

function isValidOrder(v: unknown): v is OrderEntry[] {
  return (
    Array.isArray(v) &&
    v.length > 0 &&
    v.every(
      (e) =>
        e &&
        typeof e === "object" &&
        typeof (e as OrderEntry).id === "string" &&
        Number.isInteger((e as OrderEntry).sort_order),
    )
  );
}

export async function PATCH(request: NextRequest) {
  const user = await getAuthUser();
  if (!user)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const order = body?.order;

  if (!isValidOrder(order)) {
    return NextResponse.json(
      { error: "Corps invalide : { order: [{ id, sort_order }] }" },
      { status: 400 },
    );
  }

  for (const { id, sort_order } of order) {
    const { error } = await supabaseAdmin
      .from("gallery_items")
      .update({ sort_order })
      .eq("id", id);
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidateTag("gallery-items");
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2 : Vérifier types + build**

Run: `cd /Users/Mouj/Desktop/salon-mimi && npx tsc --noEmit && npm run build 2>&1 | grep -E "Compiled successfully|error" | head`
Expected: PASS.

- [ ] **Step 3 : Contrat 401**

```bash
cd /Users/Mouj/Desktop/salon-mimi
pkill -9 -f "next-server" 2>/dev/null; sleep 1
(PORT=3100 npm run start > /tmp/t6-start.log 2>&1 &) && sleep 8
curl -s -o /dev/null -w "PATCH /api/gallery/order sans session -> %{http_code}\n" -X PATCH -H "Content-Type: application/json" -d '{"order":[]}' http://localhost:3100/api/gallery/order
pkill -9 -f "next-server" 2>/dev/null
```

Expected: `401`.

- [ ] **Step 4 : Commit**

```bash
cd /Users/Mouj/Desktop/salon-mimi
git add app/api/gallery/order/route.ts
git commit -m "feat(admin): PATCH /api/gallery/order — reordonnancement en lot"
```

---

## Task 7 : `lib/galleryPdf.ts` — export PDF

**Files:**

- Create: `lib/galleryPdf.ts`

- [ ] **Step 1 : Créer `lib/galleryPdf.ts`**

```ts
// lib/galleryPdf.ts
//
// Génère un PDF récapitulatif de la galerie côté navigateur. jspdf est importé
// dynamiquement (lourd, ~350 Ko) — n'est chargé qu'au clic sur « Exporter ».

import type { GalleryItem } from "@/lib/gallery";

/** Charge une image et la réduit à `maxW` de large, retourne une data URL JPEG. */
async function toThumbDataUrl(src: string, maxW = 600): Promise<string> {
  const res = await fetch(src);
  if (!res.ok) throw new Error(`fetch ${res.status}`);
  const blob = await res.blob();
  const bitmap = await createImageBitmap(blob);
  const scale = Math.min(1, maxW / bitmap.width);
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", 0.72);
}

export async function exportGalleryPdf(items: GalleryItem[]): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const pageW = 210;
  const pageH = 297;
  const margin = 12;
  const cols = 3;
  const gap = 6;
  const cellW = (pageW - margin * 2 - gap * (cols - 1)) / cols;
  const imgH = cellW * 0.9;
  const captionH = 12;
  const rowH = imgH + captionH + gap;

  // En-tête
  doc.setFontSize(14);
  doc.text(
    `Galerie Salon Mimi — ${items.length} médias — ${new Date().toLocaleDateString("fr-FR")}`,
    margin,
    margin,
  );

  let x = margin;
  let y = margin + 8;
  let col = 0;

  for (const item of items) {
    if (y + rowH > pageH - margin) {
      doc.addPage();
      x = margin;
      y = margin;
      col = 0;
    }

    const src =
      item.type === "video" ? (item.poster_url ?? item.url) : item.url;
    try {
      const dataUrl = await toThumbDataUrl(src);
      doc.addImage(dataUrl, "JPEG", x, y, cellW, imgH, undefined, "FAST");
    } catch {
      doc.setDrawColor(200);
      doc.setFillColor(235);
      doc.rect(x, y, cellW, imgH, "FD");
      doc.setFontSize(8);
      doc.text("image indisponible", x + 2, y + imgH / 2);
    }

    doc.setFontSize(9);
    doc.text(`#${item.sort_order} · ${item.type}`, x, y + imgH + 4);
    doc.setFontSize(7);
    const caption = doc.splitTextToSize(item.alt, cellW);
    doc.text(caption.slice(0, 2), x, y + imgH + 8);

    col++;
    if (col >= cols) {
      col = 0;
      x = margin;
      y += rowH;
    } else {
      x += cellW + gap;
    }
  }

  const stamp = new Date().toISOString().slice(0, 10);
  doc.save(`galerie-salon-mimi-${stamp}.pdf`);
}
```

- [ ] **Step 2 : Vérifier types**

Run: `cd /Users/Mouj/Desktop/salon-mimi && npx tsc --noEmit`
Expected: PASS. Si `jspdf` types manquent, `npm i -D @types/jspdf` n'est PAS nécessaire (jspdf embarque ses types depuis v2). Si erreur `createImageBitmap`/`OffscreenCanvas` lib DOM manquante, vérifier `tsconfig.json` `lib` inclut `"dom"` (c'est le cas — Spec 1 l'a confirmé).

- [ ] **Step 3 : Commit**

```bash
cd /Users/Mouj/Desktop/salon-mimi
git add lib/galleryPdf.ts
git commit -m "feat(admin): lib/galleryPdf — export PDF de la galerie (jspdf dynamique)"
```

---

## Task 8 : `SortableGrid.tsx` (grille + tuile + poubelle)

**Files:**

- Create: `components/admin/SortableGrid.tsx`

- [ ] **Step 1 : Créer `components/admin/SortableGrid.tsx`**

```tsx
"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { GalleryItem } from "@/lib/gallery";

function SortableTile({
  item,
  onDelete,
}: {
  item: GalleryItem;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const thumb =
    item.type === "video" ? (item.poster_url ?? item.url) : item.url;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group relative aspect-square overflow-hidden rounded-lg bg-gray-200 cursor-grab active:cursor-grabbing"
    >
      <img
        src={thumb}
        alt={item.alt}
        loading="lazy"
        className="h-full w-full object-cover pointer-events-none"
      />
      {item.type === "video" && (
        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center text-white text-2xl drop-shadow"
        >
          ▶
        </span>
      )}
      <button
        type="button"
        aria-label="Supprimer ce média"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          if (
            window.confirm(`Supprimer définitivement ce média ?\n\n${item.alt}`)
          ) {
            onDelete(item.id);
          }
        }}
        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
        </svg>
      </button>
      <span className="absolute left-2 bottom-2 rounded bg-black/50 px-1.5 py-0.5 text-[11px] text-white">
        #{item.sort_order}
      </span>
    </div>
  );
}

export default function SortableGrid({
  items,
  onReorder,
  onDelete,
}: {
  items: GalleryItem[];
  onReorder: (next: GalleryItem[]) => void;
  onDelete: (id: string) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((it) => it.id === active.id);
    const newIndex = items.findIndex((it) => it.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(arrayMove(items, oldIndex, newIndex));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((it) => it.id)}
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {items.map((item) => (
            <SortableTile key={item.id} item={item} onDelete={onDelete} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
```

- [ ] **Step 2 : Vérifier types + build**

Run: `cd /Users/Mouj/Desktop/salon-mimi && npx tsc --noEmit && npm run build 2>&1 | grep -E "Compiled successfully|error" | head`
Expected: PASS.

- [ ] **Step 3 : Commit**

```bash
cd /Users/Mouj/Desktop/salon-mimi
git add components/admin/SortableGrid.tsx
git commit -m "feat(admin): SortableGrid — grille drag-and-drop + poubelle par tuile"
```

---

## Task 9 : `AddMediaForm.tsx`

**Files:**

- Create: `components/admin/AddMediaForm.tsx`

- [ ] **Step 1 : Créer `components/admin/AddMediaForm.tsx`**

```tsx
"use client";

import { useRef, useState } from "react";
import type { GalleryItem } from "@/lib/gallery";

const MAX_VIDEO = 8 * 1024 * 1024;

/**
 * Pour une vidéo : extrait dimensions + une frame de poster côté navigateur.
 * Retourne { width, height, poster } ou null si l'extraction échoue.
 */
async function probeVideo(
  file: File,
): Promise<{ width: number; height: number; poster: Blob } | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.src = url;

    const cleanup = () => URL.revokeObjectURL(url);

    video.onloadedmetadata = () => {
      const width = video.videoWidth;
      const height = video.videoHeight;
      const t = Math.min(1, (video.duration || 2) / 2);
      video.currentTime = t;
      video.onseeked = () => {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          cleanup();
          resolve(null);
          return;
        }
        ctx.drawImage(video, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            cleanup();
            resolve(blob ? { width, height, poster: blob } : null);
          },
          "image/jpeg",
          0.8,
        );
      };
    };
    video.onerror = () => {
      cleanup();
      resolve(null);
    };
  });
}

export default function AddMediaForm({
  onAdded,
}: {
  onAdded: (item: GalleryItem) => void;
}) {
  const [alt, setAlt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Choisissez un fichier.");
      return;
    }
    if (alt.trim().length < 10) {
      setError("La description doit faire au moins 10 caractères.");
      return;
    }
    const isVideo = file.type === "video/mp4";
    if (isVideo && file.size > MAX_VIDEO) {
      setError(
        "Vidéo trop lourde, compressez-la avant l'envoi — 8 Mo maximum.",
      );
      return;
    }

    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("alt", alt.trim());

      if (isVideo) {
        const probed = await probeVideo(file);
        if (probed) {
          fd.append("poster", probed.poster, "poster.jpg");
          fd.append("width", String(probed.width));
          fd.append("height", String(probed.height));
        }
      }

      const res = await fetch("/api/gallery", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Échec de l'ajout.");
        return;
      }
      onAdded(json as GalleryItem);
      setAlt("");
      if (fileRef.current) fileRef.current.value = "";
    } catch {
      setError("Erreur réseau pendant l'envoi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:flex-row sm:items-end"
    >
      <div className="flex-1">
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Fichier (photo JPEG/PNG/WebP ou vidéo MP4 ≤ 8 Mo)
        </label>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,video/mp4"
          className="block w-full text-sm"
        />
      </div>
      <div className="flex-1">
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Description (pour Google, 10 caractères min.)
        </label>
        <input
          type="text"
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          placeholder="ex : Box braids bohème Salon Mimi Marrakech"
          className="block w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={busy}
        className="rounded bg-brun px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {busy ? "Envoi en cours…" : "Ajouter"}
      </button>
      {error && (
        <p className="w-full text-sm text-red-600 sm:w-auto">{error}</p>
      )}
    </form>
  );
}
```

- [ ] **Step 2 : Vérifier types + build**

Run: `cd /Users/Mouj/Desktop/salon-mimi && npx tsc --noEmit && npm run build 2>&1 | grep -E "Compiled successfully|error" | head`
Expected: PASS.

- [ ] **Step 3 : Commit**

```bash
cd /Users/Mouj/Desktop/salon-mimi
git add components/admin/AddMediaForm.tsx
git commit -m "feat(admin): AddMediaForm — upload media + extraction poster/dims video"
```

---

## Task 10 : `GalleryAdmin.tsx` (orchestrateur + bouton PDF)

**Files:**

- Create: `components/admin/GalleryAdmin.tsx`

- [ ] **Step 1 : Créer `components/admin/GalleryAdmin.tsx`**

```tsx
"use client";

import { useState } from "react";
import type { GalleryItem } from "@/lib/gallery";
import AddMediaForm from "./AddMediaForm";
import SortableGrid from "./SortableGrid";
import { exportGalleryPdf } from "@/lib/galleryPdf";

export default function GalleryAdmin({
  initialItems,
}: {
  initialItems: GalleryItem[];
}) {
  const [items, setItems] = useState<GalleryItem[]>(initialItems);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [notice, setNotice] = useState("");

  async function persistOrder(next: GalleryItem[]) {
    // rendu optimiste : réindexe localement d'abord
    const reindexed = next.map((it, i) => ({ ...it, sort_order: i }));
    setItems(reindexed);
    const res = await fetch("/api/gallery/order", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order: reindexed.map((it) => ({
          id: it.id,
          sort_order: it.sort_order,
        })),
      }),
    });
    if (!res.ok) {
      setNotice("Échec de la sauvegarde de l'ordre. Rechargement…");
      const fresh = await fetch("/api/gallery");
      if (fresh.ok) setItems((await fresh.json()) as GalleryItem[]);
    } else {
      setNotice("");
    }
  }

  async function handleDelete(id: string) {
    const prev = items;
    setItems(items.filter((it) => it.id !== id));
    const res = await fetch(`/api/gallery/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setNotice("Échec de la suppression.");
      setItems(prev);
    }
  }

  async function handleExport() {
    setPdfBusy(true);
    setNotice("");
    try {
      await exportGalleryPdf(items);
    } catch {
      setNotice("Échec de la génération du PDF.");
    } finally {
      setPdfBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-playfair text-3xl text-brun">Galerie</h1>
          <p className="mt-1 text-sm text-gray-500">
            {items.length} médias · glisser pour réordonner · survoler pour
            supprimer
          </p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={pdfBusy || items.length === 0}
          className="rounded border border-brun px-4 py-2 text-sm text-brun disabled:opacity-50"
        >
          {pdfBusy ? "Génération…" : "Exporter le PDF"}
        </button>
      </div>

      {notice && (
        <p className="mb-4 rounded bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {notice}
        </p>
      )}

      <AddMediaForm onAdded={(item) => setItems((cur) => [...cur, item])} />

      <SortableGrid
        items={items}
        onReorder={persistOrder}
        onDelete={handleDelete}
      />
    </div>
  );
}
```

- [ ] **Step 2 : Vérifier types + build**

Run: `cd /Users/Mouj/Desktop/salon-mimi && npx tsc --noEmit && npm run build 2>&1 | grep -E "Compiled successfully|error" | head`
Expected: PASS.

- [ ] **Step 3 : Commit**

```bash
cd /Users/Mouj/Desktop/salon-mimi
git add components/admin/GalleryAdmin.tsx
git commit -m "feat(admin): GalleryAdmin — orchestrateur + bouton export PDF"
```

---

## Task 11 : Page `app/admin/galerie/page.tsx` + nav

**Files:**

- Create: `app/admin/galerie/page.tsx`
- Modify: `app/admin/layout.tsx`

- [ ] **Step 1 : Créer `app/admin/galerie/page.tsx`**

```tsx
// app/admin/galerie/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import GalleryAdmin from "@/components/admin/GalleryAdmin";
import type { GalleryItem } from "@/lib/gallery";

export const dynamic = "force-dynamic";
export const metadata = {
  robots: { index: false, follow: false },
};

export default async function GalerieAdminPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: items } = await supabase
    .from("gallery_items")
    .select("id, type, url, poster_url, alt, sort_order, width, height")
    .order("sort_order", { ascending: true });

  return <GalleryAdmin initialItems={(items ?? []) as GalleryItem[]} />;
}
```

- [ ] **Step 2 : Ajouter le lien de nav dans `app/admin/layout.tsx`**

Dans le `<div className="max-w-6xl mx-auto flex gap-6">`, après le `<Link href="/admin/settings">Paramètres</Link>`, ajouter :

```tsx
<Link
  href="/admin/galerie"
  className="text-sm text-gray-600 hover:text-brun py-3 border-b-2 border-transparent hover:border-brun transition-colors"
>
  Galerie
</Link>
```

- [ ] **Step 3 : Vérifier types + build**

Run:

```bash
cd /Users/Mouj/Desktop/salon-mimi
npx tsc --noEmit
/usr/local/Cellar/trash/0.9.2/bin/trash .next 2>/dev/null
npm run build 2>&1 | grep -E "Compiled successfully|Generating static pages|error|/admin/galerie" | head
```

Expected: PASS, `/admin/galerie` listée (dynamique `ƒ`).

- [ ] **Step 4 : Vérifier la redirection sans session**

```bash
cd /Users/Mouj/Desktop/salon-mimi
pkill -9 -f "next-server" 2>/dev/null; sleep 1
(PORT=3100 npm run start > /tmp/t11-start.log 2>&1 &) && sleep 8
curl -s -o /dev/null -w "GET /admin/galerie sans session -> %{http_code} (redirect vers %{redirect_url})\n" http://localhost:3100/admin/galerie
pkill -9 -f "next-server" 2>/dev/null
```

Expected: `307` ou `302` vers `/admin/login` (ou `200` avec le HTML du login selon le rendu Next — l'important : pas d'accès à la grille).

- [ ] **Step 5 : Commit**

```bash
cd /Users/Mouj/Desktop/salon-mimi
git add app/admin/galerie/page.tsx app/admin/layout.tsx
git commit -m "feat(admin): page /admin/galerie + lien de nav"
```

---

## Task 12 : Test e2e `e2e/galerie-admin.spec.ts`

**Files:**

- Create: `e2e/galerie-admin.spec.ts`

- [ ] **Step 1 : Créer `e2e/galerie-admin.spec.ts`**

```ts
import { test, expect } from "@playwright/test";

// Contrats de sécurité seulement : sans session admin, la page redirige et les
// API routes renvoient 401. Le parcours authentifié complet (upload, drag,
// delete) n'est pas automatisable sans login admin dans l'infra Playwright
// (même limite que e2e/api-reservations-id.spec.ts) — couvert par la checklist
// de test manuel du plan.

test.describe("Admin galerie — sécurité", () => {
  test("/admin/galerie sans session ne montre pas la grille", async ({
    page,
  }) => {
    await page.goto("/admin/galerie");
    // soit redirigé vers /admin/login, soit la page login s'affiche
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("POST /api/gallery sans session -> 401", async ({ request }) => {
    const res = await request.post("/api/gallery");
    expect(res.status()).toBe(401);
  });

  test("GET /api/gallery sans session -> 401", async ({ request }) => {
    const res = await request.get("/api/gallery");
    expect(res.status()).toBe(401);
  });

  test("DELETE /api/gallery/[id] sans session -> 401", async ({ request }) => {
    const res = await request.delete(
      "/api/gallery/00000000-0000-0000-0000-000000000000",
    );
    expect(res.status()).toBe(401);
  });

  test("PATCH /api/gallery/order sans session -> 401", async ({ request }) => {
    const res = await request.patch("/api/gallery/order", {
      data: { order: [] },
    });
    expect(res.status()).toBe(401);
  });
});
```

- [ ] **Step 2 : Lancer ce spec contre un build local**

```bash
cd /Users/Mouj/Desktop/salon-mimi
pkill -9 -f "next-server" 2>/dev/null; sleep 1
/usr/local/Cellar/trash/0.9.2/bin/trash .next 2>/dev/null
npm run build > /tmp/t12-build.log 2>&1
(PORT=3100 npm run start > /tmp/t12-start.log 2>&1 &) && sleep 8
PLAYWRIGHT_BASE_URL=http://localhost:3100 npx playwright test e2e/galerie-admin.spec.ts --project=desktop
pkill -9 -f "next-server" 2>/dev/null
```

Expected: 5 passed.

- [ ] **Step 3 : Lancer la suite complète (non-régression)**

```bash
cd /Users/Mouj/Desktop/salon-mimi
pkill -9 -f "next-server" 2>/dev/null; sleep 1
/usr/local/Cellar/trash/0.9.2/bin/trash .next 2>/dev/null
npm run build > /tmp/t12-full-build.log 2>&1
(PORT=3100 npm run start > /tmp/t12-full-start.log 2>&1 &) && sleep 8
PLAYWRIGHT_BASE_URL=http://localhost:3100 npx playwright test --project=desktop
pkill -9 -f "next-server" 2>/dev/null
```

Expected: toute la suite passe, 0 failed (skips connus : lightbox galerie flag-off, api-reservations-id).

- [ ] **Step 4 : Commit**

```bash
cd /Users/Mouj/Desktop/salon-mimi
git add e2e/galerie-admin.spec.ts
git commit -m "test(e2e): admin galerie — contrats 401 + redirect login"
```

---

## Task 13 : Vérification finale + test manuel + déploiement

**Files:** aucun (opérations git + Railway + navigateur)

- [ ] **Step 1 : `tsc` + build propre + suite complète**

```bash
cd /Users/Mouj/Desktop/salon-mimi
npx tsc --noEmit
/usr/local/Cellar/trash/0.9.2/bin/trash .next 2>/dev/null
npm run build 2>&1 | grep -E "Compiled successfully|Generating static pages|error"
```

Expected: PASS, 38+ pages (une de plus : `/admin/galerie`).

- [ ] **Step 2 : Merge dans main + push**

```bash
cd /Users/Mouj/Desktop/salon-mimi
git checkout main && git pull origin main
git merge --ff-only <branche-de-travail>
git push origin main
```

Railway déploie. `@dnd-kit` + `jspdf` + `sharp` en deps → le build Railway les installe.

- [ ] **Step 3 : Test manuel en prod (checklist de la spec)**

Se connecter à `https://mimi-coiffure.com/admin` → onglet **Galerie** :

1. La grille affiche les 40 médias avec leurs vignettes.
2. **Ajouter une photo** : choisir un JPEG, taper une description ≥ 10 car., Ajouter → la vignette apparaît en fin de grille. Ouvrir `/fr/galerie` (autre onglet) → la photo y est (rafraîchir si besoin).
3. **Ajouter une vidéo < 8 Mo** : le poster se génère, la vignette apparaît. Vérifier `/fr/galerie`.
4. **Vidéo > 8 Mo** : message « Vidéo trop lourde… », rien ajouté.
5. **Glisser une vignette** vers une autre position → l'ordre change immédiatement. Recharger la page admin → l'ordre a persisté. Vérifier `/fr/galerie` → même ordre.
6. **Supprimer une photo** : survoler → poubelle → confirmer → disparaît de la grille admin ET de `/fr/galerie`. Vérifier dans Supabase Storage que le fichier `photos/...` est parti.
7. **Exporter le PDF** → `galerie-salon-mimi-<date>.pdf` se télécharge, contient toutes les vignettes + `#sort_order` + descriptions.
8. **Non-régression** : `/admin/dashboard` affiche les réservations, `/admin/settings` sauvegarde toujours, `/fr/reservation` fonctionne.

- [ ] **Step 4 : Mettre à jour le handoff**

Ajouter une section au `handoff.md` : admin galerie déployée (`/admin/galerie`),
routes `/api/gallery/*`, `lib/adminAuth.ts` désormais partagé, dépendances
ajoutées, script `gallery:sheet` obsolète. Commit + push.

- [ ] **Step 5 : Rollback si besoin**

Si un problème : retirer le `<Link href="/admin/galerie">` de `app/admin/layout.tsx`
et redéployer (la page devient inaccessible via la nav ; les routes restent mais
ne sont pas exploitables sans l'UI). Ou `git revert` du merge.

---

## Nettoyage post-validation (optionnel)

Une fois l'admin galerie validée en usage réel :

- Retirer `scripts/gallery-contact-sheet.ts`, le script `gallery:sheet` de
  `package.json`, la ligne `gallery-sheet.html` de `.gitignore`.
- Commit `chore(galerie): retire le script gallery:sheet, remplace par /admin/galerie`.

---

## Self-review (fait à l'écriture)

**Couverture de la spec :**

- Page `/admin/galerie` + auth + fetch → Task 11 ✓
- Lien de nav → Task 11 ✓
- `GalleryAdmin` orchestrateur + état optimiste → Task 10 ✓
- `AddMediaForm` : upload, description obligatoire ≥ 10, extraction poster+dims vidéo navigateur, refus > 8 Mo → Task 9 ✓
- `SortableGrid` / `SortableTile` : dnd-kit, poubelle par tuile, `stopPropagation` sur la poubelle, badge vidéo, `#sort_order` → Task 8 ✓
- `POST /api/gallery` : auth 401, alt ≥ 10, whitelist types, sharp (rotate+resize 1400+jpeg 80), sort_order = max+1, poster optionnel, garde-fou 20 Mo, `revalidateTag` → Task 4 ✓
- `GET /api/gallery` (fallback réordonnancement) → Task 4 ✓
- `DELETE /api/gallery/[id]` : auth, 404 si absent, remove Storage best-effort, delete DB, `revalidateTag` → Task 5 ✓
- `PATCH /api/gallery/order` : auth, validation du corps, update en lot, `revalidateTag` → Task 6 ✓
- `lib/adminAuth.ts` extrait + refactor settings → Task 1 ✓
- `lib/slug.ts` : slugify + storagePathFromUrl → Task 2 ✓
- Bouton Export PDF + `lib/galleryPdf.ts` (jspdf dynamique, vignettes 600px, grille 3 col, saut de page, image indisponible) → Task 7 + Task 10 ✓
- Dépendances `@dnd-kit/*`, `jspdf`, `sharp` en deps → Task 3 ✓
- `e2e/galerie-admin.spec.ts` contrats 401 + redirect → Task 12 ✓
- Test manuel checklist → Task 13 ✓
- Rollback (retrait du lien de nav) → Task 13 ✓
- `supabase-schema.sql` inchangé (RLS déjà correcte, Spec 1) → confirmé, aucune tâche

**Placeholders :** aucun TODO/TBD. Les « ou inline » de la spec sont tranchés dans le plan (fichiers dédiés : `AddMediaForm.tsx`, `SortableGrid.tsx`, `galleryPdf.ts`). La confirmation de suppression est tranchée : `window.confirm` (Task 8).

**Cohérence des types :** `GalleryItem` (de `lib/gallery.ts`, Spec 1) utilisé partout à l'identique — `AddMediaForm.onAdded`, `SortableGrid.items/onReorder`, `GalleryAdmin.initialItems`, `galleryPdf.exportGalleryPdf`, la page. `getAuthUser()` : signature stable Task 1 → Tasks 4/5/6. `slugify` / `storagePathFromUrl` : Task 2 → Tasks 4/5. Tag cache `"gallery-items"` : cohérent avec Spec 1 (`lib/gallery.ts`). Route `POST` renvoie exactement les colonnes du `select` de `GalleryItem`.

**Écart spec/plan corrigé inline :** la spec dit « le plan tranchera » pour l'organisation des sous-composants et pour `window.confirm` vs modale — le plan tranche (fichiers dédiés, `window.confirm` pour V1). La spec mentionne `@dnd-kit/modifiers` dans la liste d'install mais le code de `SortableGrid` ne l'utilise pas (rectSortingStrategy suffit) : je l'installe quand même (Task 3) car sans coût et utile si on ajoute une contrainte de déplacement plus tard — noté, non bloquant.
