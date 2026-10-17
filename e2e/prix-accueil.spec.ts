import { test, expect } from "@playwright/test";

// Les 4 cartes « Services vedettes » de l'accueil doivent afficher les prix du
// catalogue (lib/services-data.ts), identiques à ceux du JSON-LD. Régression
// corrigée le 17/10/2026 : l'accueil affichait 150/150/180/180 MAD (valeurs
// saisies en base) alors que le schéma annonçait 500/700/650/300 MAD.

const PRIX_ATTENDUS = [
  { nom: "Box Braids medium", mad: 500, eur: 47 },
  { nom: "Knotless Braids", mad: 700, eur: 66 },
  { nom: "Boho / Goddess Braids", mad: 650, eur: 61 },
  { nom: "Cornrows full head", mad: 300, eur: 28 },
];

test.describe("Prix de l'accueil", () => {
  for (const locale of ["fr", "en", "es"]) {
    test(`les cartes vedettes affichent les bons prix (${locale})`, async ({
      page,
    }) => {
      await page.goto(`/${locale}`);
      // Uniquement la section « Services vedettes » (pas le reste de la page)
      const cartes = page
        .locator("section", {
          has: page.getByRole("heading", {
            name: /vedettes|featured services|destacados/i,
          }),
        })
        .first();
      for (const p of PRIX_ATTENDUS) {
        await expect(cartes).toContainText(new RegExp(`${p.mad}\\s*MAD`));
        await expect(cartes).toContainText(new RegExp(`~${p.eur}\\s*€`));
      }
      // Anciennes valeurs erronées
      await expect(cartes).not.toContainText(/\b150\s*MAD/);
      await expect(cartes).not.toContainText(/\b180\s*MAD/);
      await expect(cartes).not.toContainText(/\b550\s*MAD/);
    });
  }

  test("le JSON-LD annonce les mêmes prix que la page", async ({ page }) => {
    await page.goto("/fr");
    const blocs = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    const tout = blocs.join("\n");
    expect(tout).toContain("box braids medium sont à 500 MAD");
    expect(tout).not.toMatch(/\b550\s*MAD/);
    expect(tout).toMatch(/"price":"500"/);
  });
});
