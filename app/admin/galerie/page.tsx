// app/admin/galerie/page.tsx
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import GalleryAdmin from "@/components/admin/GalleryAdmin";
import type { GalleryItem } from "@/lib/gallery";

export const dynamic = "force-dynamic";
export const metadata = {
  robots: { index: false, follow: false },
};

export default async function GalerieAdminPage() {
  // Administrateur uniquement : session valide ET e-mail dans ADMIN_EMAILS.
  const user = await getAuthUser();
  if (!user) redirect("/admin/login");

  const { data: items } = await supabaseAdmin
    .from("gallery_items")
    .select(
      "id, type, url, poster_url, alt, sort_order, width, height, category",
    )
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  return <GalleryAdmin initialItems={(items ?? []) as GalleryItem[]} />;
}
