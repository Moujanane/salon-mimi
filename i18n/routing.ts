import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "en", "es"],
  defaultLocale: "fr",
  localePrefix: "always",
  // Désactive le cookie NEXT_LOCALE — la locale est dans l'URL, pas besoin du cookie.
  // Sans Set-Cookie, Next.js peut servir les pages avec cache-control public.
  localeCookie: false,
});
