import { test, expect } from "@playwright/test";

// Contrat de la route app/api/reservations/[id]/route.ts sous Next 15.
// On ne teste PAS la logique métier (Supabase pur, non affecté par Next 15) :
// il n'existe pas d'infra de login admin dans Playwright. On vérifie que la
// route ne crash pas au runtime Next 15 (params async, cookies() async) et que
// le garde d'authentification répond bien 401 sans session.

const FAKE_ID = "00000000-0000-0000-0000-000000000000";

test.describe("API /api/reservations/[id] — contrat (Next 15)", () => {
  test("PATCH sans cookie de session → 401", async ({ request }) => {
    const res = await request.patch(`/api/reservations/${FAKE_ID}`, {
      data: { statut: "confirmee" },
    });
    expect(res.status()).toBe(401);
  });

  test("PATCH sans cookie, body invalide → 401 (auth avant validation)", async ({
    request,
  }) => {
    const res = await request.patch(`/api/reservations/${FAKE_ID}`, {
      data: { statut: "valeur_invalide" },
    });
    expect(res.status()).toBe(401);
  });

  test("DELETE sans cookie de session → 401", async ({ request }) => {
    const res = await request.delete(`/api/reservations/${FAKE_ID}`);
    expect(res.status()).toBe(401);
  });
});
