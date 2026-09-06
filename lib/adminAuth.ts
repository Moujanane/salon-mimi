// lib/adminAuth.ts
//
// Vérifie qu'une session admin Supabase valide est présente sur la requête.
// Utilisé par toutes les API routes /api/* qui écrivent des données admin.
// Retourne l'utilisateur ou null (jamais d'exception).

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

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
  return user;
}
