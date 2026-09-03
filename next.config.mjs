import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

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
      "img-src 'self' data: blob: https://maps.gstatic.com https://maps.googleapis.com https://*.googleusercontent.com https://cdn.jsdelivr.net",
      "connect-src 'self' https://*.supabase.co https://api.resend.com",
      "media-src 'self' https://cdn.jsdelivr.net",
      "frame-src https://www.google.com https://maps.google.com",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
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
        source: "/mimi:path*",
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
