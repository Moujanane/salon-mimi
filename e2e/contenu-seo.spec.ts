import { test, expect } from "@playwright/test";

// Contenus ajoutés pour le SEO (calculés depuis le catalogue) + garde-fou de
// structure : un seul H1 par page.

const TITRES_ACCUEIL: Record<string, string> = {
  fr: "Salon de tresses africaines à Marrakech",
  en: "African braiding salon in Marrakech",
  es: "Salón de trenzas africanas en Marrakech",
};

test.describe("Contenus SEO", () => {
  for (const locale of ["fr", "en", "es"]) {
    test(`accueil : introduction « réponse directe » avec prix (${locale})`, async ({
      page,
    }) => {
      await page.goto(`/${locale}`);
      const titre = page.getByRole("heading", {
        level: 2,
        name: TITRES_ACCUEIL[locale],
      });
      await expect(titre).toBeVisible();
      const section = page.locator("section", { has: titre });
      await expect(section).toContainText("Jamaa El Fna");
      await expect(section).toContainText(/500\s*MAD/);
      await expect(section).toContainText(/700\s*MAD/);
      await expect(section).toContainText(/300\s*MAD/);
    });
  }

  test("à propos : « L'essentiel » avec coordonnées", async ({ page }) => {
    await page.goto("/fr/a-propos");
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "L'essentiel en un coup d'œil",
      }),
    ).toBeVisible();
    await expect(page.locator("body")).toContainText("+212710388204");
    await expect(page.locator("body")).toContainText("Place Jamaa El Fna");
  });

  test("contact : informations pratiques", async ({ page }) => {
    await page.goto("/fr/contact");
    await expect(
      page.getByRole("heading", { level: 2, name: "Informations pratiques" }),
    ).toBeVisible();
    await expect(page.locator("body")).toContainText("+212710388204");
  });

  test("galerie : styles avec liens de réservation", async ({ page }) => {
    await page.goto("/fr/galerie");
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "Styles de tresses réalisés au salon",
      }),
    ).toBeVisible();
    const liens = page.locator('a[href*="/fr/reservation?service="]');
    expect(await liens.count()).toBeGreaterThanOrEqual(5);
  });
});

test.describe("Structure : un seul H1 par page", () => {
  for (const path of [
    "/fr",
    "/en",
    "/es",
    "/fr/services",
    "/fr/galerie",
    "/fr/a-propos",
    "/fr/contact",
    "/fr/reservation",
  ]) {
    test(`${path} : exactement un H1`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator("h1")).toHaveCount(1);
    });
  }
});

test.describe("Réponse directe dans les 150 premiers mots (critère GEO)", () => {
  for (const locale of ["fr", "en", "es"]) {
    test(`l'introduction de l'accueil se termine avant le mot 150 (${locale})`, async ({
      page,
    }) => {
      await page.goto(`/${locale}`);
      const intro = page.locator("section", {
        has: page.locator("#intro-title"),
      });
      const paragraphe = (await intro.locator("p").first().innerText())
        .replace(/\s+/g, " ")
        .trim();
      const principal = (await page.locator("main").innerText())
        .replace(/\s+/g, " ")
        .trim();
      const debut = principal.indexOf(paragraphe);
      expect(debut).toBeGreaterThan(-1);
      const motsJusqueFin = principal
        .slice(0, debut + paragraphe.length)
        .split(" ").length;
      expect(motsJusqueFin).toBeLessThanOrEqual(150);
    });
  }
});
