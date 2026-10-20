// app/admin/dashboard/page.tsx
import { redirect } from "next/navigation";
import { getAdminStatus } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import ReservationsTable from "@/components/admin/ReservationsTable";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  // Administrateur uniquement : session valide ET e-mail dans ADMIN_EMAILS.
  const { user, decision } = await getAdminStatus();
  if (!decision.admin) {
    // Connecté mais non autorisé : page qui explique pourquoi (et non plus une
    // redirection muette vers la connexion).
    redirect(user ? "/admin/acces-refuse" : "/admin/login");
  }

  // Lecture avec la clé serveur, APRÈS la vérification administrateur. Elle ne
  // dépend plus des règles de la base pour les comptes connectés (supprimées :
  // supabase/migrations/2026-10-19-security-hardening.sql).
  const { data: reservations, error } = await supabaseAdmin
    .from("reservations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="text-red-600 text-center py-10">
        Erreur : {error.message}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-playfair text-3xl text-brun">Réservations</h1>
        <span className="text-sm text-gray-500">
          {reservations?.length ?? 0} au total
        </span>
      </div>
      <ReservationsTable reservations={reservations ?? []} />
    </div>
  );
}
