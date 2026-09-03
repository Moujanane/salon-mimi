import { test, expect } from "@playwright/test";

/**
 * Non-régression SEO — cohérence trailing slash.
 *
 * Contexte : le serveur Next.js (trailingSlash: false) redirige toute URL en
 * /.../ vers sa version sans slash en 308. Si le sitemap, les <link canonical>
 * ou les <link hreflang> pointent vers des URLs AVEC slash final, Google les
 * classe en « Page avec redirection » / « Autre page avec balise canonique
 * correcte » et ne les indexe pas.
 *
 * Ces tests verrouillent :
 *  1. Le sitemap ne contient que des URLs qui répondent 200 (pas de 3xx).
 *  2. Le <link rel="canonical"> de chaque page s'auto-référence exactement
 *     (même URL, sans slash final, sans redirection).
 *  3. Les <link rel="alternate" hreflang> ne finissent jamais par "/".
 *  4. L'URL canonical d'une page à paramètre (?service=) ignore le paramètre.
 */

/** Extrait toutes les URLs <loc> d'un sitemap XML sans dépendre de String.matchAll. */
function extractLocs(xml: string): string[] {
  const re = /<loc>([^<]+)<\/loc>/g;
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    out.push(m[1]);
  }
  return out;
}

const LOCALES = ["fr", "en", "es"] as const;
const PATHS = [
  "",
  "/services",
  "/galerie",
  "/reservation",
  "/a-propos",
  "/contact",
  "/mentions-legales",
  "/politique-de-confidentialite",
] as const;

test.describe("SEO — sitemap", () => {
  test("le sitemap ne liste que des URLs sans slash final (hors racine)", async ({
    request,
  }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const xml = await res.text();
    const locs = extractLocs(xml);
    expect(locs.length).toBeGreaterThan(0);

    for (const loc of locs) {
      const path = new URL(loc).pathname;
      // La racine "/" est tolérée ; toute autre URL ne doit pas finir par "/"
      if (path !== "/") {
        expect(path.endsWith("/"), `${loc} ne doit pas finir par "/"`).toBe(
          false,
        );
      }
    }
  });

  test("chaque URL du sitemap répond 200 sans redirection", async ({
    request,
  }) => {
    const res = await request.get("/sitemap.xml");
    const xml = await res.text();
    const locs = extractLocs(xml);

    for (const loc of locs) {
      const r = await request.get(loc, { maxRedirects: 0 });
      expect(
        r.status(),
        `${loc} devrait répondre 200 (a répondu ${r.status()})`,
      ).toBe(200);
    }
  });
});

test.describe("SEO — canonical auto-référent", () => {
  for (const locale of LOCALES) {
    for (const path of PATHS) {
      const url = `/${locale}${path}`;
      test(`${url} : canonical == son URL, sans slash final`, async ({
        page,
      }) => {
        // Le <link canonical> est dans le HTML initial (SSR) : "commit" suffit,
        // pas besoin d'attendre "load" (évite les timeouts sur /services,
        // la page la plus lourde, quand le CPU mobile émulé est saturé).
        const resp = await page.goto(url, { waitUntil: "commit" });
        expect(resp?.status()).toBe(200);

        const canonical = await page
          .locator('link[rel="canonical"]')
          .getAttribute("href");
        expect(canonical).toBeTruthy();
        expect(canonical!.endsWith("/")).toBe(false);
        expect(new URL(canonical!).pathname).toBe(url);
      });
    }
  }
});

test.describe("SEO — hreflang sans slash final", () => {
  test("/fr : aucun hreflang ne finit par un slash", async ({ page }) => {
    await page.goto("/fr");
    const hrefs = await page
      .locator('link[rel="alternate"][hreflang]')
      .evaluateAll((els) => els.map((e) => e.getAttribute("href") ?? ""));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const h of hrefs) {
      expect(h.endsWith("/"), `${h} ne doit pas finir par "/"`).toBe(false);
    }
  });
});

test.describe("SEO — canonical ignore le paramètre ?service=", () => {
  test("/fr/reservation?service=box-braids canonicalise vers /fr/reservation", async ({
    page,
  }) => {
    await page.goto("/fr/reservation?service=box-braids");
    const canonical = await page
      .locator('link[rel="canonical"]')
      .getAttribute("href");
    expect(new URL(canonical!).pathname).toBe("/fr/reservation");
    expect(new URL(canonical!).search).toBe("");
  });
});

/**
 * Non-régression : routing [locale] strict.
 *
 * Avant le fix (commit de la session), toute URL contenant un point
 * (/index.html, /abc.xyz, ...) était ignorée par le matcher du middleware,
 * routée sur app/[locale]/page.tsx avec locale = "abc.xyz", et servait une
 * COPIE de la page d'accueil (HTTP 200) avec <html lang="abc.xyz"> et un
 * <link canonical> auto-référent vers l'URL bidon. Google la classait alors
 * en « Page en double sans URL canonique sélectionnée par l'utilisateur ».
 *
 * Fix : generateStaticParams + dynamicParams = false dans le layout (seules
 * /fr /en /es sont des routes valides) + redirects index.html/htm/php → /.
 */
test.describe("SEO — routing [locale] strict", () => {
  const VALID = ["/fr", "/en", "/es"] as const;

  // URLs à point : AVANT le fix elles sautaient le middleware et servaient une
  // copie de la home en 200. Doivent être 404 direct (0 redirection).
  const INVALID_DOTTED = [
    "/abc.xyz",
    "/nimportequoi.html",
    "/sitemap.html",
    "/index.aspx",
  ] as const;

  // URLs sans point avec segment inconnu : le middleware next-intl les préfixe
  // avec la locale par défaut (308) puis Next.js rend une vraie 404. Jamais une
  // copie de la home. Ce comportement était déjà correct avant le fix.
  const INVALID_PREFIXED = ["/de", "/fr-FR", "/foobar"] as const;

  for (const path of VALID) {
    test(`${path} répond 200`, async ({ request }) => {
      const r = await request.get(path, { maxRedirects: 0 });
      expect(r.status()).toBe(200);
    });

    test(`${path} : <html lang> vaut la locale exacte`, async ({ page }) => {
      await page.goto(path, { waitUntil: "commit" });
      const lang = await page.locator("html").getAttribute("lang");
      expect(["fr", "en", "es"]).toContain(lang);
      expect(lang).toBe(path.slice(1));
    });
  }

  for (const path of INVALID_DOTTED) {
    test(`${path} répond 404 direct (pas une copie de la home)`, async ({
      request,
    }) => {
      const r = await request.get(path, { maxRedirects: 0 });
      expect(
        r.status(),
        `${path} devrait être 404 direct (a répondu ${r.status()})`,
      ).toBe(404);
    });
  }

  for (const path of INVALID_PREFIXED) {
    test(`${path} finit en 404 (jamais une copie de la home)`, async ({
      page,
    }) => {
      const resp = await page.goto(path);
      expect(resp?.status()).toBe(404);
      // Pas le <title> de la home
      const title = await page.title();
      expect(title).not.toMatch(/Salon Mimi — Tresses/);
    });
  }

  for (const file of ["/index.html", "/index.htm", "/index.php"]) {
    test(`${file} redirige (301/308) vers la racine`, async ({ request }) => {
      const r = await request.get(file, { maxRedirects: 0 });
      expect([301, 308]).toContain(r.status());
      const loc = r.headers()["location"];
      expect(loc === "/" || loc?.endsWith("mimi-coiffure.com/")).toBe(true);
    });
  }
});
