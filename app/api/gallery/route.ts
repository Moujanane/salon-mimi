// app/api/gallery/route.ts
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import sharp from "sharp";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getAuthUser } from "@/lib/adminAuth";
import { slugify } from "@/lib/slug";
import { normalizeCategory } from "@/lib/gallery-categories";

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
    .select(
      "id, type, url, poster_url, alt, sort_order, width, height, category",
    )
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

  // NB : request.formData() bufferise tout le corps avant les contrôles de
  // taille ci-dessous. Le vrai plafond de taille de requête doit être imposé
  // au niveau de Railway / du proxy (client_max_body_size).
  const form = await request.formData();
  const file = form.get("file");
  const alt = String(form.get("alt") ?? "").trim();
  const category = normalizeCategory(form.get("category"));

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

    let processed: Buffer;
    try {
      // limitInputPixels : garde-fou contre les images "bombe" (petit fichier
      // compressé qui décompresse en des centaines de Mo de bitmap et peut
      // faire tomber le conteneur). 40 Mpx est large pour des photos de salon.
      processed = await sharp(input, { limitInputPixels: 40_000_000 })
        .rotate()
        .resize({ width: 1400, withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();
      const meta = await sharp(processed).metadata();
      width = meta.width ?? null;
      height = meta.height ?? null;
    } catch {
      return NextResponse.json(
        { error: "Image illisible ou trop volumineuse" },
        { status: 400 },
      );
    }

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
      category,
    })
    .select(
      "id, type, url, poster_url, alt, sort_order, width, height, category",
    )
    .single();

  if (insErr)
    return NextResponse.json({ error: insErr.message }, { status: 500 });

  revalidateTag("gallery-items");
  return NextResponse.json(inserted, { status: 201 });
}
