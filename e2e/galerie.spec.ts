import { test, expect } from "@playwright/test";

// Ces tests s'exécutent contre l'URL PLAYWRIGHT_BASE_URL (prod par défaut,
// localhost:3100 en local). Le comportement dépend du flag
// NEXT_PUBLIC_GALLERY_DYNAMIC de l'environnement testé.

test.describe("Galerie", () => {
  test("la page répond et affiche un titre", async ({ page }) => {
    const res = await page.goto("/fr/galerie");
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toContainText(/galerie/i);
  });

  test("le texte indexable est présent (SEO)", async ({ page }) => {
    await page.goto("/fr/galerie");
    await expect(page.locator("body")).toContainText(/Jamaa El Fna/);
  });

  test("au moins un média est affiché", async ({ page }) => {
    await page.goto("/fr/galerie");
    const media = page.locator("img, video");
    await expect(media.first()).toBeVisible();
  });

  test("ouvrir puis fermer un média en plein écran", async ({ page }) => {
    await page.goto("/fr/galerie");

    const cell = page
      .locator(
        "button[aria-label*='photo'], button[aria-label*='vidéo'], button[aria-label*='Agrandir'], button[aria-label*='Voir']",
      )
      .first();
    const hasLightbox = (await cell.count()) > 0;
    test.skip(!hasLightbox, "Lightbox absente (ancien rendu, flag off)");

    await cell.click();
    const dialog = page.locator("[role='dialog'][aria-modal='true']");
    await expect(dialog).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });
});
