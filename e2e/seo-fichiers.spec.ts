import { test, expect } from "@playwright/test";

// Fichiers servis aux robots : /llms.txt (résumé pour les moteurs IA, généré
// depuis le catalogue) et /sitemap.xml (lastmod = date réelle de révision).

test.describe("llms.txt", () => {
  test("répond 200 en texte brut, avec les prix du catalogue", async ({
    request,
  }) => {
    const res = await request.get("/llms.txt");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("text/plain");
    const body = await res.text();
    expect(body.startsWith("# Salon Mimi")).toBe(true);
    expect(body).toContain("Box Braids medium : 500 MAD");
    expect(body).not.toMatch(/\b550\b/);
    expect(body).toContain("https://mimi-coiffure.com/fr/services");
  });

  test("pas de redirection vers une langue", async ({ request }) => {
    const res = await request.get("/llms.txt", { maxRedirects: 0 });
    expect(res.status()).toBe(200);
  });
});

test.describe("sitemap.xml", () => {
  test("lastmod identique à la date de révision affichée sur l'accueil", async ({
    request,
    page,
  }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    const lastmods = [...xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map(
      (m) => m[1],
    );
    expect(lastmods).toHaveLength(24);

    await page.goto("/fr");
    const iso = await page
      .locator("time[datetime]")
      .first()
      .getAttribute("datetime");
    for (const l of lastmods) {
      expect(l.slice(0, 10)).toBe(iso);
    }
  });
});
