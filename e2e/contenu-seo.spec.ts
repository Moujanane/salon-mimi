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

test.describe("H1 de l'accueil : texte extrait lisible", () => {
  // Le H1 est affiché sur deux lignes (<em> en bloc). Sans espace dans le HTML,
  // un extracteur de texte lit « RastaMarrakech » collé.
  for (const locale of ["fr", "en", "es"]) {
    test(`le H1 sépare ses deux lignes par un espace (${locale})`, async ({
      page,
    }) => {
      await page.goto(`/${locale}`);
      const h1 = page.locator("h1");
      const texte = (await h1.evaluate((el) => el.textContent)) ?? "";
      const ligne2 =
        (await h1.locator("em").evaluate((el) => el.textContent)) ?? "";
      expect(ligne2.length).toBeGreaterThan(0);
      const avant = texte.slice(0, texte.indexOf(ligne2));
      expect(avant).toMatch(/\S\s$/);
    });
  }
});

test.describe("Réponse directe dans les 150 premiers mots (critère GEO)", () => {
  // Convention de comptage : contenu principal (<main>), sans le menu de
  // navigation du header ni le footer, comme le font les extracteurs de
  // contenu. Un outil qui compterait aussi le menu verrait l'introduction
  // quelques dizaines de mots plus tard.
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

test.describe("Horaires : tous les jours 9h-23h partout", () => {
  // Horaires confirmés par Mouj le 31 oct 2026. Le balisage JSON-LD (lu par
  // Google) doit dire la même chose que le texte visible.
  test("le JSON-LD HairSalon annonce 7 jours sur 7, 09:00 à 23:00", async ({
    page,
  }) => {
    await page.goto("/fr");
    const blocs = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((els) => els.map((e) => e.textContent ?? ""));
    const salon = blocs
      .flatMap((b) => {
        const j = JSON.parse(b);
        return Array.isArray(j) ? j : (j["@graph"] ?? [j]);
      })
      .find((n) => n["@type"] === "HairSalon");
    expect(salon).toBeTruthy();
    const specs = salon.openingHoursSpecification;
    const jours = new Set(specs.flatMap((s: { dayOfWeek: string[] }) => s.dayOfWeek));
    expect(jours.size).toBe(7);
    for (const s of specs) {
      expect(s.opens).toBe("09:00");
      expect(s.closes).toBe("23:00");
    }
  });

  test("la page Contact affiche les mêmes horaires", async ({ page }) => {
    await page.goto("/fr/contact");
    await expect(page.locator("main")).toContainText(/9h\s*–\s*23h/);
  });
});

test.describe("Page Services : titres H2 (structure H1 > H2)", () => {
  for (const locale of ["fr", "en", "es"]) {
    test(`/${locale}/services a des H2 (un par prestation + vidéos)`, async ({
      page,
    }) => {
      await page.goto(`/${locale}/services`);
      await expect(page.locator("h1")).toHaveCount(1);
      expect(await page.locator("h2").count()).toBeGreaterThanOrEqual(5);
      // Aucun H2 vide
      for (const t of await page.locator("h2").allTextContents()) {
        expect(t.trim().length).toBeGreaterThan(2);
      }
    });
  }
});

test.describe("Page Services : tableau de tarifs en HTML", () => {
  // Les « à partir de » viennent de la table settings (modifiable dans l'admin).
  // Le tableau doit être dans le HTML envoyé par le serveur (pas chargé après
  // coup en JavaScript), pour que Google le lise au premier passage.
  const FAMILLES: [string, string][] = [
    ["Tresses africaines", "price_tresses_africaines"],
    ["Tresses et nattes", "price_tresses_et_nattes"],
    ["Box braids", "price_box_braids"],
    ["Tresses Fulani", "price_tresses_fulani"],
    ["Tresses Boho", "price_tresses_boho"],
    ["Locks & dreads", "price_locks_dreads"],
    ["Cheveux attachés", "price_cheveux_attaches"],
    ["Perruques et tissage", "price_perruques_tissage"],
    ["Colorations capillaires", "price_colorations"],
    ["Ongles, soins & épilation", "price_ongles_soins_epilation"],
  ];

  test("le HTML du serveur contient un tableau avec les 10 familles et leurs prix", async ({
    request,
  }) => {
    const settings = await (await request.get("/api/settings")).json();
    const html = await (await request.get("/fr/services")).text();
    const tableau = html.match(/<table[\s\S]*?<\/table>/)?.[0] ?? "";
    expect(tableau).not.toBe("");
    expect(tableau).toContain("<caption");
    expect(tableau).toContain("<th");
    for (const [nom, cle] of FAMILLES) {
      const nomHtml = nom.replace("&", "&amp;");
      const ligne = tableau
        .split("</tr>")
        .find((l) => l.includes(nomHtml));
      expect(ligne, `ligne manquante : ${nom}`).toBeTruthy();
      expect(ligne).toContain(`${settings[cle]}`);
      expect(ligne).toContain("MAD");
    }
  });

  for (const locale of ["en", "es"]) {
    test(`/${locale}/services a aussi son tableau (10 lignes de données)`, async ({
      page,
    }) => {
      await page.goto(`/${locale}/services`);
      await expect(page.locator("table tbody tr")).toHaveCount(10);
    });
  }
});

test.describe("Prix minimum annoncé : 65 MAD partout (coiffure seulement)", () => {
  // Choix de Mouj le 31 oct 2026 : « Cheveux attachés dès 65 MAD » est le prix
  // d'entrée annoncé. Meta description, JSON-LD et llms.txt doivent concorder
  // avec la ligne du tableau de tarifs.
  test("meta description Services, JSON-LD priceRange et llms.txt", async ({
    request,
    page,
  }) => {
    await page.goto("/fr/services");
    const meta = await page
      .locator('meta[name="description"]')
      .getAttribute("content");
    expect(meta).toMatch(/Dès 65 MAD/);

    await page.goto("/fr");
    const blocs = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((els) => els.map((e) => e.textContent ?? ""));
    expect(blocs.join(" ")).toContain('"priceRange":"65–950 MAD"');

    const llms = await (await request.get("/llms.txt")).text();
    expect(llms).toContain("Tarifs de 65 à 950 MAD");
  });
});
