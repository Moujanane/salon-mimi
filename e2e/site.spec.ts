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

test.describe("Tunnel de réservation (CRO)", () => {
  test("le formulaire est visible au chargement", async ({ page }) => {
    await page.goto("/fr/reservation");
    await expect(page.locator("select[name='service']")).toBeVisible();
  });

  test("la ligne de prix change quand on change de coiffure", async ({
    page,
  }) => {
    await page.goto("/fr/reservation");
    const select = page.locator("select[name='service']");
    await expect(select).toBeVisible();
    const priceLine = page.locator(
      "text=/tarif indicatif, confirmé au salon/i",
    );
    const before = await priceLine.first().textContent();
    await select.selectOption({ index: 5 });
    const after = await priceLine.first().textContent();
    expect(after).not.toEqual(before);
  });

  test("les champs optionnels sont masqués puis dépliables", async ({
    page,
  }) => {
    await page.goto("/fr/reservation");
    await expect(page.locator("input[name='email']")).toHaveCount(0);
    await page.getByRole("button", { name: /ajouter des précisions/i }).click();
    await expect(page.locator("input[name='email']")).toBeVisible();
  });

  test("le bouton Réserver par WhatsApp exige nom et téléphone", async ({
    page,
  }) => {
    await page.goto("/fr/reservation");
    const waBtn = page.getByRole("button", {
      name: /réserver par whatsapp/i,
    });
    await expect(waBtn).toBeVisible();
    await waBtn.click();
    await expect(
      page.getByText(/indiquer au moins votre nom et votre téléphone/i),
    ).toBeVisible();
    await page.locator("input[name='name']").fill("Test Playwright");
    await page.locator("input[name='phone']").fill("+212600000000");
    await waBtn.click();
    await expect(
      page.getByText(/indiquer au moins votre nom et votre téléphone/i),
    ).toHaveCount(0);
  });

  test("le bouton Réserver par WhatsApp enregistre la réservation via l'API avant redirection", async ({
    page,
  }) => {
    await page.goto("/fr/reservation");
    const waBtn = page.getByRole("button", {
      name: /réserver par whatsapp/i,
    });
    await page.locator("input[name='name']").fill("Test Playwright API");
    await page.locator("input[name='phone']").fill("+212600000001");

    const apiRequest = page.waitForRequest(
      (req) =>
        req.url().includes("/api/reservations") && req.method() === "POST",
    );
    await waBtn.click();
    const req = await apiRequest;
    const payload = req.postDataJSON();
    expect(payload.nom).toBe("Test Playwright API");
    expect(payload.telephone).toBe("+212600000001");
    expect(payload.service).toBeTruthy();
  });

  test("le bandeau de réservation sticky est visible en mobile et pointe vers /reservation", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== "mobile",
      "Bandeau sticky mobile uniquement",
    );
    await page.goto("/fr");
    const sticky = page
      .locator("a.fixed.bottom-0")
      .filter({ hasText: /rendez-vous|reservation|réserver/i });
    await expect(sticky.first()).toBeVisible();
    const href = await sticky.first().getAttribute("href");
    expect(href).toMatch(/\/fr\/reservation$/);
  });

  test("le bandeau de réservation sticky est absent en desktop", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== "desktop",
      "Vérifie l'absence en desktop",
    );
    await page.goto("/fr");
    const sticky = page
      .locator("a.fixed.bottom-0")
      .filter({ hasText: /rendez-vous|reservation|réserver/i });
    await expect(sticky.first()).toBeHidden();
  });
});
