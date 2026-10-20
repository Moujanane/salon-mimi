// lib/adminPolicy.ts
//
// Règle « qui est administrateur ? », sans dépendance à Next.js (testable).
//
// Sans cette règle, tout compte Supabase connecté était administrateur : les
// inscriptions étant ouvertes, n'importe qui pouvait se créer un compte puis
// modifier les réglages, la galerie et les réservations.
//
// Un utilisateur est administrateur si son e-mail est dans la variable
// d'environnement ADMIN_EMAILS ET si cet e-mail est confirmé. Variable absente
// ou vide = personne n'est administrateur (refus par défaut).
//
// La variable est lue de façon TOLÉRANTE : adresses séparées par des virgules,
// des points-virgules ou des espaces, et guillemets autour d'une adresse ignorés
// (erreurs fréquentes quand on colle la valeur dans l'interface de Railway). Une
// adresse e-mail ne contenant ni espace, ni virgule, ni guillemet, cette
// tolérance ne peut pas faire correspondre une adresse différente.

type UserLike = {
  email?: string | null;
  email_confirmed_at?: string | null;
};

/** Liste normalisée (minuscules, sans espaces, guillemets ni entrées vides). */
export function parseAdminEmails(raw: string | null | undefined): string[] {
  return (raw ?? "")
    .split(/[\s,;]+/)
    .map((e) => e.replace(/^["'`]+|["'`]+$/g, "").toLowerCase())
    .filter(Boolean);
}

export type AdminDecision =
  | { admin: true }
  | {
      admin: false;
      /** no-user : pas de session ; no-list : ADMIN_EMAILS absente ou vide ;
       *  not-confirmed : e-mail non confirmé ; not-in-list : adresse absente de la liste. */
      reason: "no-user" | "no-list" | "not-confirmed" | "not-in-list";
      /** Nombre d'adresses administrateur configurées (jamais les adresses). */
      configured: number;
    };

/** Décision d'accès avec la raison précise d'un éventuel refus. */
export function adminDecision(
  user: UserLike | null | undefined,
  rawAdminEmails: string | null | undefined,
): AdminDecision {
  const admins = parseAdminEmails(rawAdminEmails);
  const configured = admins.length;
  if (!user || !user.email)
    return { admin: false, reason: "no-user", configured };
  if (configured === 0) return { admin: false, reason: "no-list", configured };
  if (!user.email_confirmed_at) {
    return { admin: false, reason: "not-confirmed", configured };
  }
  if (!admins.includes(user.email.trim().toLowerCase())) {
    return { admin: false, reason: "not-in-list", configured };
  }
  return { admin: true };
}

export function isAdminUser(
  user: UserLike | null | undefined,
  rawAdminEmails: string | null | undefined,
): boolean {
  return adminDecision(user, rawAdminEmails).admin;
}

/** « mimi@exemple.com » -> « mi***@exemple.com » : pour les journaux serveur. */
export function maskEmail(email: string | null | undefined): string {
  if (!email) return "(aucun e-mail)";
  const at = email.indexOf("@");
  if (at < 1) return "***";
  return `${email.slice(0, Math.min(2, at))}***${email.slice(at)}`;
}
