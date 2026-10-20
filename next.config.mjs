import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

// Origine du projet Supabase du site (ex. https://abcd1234.supabase.co). Les
// connexions, images et médias sont limités à CE projet : avec le joker
// *.supabase.co, un code injecté dans une page pourrait envoyer des données
// (ex. le PIN de Mimi) vers le projet Supabase d'un attaquant. Repli sur le joker
// si l'URL n'est pas définie au build (le site continue alors de fonctionner).
const supabaseOrigin = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").origin;
  } catch {
    return "https://*.supabase.co";
  }
})();

const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      // Restreint aux sources réellement utilisées (images locales + tuiles de
      // la carte Google Maps embarquée). Plus de `https:` générique.
      `img-src 'self' data: blob: https://maps.gstatic.com https://maps.googleapis.com https://*.googleusercontent.com ${supabaseOrigin} https://cdn.jsdelivr.net`,
      `connect-src 'self' ${supabaseOrigin} https://api.resend.com`,
      // blob: nécessaire pour l'extraction du poster vidéo côté admin
      // (URL.createObjectURL sur le fichier choisi avant upload).
      `media-src 'self' blob: ${supabaseOrigin} https://cdn.jsdelivr.net`,
      "frame-src https://www.google.com https://maps.google.com",
      "frame-ancestors 'none'",
      // Pas de <object>/<embed> ; <base> et envois de formulaires limités au site
      // (un <base> ou un formulaire injecté ne peut plus détourner les liens ni
      // envoyer des données vers un autre domaine).
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        // PWA planning de Mimi : ne doit jamais être indexée (elle affiche des
        // données de réservation). L'accès aux données est déjà protégé par PIN
        // côté API ; ceci empêche l'indexation de la page HTML elle-même.
        // path-to-regexp v8 (Next 15) refuse le modificateur `*` sur un
        // paramètre sans délimiteur (`/mimi:path*`). La forme regex nommée
        // `:path(.*)` est équivalente : matche /mimi, /mimi.html, /mimi/...
        source: "/mimi:path(.*)",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
  async redirects() {
    return [
      // Vieux liens de type fichier d'accueil → racine (301). Sans ça, ces URLs
      // (qui contiennent un point, donc ignorées par le matcher du middleware)
      // servaient une copie de la home routée sur [locale] = "index.html".
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/index.htm", destination: "/", permanent: true },
      { source: "/index.php", destination: "/", permanent: true },
    ];
  },
};

export default withNextIntl(nextConfig);
