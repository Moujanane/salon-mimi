import { OAuth2Client } from "google-auth-library";

const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";

/** Corps d'une requête searchAnalytics.query. */
export function buildQueryBody({
  startDate,
  endDate,
  dimensions = [],
  rowLimit = 25000,
  dimensionFilterGroups,
}) {
  const body = { startDate, endDate, dimensions, rowLimit };
  if (dimensionFilterGroups) body.dimensionFilterGroups = dimensionFilterGroups;
  return body;
}

/** Extrait le tableau `rows` d'une réponse GSC (ou [] si vide). */
export function parseGscRows(json) {
  return Array.isArray(json?.rows) ? json.rows : [];
}

/**
 * Crée un client GSC authentifié par OAuth utilisateur (refresh token).
 * @param {object} auth
 * @param {string} auth.clientId
 * @param {string} auth.clientSecret
 * @param {string} auth.refreshToken
 * @param {string} siteUrl - ex 'sc-domain:atlas-swincar.com' ou 'https://mimi-coiffure.com/'.
 */
export function createGscClient(
  { clientId, clientSecret, refreshToken },
  siteUrl,
) {
  const oauth2 = new OAuth2Client(clientId, clientSecret);
  oauth2.setCredentials({ refresh_token: refreshToken, scope: SCOPE });
  const endpoint =
    `https://searchconsole.googleapis.com/webmasters/v3/sites/` +
    `${encodeURIComponent(siteUrl)}/searchAnalytics/query`;

  return {
    /** Lance une requête et renvoie les `rows`. Lève sur 4xx/5xx. */
    async query(opts) {
      const { token } = await oauth2.getAccessToken();
      if (!token)
        throw new Error(
          "GSC: impossible d'obtenir un access token (refresh token invalide ?)",
        );
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildQueryBody(opts)),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          `GSC ${res.status} ${res.statusText} — ${text.slice(0, 500)}`,
        );
      }
      return parseGscRows(await res.json());
    },
  };
}
