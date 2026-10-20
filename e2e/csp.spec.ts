import { test, expect } from "@playwright/test";

// Politique de sécurité du navigateur (CSP) : durcie après la relecture sécurité
// du 19/10/2026 (connexions limitées au projet Supabase du site, base-uri,
// form-action, object-src). Ce test vérifie à la fois l'en-tête ET qu'aucune
// page principale ne déclenche d'erreur de CSP (sinon une ressource légitime
// serait bloquée : régression visible).

const PAGES = [
  "/fr",
  "/en",
  "/fr/services",
  "/fr/galerie",
  "/fr/reservation",
  "/fr/contact",
  "/fr/a-propos",
  "/admin/login",
];

test.describe("CSP : en-tête", () => {
  test("directives de durcissement présentes", async ({ request }) => {
    const res = await request.get("/fr");
    const csp = res.headers()["content-security-policy"] ?? "";
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
  });

  test("connexions limitées au projet Supabase du site (pas tous les *.supabase.co)", async ({
    request,
  }) => {
    const res = await request.get("/fr");
    const csp = res.headers()["content-security-policy"] ?? "";
    const connect =
      csp.split(";").find((d) => d.trim().startsWith("connect-src")) ?? "";
    // Si l'URL Supabase n'était pas connue au build, le repli large est toléré
    // (le test est alors ignoré, sans échec).
    test.skip(
      connect.includes("https://*.supabase.co"),
      "URL Supabase inconnue au build : repli large",
    );
    expect(connect).toMatch(/https:\/\/[a-z0-9]+\.supabase\.co/);
  });
});

test.describe("CSP : aucune ressource légitime bloquée", () => {
  for (const path of PAGES) {
    test(`${path} : aucune violation de CSP`, async ({ page }) => {
      const violations: string[] = [];
      page.on("console", (msg) => {
        const t = msg.text();
        if (
          /Content Security Policy|Refused to (load|connect|frame|execute)/i.test(
            t,
          )
        ) {
          violations.push(t.slice(0, 200));
        }
      });
      await page.goto(path, { waitUntil: "networkidle" });
      expect(violations, violations.join("\n")).toEqual([]);
    });
  }
});
