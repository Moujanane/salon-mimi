// lib/validation.ts
//
// Validation CÔTÉ SERVEUR des champs saisis par les visiteurs et par l'admin.
// Le navigateur peut être contourné (appel direct à l'API) : toute donnée
// stockée ou affichée doit être vérifiée ici, jamais seulement dans la page.
//
// Utilisé par : app/api/reservations, app/api/contact, app/api/settings,
// app/api/mimi-settings. Tests : lib/validation.test.ts.

type Ok<T> = { ok: true; value: T };
type Err = { ok: false; error: string };

const isAbsent = (v: unknown) => v === undefined || v === null || v === "";

/** Adresse e-mail plausible, sans espace ni saut de ligne (pas d'injection d'en-tête). */
export function isValidEmail(v: unknown): v is string {
  return (
    typeof v === "string" &&
    v.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
  );
}

/** Téléphone saisi par un visiteur (même règle que la réservation). */
const PHONE_RE = /^\+?[\d\s\-().]{6,20}$/;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]?\d|2[0-3]):[0-5]\d$/;
// Libellés du formulaire : "1 personne", "4 people or more", "4 personas o más"…
const PERSONS_RE = /^[\p{L}\p{N} +.'’-]{1,40}$/u;

function isRealDate(s: string): boolean {
  if (!DATE_RE.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== s) {
    return false;
  }
  const year = d.getUTCFullYear();
  const maxYear = new Date().getUTCFullYear() + 3;
  return year >= 2020 && year <= maxYear;
}

/**
 * Champs optionnels d'une réservation (date, heure, nombre de personnes).
 * Retourne un message d'erreur, ou null si tout est valide. Les valeurs vides
 * ("", null, absent) sont acceptées : ces champs sont facultatifs.
 */
export function validateReservationExtras(input: {
  date_souhaitee?: unknown;
  heure_souhaitee?: unknown;
  nombre_personnes?: unknown;
}): string | null {
  const { date_souhaitee, heure_souhaitee, nombre_personnes } = input;

  if (!isAbsent(date_souhaitee)) {
    if (typeof date_souhaitee !== "string" || !isRealDate(date_souhaitee)) {
      return "Date invalide";
    }
  }
  if (!isAbsent(heure_souhaitee)) {
    if (typeof heure_souhaitee !== "string" || !TIME_RE.test(heure_souhaitee)) {
      return "Heure invalide";
    }
  }
  if (!isAbsent(nombre_personnes)) {
    if (
      typeof nombre_personnes !== "string" ||
      !PERSONS_RE.test(nombre_personnes)
    ) {
      return "Nombre de personnes invalide";
    }
  }
  return null;
}

export const PRICE_SETTING_KEYS = [
  "price_tresses_africaines",
  "price_tresses_et_nattes",
  "price_box_braids",
  "price_tresses_fulani",
  "price_tresses_boho",
  "price_locks_dreads",
  "price_cheveux_attaches",
  "price_perruques_tissage",
  "price_colorations",
  "price_ongles_soins_epilation",
] as const;

/**
 * Valide (et normalise) la valeur d'un réglage modifiable par l'admin ou par
 * Mimi. Une clé inconnue est refusée.
 */
export function validateSettingValue(
  key: string,
  value: unknown,
): Ok<string> | Err {
  if (key === "whatsapp_number") {
    if (typeof value !== "string" && typeof value !== "number") {
      return { ok: false, error: "Numéro WhatsApp invalide" };
    }
    const normalized = String(value)
      .trim()
      .replace(/[\s\-().]/g, "");
    if (!/^\+?\d{8,15}$/.test(normalized)) {
      return { ok: false, error: "Numéro WhatsApp invalide" };
    }
    return { ok: true, value: normalized };
  }

  if (key === "notification_email") {
    if (typeof value !== "string") {
      return { ok: false, error: "E-mail invalide" };
    }
    const email = value.trim();
    if (email === "") return { ok: true, value: "" };
    if (!isValidEmail(email)) return { ok: false, error: "E-mail invalide" };
    return { ok: true, value: email };
  }

  if ((PRICE_SETTING_KEYS as readonly string[]).includes(key)) {
    if (typeof value !== "string" && typeof value !== "number") {
      return { ok: false, error: "Prix invalide" };
    }
    const price = String(value).trim();
    if (!/^\d{1,5}$/.test(price)) return { ok: false, error: "Prix invalide" };
    return { ok: true, value: price };
  }

  return { ok: false, error: "Réglage inconnu" };
}

/**
 * Valide un corps de requête de mise à jour de réglages : « tout ou rien »
 * (une seule valeur invalide refuse la requête, rien n'est écrit). Les clés
 * non autorisées sont ignorées. Retourne les paires [clé, valeur normalisée].
 */
export function validateSettingsUpdates(
  body: unknown,
  allowedKeys: readonly string[],
): Ok<[string, string][]> | Err {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { ok: false, error: "Données invalides" };
  }
  const entries = Object.entries(body).filter(([key]) =>
    allowedKeys.includes(key),
  );
  if (entries.length === 0) return { ok: false, error: "Aucune clé valide" };

  const out: [string, string][] = [];
  for (const [key, value] of entries) {
    const result = validateSettingValue(key, value);
    if (!result.ok) return { ok: false, error: `${key} : ${result.error}` };
    out.push([key, result.value]);
  }
  return { ok: true, value: out };
}

export type ContactInput = {
  prenom: string;
  nom: string;
  telephone: string;
  email: string;
  demande: string;
};

const text = (v: unknown, min: number, max: number): string | null => {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length >= min && t.length <= max ? t : null;
};

/** Valide le corps du formulaire de contact. */
export function validateContactBody(body: unknown): Ok<ContactInput> | Err {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { ok: false, error: "Données invalides" };
  }
  const b = body as Record<string, unknown>;

  const prenom = text(b.prenom, 1, 80);
  const nom = text(b.nom, 1, 80);
  const telephone = text(b.telephone, 6, 20);
  const email = typeof b.email === "string" ? b.email.trim() : b.email;
  const demande = text(b.demande, 1, 2000);

  if (!prenom || !nom || !demande) {
    return { ok: false, error: "Champs manquants ou trop longs" };
  }
  if (!telephone || !PHONE_RE.test(telephone)) {
    return { ok: false, error: "Téléphone invalide" };
  }
  if (!isValidEmail(email)) return { ok: false, error: "E-mail invalide" };

  return { ok: true, value: { prenom, nom, telephone, email, demande } };
}
