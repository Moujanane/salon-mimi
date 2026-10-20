// app/admin/settings/page.tsx
import { redirect } from "next/navigation";
import { getAdminStatus } from "@/lib/adminAuth";
import { getSettings } from "@/lib/settings";
import SettingsForm from "@/components/admin/SettingsForm";

export const metadata = {
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  // Administrateur uniquement : session valide ET e-mail dans ADMIN_EMAILS.
  const { user, decision } = await getAdminStatus();
  if (!decision.admin) redirect(user ? "/admin/acces-refuse" : "/admin/login");

  const settings = await getSettings();

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-playfair text-3xl text-brun">Paramètres</h1>
        <p className="text-sm text-gray-500 mt-1">
          Numéro WhatsApp et prix des services.
        </p>
      </div>
      <SettingsForm key={JSON.stringify(settings)} initial={settings} />
    </div>
  );
}
