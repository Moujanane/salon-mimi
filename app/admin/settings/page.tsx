// app/admin/settings/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { getSettings } from "@/lib/settings";
import SettingsForm from "@/components/admin/SettingsForm";

export default async function SettingsPage() {
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

  const settings = await getSettings();

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-playfair text-3xl text-brun">Paramètres</h1>
        <p className="text-sm text-gray-500 mt-1">
          Numéro WhatsApp et prix des services.
        </p>
      </div>
      <SettingsForm initial={settings} />
    </div>
  );
}
