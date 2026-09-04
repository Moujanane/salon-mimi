import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);
const BASE_URL = "https://mimi-coiffure.com";

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") ?? "";

  // Redirection www -> non-www en 301 permanent
  if (host.startsWith("www.")) {
    const nonWwwHost = host.replace(/^www\./, "").replace(/:\d+$/, "");
    const { pathname: p, search } = request.nextUrl;
    return NextResponse.redirect(`https://${nonWwwHost}${p}${search}`, 301);
  }

  if (pathname.startsWith("/mimi")) {
    return;
  }

  // Exclure /admin du middleware i18n — next-intl ne doit pas préfixer ces routes
  if (pathname.startsWith("/admin")) {
    // Protection : rediriger vers /admin/login si aucun cookie de session Supabase
    if (!pathname.startsWith("/admin/login")) {
      const hasSession = request.cookies
        .getAll()
        .some(
          (c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token"),
        );
      if (!hasSession) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    }
    return NextResponse.next();
  }

  const response = intlMiddleware(request);

  // Convertir les redirections i18n en 308 (permanent) pour le SEO
  if (response && response.status === 307) {
    const location = response.headers.get("location");
    if (location) {
      return NextResponse.redirect(new URL(location, request.url), 308);
    }
  }

  if (response) {
    // next-intl génère un header Link hreflang x-default incohérent avec le
    // <link> HTML de chaque page (cf. generateMetadata dans app/[locale]/**),
    // qui pointe toujours vers `${BASE_URL}/fr${cheminSansLocale}` (sans
    // slash final). Le format généré par next-intl diffère selon la page :
    //  - page racine ("/fr", "/en", "/es") : `<https://host/>` (avec slash)
    //  - page imbriquée ("/en/services", "/fr/reservation", ...) :
    //    `<https://host/services>` — SANS préfixe de locale et sans slash
    //    final.
    // On reconstruit le chemin cible à partir du pathname de la requête
    // actuelle (segment après la locale) plutôt que de hardcoder l'apex.
    const linkHeader = response.headers.get("link");
    if (linkHeader && linkHeader.includes('hreflang="x-default"')) {
      const localeMatch = pathname.match(
        new RegExp(`^/(${routing.locales.join("|")})(/.*)?$`),
      );
      const afterLocale = localeMatch?.[2] ?? "";
      const target = `${BASE_URL}/${routing.defaultLocale}${afterLocale}`;

      const fixedLink = linkHeader.replace(
        /<https?:\/\/[^>]*?\/?>;\s*rel="alternate";\s*hreflang="x-default"/,
        `<${target}>; rel="alternate"; hreflang="x-default"`,
      );
      response.headers.set("Link", fixedLink);
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|mimi|_next|_vercel|.*\\..*).*)"],
};
