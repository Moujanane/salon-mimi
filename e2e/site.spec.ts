import { test, expect } from "@playwright/test";

test.describe("Page d'accueil", () => {
  test("s'affiche correctement", async ({ page }) => {
    await page.goto("/fr");
    await expect(page).toHaveTitle(/Salon Mimi/);
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("le bouton Prendre rendez-vous est visible", async ({ page }) => {
    await page.goto("/fr");
    const cta = page
      .getByRole("link", { name: /rendez-vous|réserver/i })
      .first();
    await expect(cta).toBeVisible();
  });

  test("le bouton WhatsApp est visible", async ({ page }) => {
    await page.goto("/fr");
    const wa = page.getByRole("link", { name: /whatsapp/i }).first();
    await expect(wa).toBeVisible();
  });
});

test.describe("Navigation", () => {
  test("le menu contient les liens principaux", async ({ page }) => {
    await page.goto("/fr");
    // Sur mobile, les liens sont dans un drawer burger — on l'ouvre d'abord
    const burger = page.getByRole("button", { name: /menu/i });
    if (await burger.isVisible()) {
      await burger.click();
    }
    await expect(
      page.getByRole("link", { name: /services/i }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /contact/i }).first(),
    ).toBeVisible();
  });

  test("la page services s'affiche", async ({ page }) => {
    await page.goto("/fr/services");
    await expect(page).toHaveURL(/\/fr\/services/);
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("la page contact s'affiche", async ({ page }) => {
    await page.goto("/fr/contact");
    await expect(page).toHaveURL(/\/fr\/contact/);
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });
});

test.describe("Formulaire de réservation", () => {
  test("la page réservation s'affiche", async ({ page }) => {
    await page.goto("/fr/reservation");
    await expect(page).toHaveURL(/\/fr\/reservation/);
    await expect(page.locator("form, input").first()).toBeVisible();
  });

  test("les champs obligatoires sont présents", async ({ page }) => {
    await page.goto("/fr/reservation");
    await expect(
      page.locator("input[name='name'], input[placeholder*='nom' i]").first(),
    ).toBeVisible();
    await expect(
      page
        .locator(
          "input[name='phone'], input[placeholder*='téléphone' i], input[type='tel']",
        )
        .first(),
    ).toBeVisible();
  });
});

test.describe("SEO", () => {
  test("la meta description est présente", async ({ page }) => {
    await page.goto("/fr");
    const meta = page.locator("meta[name='description']");
    await expect(meta).toHaveAttribute("content", /marrakech/i);
  });

  test("le JSON-LD HairSalon est présent", async ({ page }) => {
    await page.goto("/fr");
    const jsonld = page.locator("script[type='application/ld+json']").first();
    await expect(jsonld).toBeAttached();
  });
});

test.describe("Responsive mobile", () => {
  test("le contenu s'affiche sans scroll horizontal", async ({ page }) => {
    await page.goto("/fr");
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = page.viewportSize()?.width ?? 390;
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5);
  });
});
