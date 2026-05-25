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
  const localePages = locales.flatMap((locale) =>
    pages.map((page) => ({
      url: `${BASE_URL}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: page === "" ? 1.0 : 0.8,
    })),
  );

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 1.0,
    },
    ...localePages,
  ];
}
