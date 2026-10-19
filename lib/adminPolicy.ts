// lib/adminPolicy.ts
//
// Règle « qui est administrateur ? », sans dépendance à Next.js (testable).
//
// Sans cette règle, tout compte Supabase connecté était administrateur : les
// inscriptions étant ouvertes, n'importe qui pouvait se créer un compte puis
// modifier les réglages, la galerie et les réservations.
//
// Un utilisateur est administrateur si son e-mail est dans la variable
// d'environnement ADMIN_EMAILS (adresses séparées par des virgules) ET si cet
// e-mail est confirmé. Variable absente ou vide = personne n'est administrateur
// (refus par défaut).

type UserLike = {
  email?: string | null;
  email_confirmed_at?: string | null;
};

/** Liste normalisée (minuscules, sans espaces ni entrées vides). */
export function parseAdminEmails(raw: string | null | undefined): string[] {
  return (raw ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminUser(
  user: UserLike | null | undefined,
  rawAdminEmails: string | null | undefined,
): boolean {
  if (!user || !user.email || !user.email_confirmed_at) return false;
  const admins = parseAdminEmails(rawAdminEmails);
  if (admins.length === 0) return false;
  return admins.includes(user.email.trim().toLowerCase());
}
