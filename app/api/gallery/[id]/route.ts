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
