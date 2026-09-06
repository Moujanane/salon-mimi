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
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  return <GalleryAdmin initialItems={(items ?? []) as GalleryItem[]} />;
}
