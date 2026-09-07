import { test, expect } from "@playwright/test";

// Contrats de sécurité seulement : sans session admin, la page redirige et les
// API routes renvoient 401. Le parcours authentifié complet (upload, drag,
// delete) n'est pas automatisable sans login admin dans l'infra Playwright
// (même limite que e2e/api-reservations-id.spec.ts) — couvert par la checklist
// de test manuel du plan.

test.describe("Admin galerie — sécurité", () => {
  test("/admin/galerie sans session ne montre pas la grille", async ({
    page,
  }) => {
    await page.goto("/admin/galerie");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("POST /api/gallery sans session -> 401", async ({ request }) => {
    const res = await request.post("/api/gallery");
    expect(res.status()).toBe(401);
  });

  test("GET /api/gallery sans session -> 401", async ({ request }) => {
    const res = await request.get("/api/gallery");
    expect(res.status()).toBe(401);
  });

  test("DELETE /api/gallery/[id] sans session -> 401", async ({ request }) => {
    const res = await request.delete(
      "/api/gallery/00000000-0000-0000-0000-000000000000",
    );
    expect(res.status()).toBe(401);
  });

  test("PATCH /api/gallery/[id] sans session -> 401", async ({ request }) => {
    const res = await request.patch(
      "/api/gallery/00000000-0000-0000-0000-000000000000",
      { data: { alt: "Nouvelle description assez longue" } },
    );
    expect(res.status()).toBe(401);
  });

  test("PATCH /api/gallery/order sans session -> 401", async ({ request }) => {
    const res = await request.patch("/api/gallery/order", {
      data: { order: [] },
    });
    expect(res.status()).toBe(401);
  });
});
