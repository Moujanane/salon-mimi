import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

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

  return response;
}

export const config = {
  matcher: ["/((?!api|mimi|_next|_vercel|.*\\..*).*)"],
};
