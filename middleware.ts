import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/mimi")) {
    return;
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
  matcher: ["/((?!api|admin|mimi|_next|_vercel|.*\\..*).*)"],
};
