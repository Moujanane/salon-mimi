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
        const resp = await page.goto(url);
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
