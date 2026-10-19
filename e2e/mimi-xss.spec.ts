import { test, expect } from "@playwright/test";

// La page de Mimi (/mimi.html) affiche des réservations saisies par des
// visiteurs. Un champ non protégé permettrait d'exécuter du code dans sa page
// (vol du PIN, lecture des clients). Ce test simule l'API avec des données
// piégées (AUCUN appel réel, rien n'est écrit en base) et vérifie qu'aucun
// code ne s'exécute et que tout s'affiche comme du texte.

const piege = (n: number) => `<img src=x onerror="window.__xss=${n}">`;

const RESERVATIONS = [
  {
    id: "1');window.__xss=1;//",
    nom: piege(2),
    telephone: "+212 600 000 000",
    service: "<b>Box braids</b>",
    message: `<svg onload="window.__xss=3">`,
    heure_souhaitee: piege(4),
    nombre_personnes: piege(5),
    date_souhaitee: "2026-11-02",
    statut: "en_attente",
  },
  {
    id: "abc-123",
    nom: "Awa",
    telephone: "+212 600 000 001",
    service: "Locks & dreads",
    date_souhaitee: "2026-11-03",
    statut: `x"><img src=x onerror="window.__xss=6">`,
  },
  {
    // Noms hérités d'Object : ne doivent pas passer pour des statuts valides
    id: "def-456",
    nom: "Bea",
    telephone: "+212 600 000 002",
    service: "Cornrows",
    date_souhaitee: "2026-11-04",
    statut: "constructor",
  },
];

test.describe("Page de Mimi : données piégées affichées comme du texte", () => {
  test("aucun code injecté ne s'exécute (affichage et boutons de statut)", async ({
    page,
  }) => {
    await page.route("**/api/mimi", (route) =>
      route.fulfill({ json: { reservations: RESERVATIONS } }),
    );
    await page.route("**/api/mimi-settings", (route) =>
      route.fulfill({ json: {} }),
    );
    await page.route("**/api/push**", (route) => route.fulfill({ json: {} }));
    let patchAppele = false;
    await page.route("**/api/reservations/**", (route) => {
      patchAppele = true;
      return route.fulfill({ json: { success: true } });
    });

    await page.goto("/mimi.html");
    await page.locator("#pin-input").fill("123456");
    await page.locator("#pin-btn").click();
    await expect(page.locator("#dashboard")).toBeVisible();

    // Afficher toutes les réservations (le filtre par défaut est « aujourd'hui »)
    await page.evaluate(() => {
      // @ts-expect-error variables globales de la page
      currentFiltre = "tout";
      // @ts-expect-error fonction globale de la page
      renderReservations();
    });
    const cartes = page.locator("#content .card-resa");
    await expect(cartes).toHaveCount(3);

    // Laisse le temps à d'éventuels onerror/onload de se déclencher
    await page.waitForTimeout(700);
    expect(await page.evaluate(() => (window as any).__xss)).toBeUndefined();
    await expect(page.locator("#content img[src='x']")).toHaveCount(0);
    await expect(page.locator("#content svg[onload]")).toHaveCount(0);

    // Les textes piégés sont visibles tels quels (échappés)
    const texte = await page.locator("#content").innerText();
    expect(texte).toContain('<img src=x onerror="window.__xss=2">');
    expect(texte).toContain('<img src=x onerror="window.__xss=4">');
    expect(texte).toContain('<img src=x onerror="window.__xss=5">');

    // Statut hérité d'Object ("constructor") : affiché comme « En attente »
    const badge = page.locator("#card-def-456 .badge");
    await expect(badge).toHaveText("En attente");
    await expect(badge).toHaveClass(/en_attente/);

    // Cliquer un bouton de statut ne doit pas exécuter l'id piégé
    await page.locator(".statut-btn:not([disabled])").first().click();
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => (window as any).__xss)).toBeUndefined();
    expect(patchAppele).toBe(true);
  });
});
