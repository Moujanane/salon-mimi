// app/sitemap.ts
import { MetadataRoute } from "next";

export const revalidate = 86400;

const BASE_URL = "https://mimi-coiffure.com";
const locales = ["fr", "en", "es"];
const pages = [
  "",
  "/services",
  "/galerie",
  "/reservation",
  "/a-propos",
  "/contact",
  "/mentions-legales",
  "/politique-de-confidentialite",
];

export default function sitemap(): MetadataRoute.Sitemap {
  // Pas de slash final : le serveur Next.js (trailingSlash: false par défaut)
  // redirige toute URL en /.../ vers sa version sans slash en 308. Le sitemap,
  // les canonical et les hreflang doivent donc tous pointer vers les URLs
  // SANS slash final, sinon Google les classe en « Page avec redirection ».
  const localePages = locales.flatMap((locale) =>
    pages.map((page) => ({
      url: `${BASE_URL}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: page === "" ? 1.0 : 0.8,
    })),
  );

  // L'apex "/" redirige vers "/fr" en 308 → on ne le met pas dans le sitemap.
  // La home canonique est /fr (déjà incluse via localePages avec page === "").
  return [...localePages];
}
