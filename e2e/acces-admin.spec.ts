import { test, expect } from "@playwright/test";

// Accès à l'administration sans session : aucune information ne doit fuiter et
// toutes les pages doivent renvoyer vers la connexion (jamais d'erreur serveur).
// La page /admin/acces-refuse n'explique un refus qu'à un compte CONNECTÉ mais
// non autorisé ; sans session elle redirige comme les autres.

const PAGES_ADMIN = [
  "/admin/dashboard",
  "/admin/settings",
  "/admin/galerie",
  "/admin/acces-refuse",
];

test.describe("Administration sans session", () => {
  for (const path of PAGES_ADMIN) {
    test(`${path} redirige vers la connexion`, async ({ request }) => {
      const res = await request.get(path, { maxRedirects: 0 });
      expect(res.status()).toBe(307);
      expect(res.headers()["location"]).toContain("/admin/login");
    });
  }

  test("/admin/acces-refuse avec un faux cookie de session ne révèle rien", async ({
    request,
  }) => {
    const res = await request.get("/admin/acces-refuse", {
      maxRedirects: 0,
      headers: { Cookie: "sb-audit-auth-token=faux" },
    });
    // Le cookie est invalide : le serveur le vérifie auprès de Supabase et refuse.
    expect(res.status()).toBe(307);
    expect(res.headers()["location"]).toContain("/admin/login");
    const corps = await res.text();
    expect(corps).not.toContain("ADMIN_EMAILS");
  });

  test("la page de connexion reste accessible", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(
      page.getByRole("heading", { name: /connexion admin/i }),
    ).toBeVisible();
  });
});
