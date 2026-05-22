// app/sitemap.ts
import { MetadataRoute } from "next";

const BASE_URL = "https://mimi-coiffure.com";
const locales = ["fr", "en", "es"];
const pages = [
  "",
  "/services",
  "/galerie",
  "/reservation",
  "/a-propos",
  "/contact",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.flatMap((locale) =>
    pages.map((page) => ({
      url: `${BASE_URL}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: page === "" ? 1.0 : 0.8,
    })),
  );
}
