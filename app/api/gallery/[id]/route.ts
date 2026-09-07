// app/api/gallery/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getAuthUser } from "@/lib/adminAuth";
import { storagePathFromUrl } from "@/lib/slug";
import { normalizeCategory } from "@/lib/gallery-categories";

export const dynamic = "force-dynamic";

// --- PATCH : éditer les métadonnées d'un média (description + catégorie) ---
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser();
  if (!user)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }
  const { alt, category } = (body ?? {}) as {
    alt?: unknown;
    category?: unknown;
  };

  const patch: { alt?: string; category?: string | null } = {};

  if (alt !== undefined) {
    if (typeof alt !== "string" || alt.trim().length < 10) {
      return NextResponse.json(
        { error: "Description trop courte (10 caractères minimum)" },
        { status: 400 },
      );
    }
    patch.alt = alt.trim();
  }

  // category: "" ou null → non classé ; valeur hors liste fixe → 400
  if (category !== undefined) {
    if (
      category !== null &&
      category !== "" &&
      normalizeCategory(category) === null
    ) {
      return NextResponse.json(
        { error: "Catégorie inconnue" },
        { status: 400 },
      );
    }
    patch.category = normalizeCategory(category);
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Rien à modifier" }, { status: 400 });
  }

  const { data: updated, error } = await supabaseAdmin
    .from("gallery_items")
    .update(patch)
    .eq("id", id)
    .select(
      "id, type, url, poster_url, alt, sort_order, width, height, category",
    )
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  if (!updated)
    return NextResponse.json({ error: "Média introuvable" }, { status: 404 });

  revalidateTag("gallery-items");
  return NextResponse.json(updated);
}

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
