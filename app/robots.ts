// app/robots.ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Cloudflare fabrique /cdn-cgi/l/email-protection (masquage des
        // e-mails, mentions légales) : lien en 404 pour les robots, signalé par
        // Search Console. Les robots IA ci-dessous ont leur propre groupe.
        disallow: "/cdn-cgi/",
      },
      // Crawlers IA autorisés — pour apparaître dans les résultats AI Search
      // (ChatGPT, Perplexity, Claude, Google AI Overviews)
      {
        userAgent: "GPTBot",
        allow: "/",
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
      },
      {
        userAgent: "Amazonbot",
        allow: "/",
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
      },
      {
        userAgent: "meta-externalagent",
        allow: "/",
      },
    ],
    sitemap: "https://mimi-coiffure.com/sitemap.xml",
  };
}
