// lib/adminAuth.ts
//
// Vérifie qu'une session ADMINISTRATEUR valide est présente sur la requête :
// session Supabase valide (vérifiée auprès de Supabase, pas seulement le cookie)
// ET e-mail confirmé présent dans ADMIN_EMAILS (lib/adminPolicy.ts).
//
// Avant, tout compte Supabase connecté était considéré comme administrateur ;
// les inscriptions étant ouvertes, n'importe qui pouvait se créer un compte et
// modifier les réglages, la galerie et les réservations.
//
// Utilisé par toutes les API routes /api/* qui écrivent des données admin et
// par les pages /admin/*. Retourne l'utilisateur administrateur ou null (jamais
// d'exception). Si ADMIN_EMAILS est absente, personne n'est administrateur.

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { isAdminUser } from "@/lib/adminPolicy";

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
  if (!user) return null;

  if (!process.env.ADMIN_EMAILS) {
    console.error(
      "[adminAuth] ADMIN_EMAILS n'est pas défini : aucun administrateur reconnu.",
    );
    return null;
  }
  return isAdminUser(user, process.env.ADMIN_EMAILS) ? user : null;
}
