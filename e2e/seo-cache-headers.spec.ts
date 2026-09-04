import { test, expect } from "@playwright/test";

/**
 * Non-régression SEO — hreflang x-default du header Link.
 *
 * Contexte : le middleware next-intl génère un header Link avec
 * hreflang="x-default" pointant vers l'apex "/" (avec slash) alors que le
 * <link> HTML (app/[locale]/layout.tsx) pointe vers "/fr" (sans slash).
 * Google privilégie le <link> HTML donc ce n'était pas critique, mais
 * l'incohérence est corrigée dans middleware.ts.
 *
 * Note sur Cache-Control : les pages [locale] renvoient
 * "Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate"
 * en production. Investigation faite (session du 04/09/2026) : ce n'est PAS
 * next-intl qui fixe ce header dans sa réponse de middleware — à ce stade,
 * la réponse est un simple signal de continuation interne
 * (x-middleware-next: "1"), sans aucun header cache-control. Le no-store
 * réel est appliqué plus tard par le moteur de rendu Next.js, parce que
 * next-intl lit la locale via headers() (Dynamic API) au lieu d'appeler
 * setRequestLocale() dans app/[locale]/layout.tsx et page.tsx — ce qui force
 * le rendu dynamique de TOUTES les pages [locale], quel que soit
 * `export const revalidate`. Un rewrite de header dans middleware.ts ne peut
 * pas corriger ce comportement car il agit sur la réponse finale, pas sur ce
 * signal intermédiaire. Le vrai fix (ajouter setRequestLocale() dans les
 * layouts/pages pour activer le rendu statique de next-intl) est un
 * changement plus large, hors périmètre de cette tâche middleware —
 * documenté ici pour suivi, pas testé en non-régression tant qu'il n'est
 * pas implémenté.
 *
 * Ces tests verrouillent :
 *  1. Le header Link hreflang x-default (s'il existe) est cohérent avec le
 *     <link> HTML, ou est absent — sur les pages racine ET sur des pages
 *     imbriquées (le format généré par next-intl diffère entre les deux :
 *     apex avec slash final pour la racine, chemin sans préfixe de locale
 *     et sans slash final pour une page imbriquée comme /en/services).
 *  2. /admin et /mimi ne sont PAS affectés par le changement (comportement
 *     inchangé).
 */

const LOCALE_PAGES = ["/fr", "/en", "/es", "/en/services", "/fr/reservation"];

for (const path of LOCALE_PAGES) {
  test(`${path} — hreflang x-default cohérent entre header Link et <link> HTML`, async ({
    request,
  }) => {
    const res = await request.get(path);
    const linkHeader = res.headers()["link"] ?? "";
    const html = await res.text();

    const htmlMatch = html.match(
      /<link[^>]+hreflang="x-default"[^>]+href="([^"]+)"/i,
    );
    expect(
      htmlMatch,
      "x-default <link> doit exister dans le HTML",
    ).not.toBeNull();
    const htmlXDefault = htmlMatch![1];

    if (linkHeader.includes("x-default")) {
      const headerMatch = linkHeader.match(
        /<([^>]+)>;\s*rel="alternate";\s*hreflang="x-default"/,
      );
      if (headerMatch) {
        expect(headerMatch[1]).toBe(htmlXDefault);
      }
    }
  });
}

test("/admin/login reste non affecté (redirection ou 200, jamais de crash)", async ({
  request,
}) => {
  const res = await request.get("/admin/login");
  expect(res.status()).toBeLessThan(500);
});

test("/mimi.html reste servi normalement", async ({ request }) => {
  const res = await request.get("/mimi.html");
  expect(res.status()).toBe(200);
});
