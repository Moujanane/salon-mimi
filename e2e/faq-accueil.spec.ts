import { test, expect, type Page } from "@playwright/test";

// La FAQ de l'accueil doit être visible ET balisée (JSON-LD FAQPage) avec les
// mêmes textes, dans les 3 langues. Les autres pages n'affichent pas de FAQ :
// elles ne doivent donc pas porter de balisage FAQPage (règle Google : le
// contenu balisé doit être visible). Régression corrigée le 17/10/2026 : le
// FAQPage était injecté par le layout sur toutes les pages, sans FAQ visible.

const QUESTIONS_ATTENDUES: Record<string, string[]> = {
  fr: [
    "Où se trouve le salon Mimi à Marrakech ?",
    "Quels sont les tarifs du salon Mimi Marrakech ?",
  ],
  en: [
    "Where is Salon Mimi in Marrakech?",
    "How much does Salon Mimi Marrakech charge?",
  ],
  es: [
    "¿Dónde está el salón Mimi en Marrakech?",
    "¿Cuáles son los precios del salón Mimi Marrakech?",
  ],
};

async function faqLd(page: Page) {
  const blocs = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  return blocs
    .map((b) => JSON.parse(b))
    .filter((d) => d["@type"] === "FAQPage");
}

test.describe("FAQ de l'accueil", () => {
  for (const locale of ["fr", "en", "es"]) {
    test(`la FAQ est visible et balisée à l'identique (${locale})`, async ({
      page,
    }) => {
      await page.goto(`/${locale}`);
      for (const q of QUESTIONS_ATTENDUES[locale]) {
        await expect(page.getByText(q, { exact: true })).toBeVisible();
      }

      const faq = await faqLd(page);
      expect(faq).toHaveLength(1);
      const entites = faq[0].mainEntity as {
        name: string;
        acceptedAnswer: { text: string };
      }[];
      expect(entites).toHaveLength(4);

      // Chaque question ET chaque réponse balisées sont affichées à l'écran
      const texteVisible = (await page.locator("body").innerText()).replace(
        /\s+/g,
        " ",
      );
      for (const e of entites) {
        expect(texteVisible).toContain(e.name);
        expect(texteVisible).toContain(
          e.acceptedAnswer.text.replace(/\s+/g, " "),
        );
      }

      // Prix à jour dans la réponse tarifs
      expect(entites[3].acceptedAnswer.text).toContain("500 MAD");
      expect(entites[3].acceptedAnswer.text).not.toMatch(/\b550\b/);
    });
  }

  for (const path of [
    "/fr/services",
    "/fr/a-propos",
    "/fr/reservation",
    "/fr/contact",
  ]) {
    test(`aucun FAQPage sur ${path} (pas de FAQ visible)`, async ({ page }) => {
      await page.goto(path);
      expect(await faqLd(page)).toHaveLength(0);
    });
  }
});

test.describe("Date de mise à jour", () => {
  for (const locale of ["fr", "en", "es"]) {
    test(`une date <time> visible = dateModified du balisage (${locale})`, async ({
      page,
    }) => {
      await page.goto(`/${locale}`);
      const time = page.locator("time[datetime]").first();
      await expect(time).toBeVisible();
      const iso = await time.getAttribute("datetime");
      expect(iso).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      await expect(time).not.toHaveText("");

      const blocs = await page
        .locator('script[type="application/ld+json"]')
        .allTextContents();
      const salon = blocs
        .map((b) => JSON.parse(b))
        .find((d) => d["@type"] === "HairSalon");
      expect(salon.dateModified).toBe(iso);
    });
  }
});
