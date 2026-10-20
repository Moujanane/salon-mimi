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
import { adminDecision, maskEmail } from "@/lib/adminPolicy";

/**
 * Session Supabase de la requête + décision d'accès administrateur avec la
 * raison précise d'un refus (pour afficher une page d'explication à un compte
 * connecté mais non autorisé). Journalise la raison côté serveur, avec l'adresse
 * masquée et sans jamais écrire la liste des administrateurs.
 */
export async function getAdminStatus() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } },
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const decision = adminDecision(user, process.env.ADMIN_EMAILS);
  if (user && !decision.admin) {
    console.error(
      `[adminAuth] accès admin refusé (${decision.reason}) : compte ${maskEmail(user.email)}, ${decision.configured} adresse(s) configurée(s) dans ADMIN_EMAILS.`,
    );
  }
  return { user, decision };
}

/** Utilisateur administrateur de la requête, ou null (jamais d'exception). */
export async function getAuthUser() {
  const { user, decision } = await getAdminStatus();
  return decision.admin ? user : null;
}
