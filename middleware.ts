import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, locales } from "./lib/i18n";
import createMiddleware from "next-intl/middleware";

// Create the middleware with next-intl
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "never",
});

// Export the middleware function
export default function middleware(request: NextRequest) {
  // Check if the NEXT_LOCALE cookie exists and is valid
  const localeCookie = request.cookies.get("NEXT_LOCALE");
  const locale = localeCookie?.value;

  // If the locale cookie is missing or invalid, set it to the default locale
  if (!locale || !locales.includes(locale as (typeof locales)[number])) {
    // Create a response that sets the cookie
    const response = NextResponse.next();
    response.cookies.set("NEXT_LOCALE", defaultLocale, {
      path: "/",
      maxAge: 31536000, // 1 year in seconds
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return response;
  }

  // Use the next-intl middleware for locale handling
  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for those starting with /api/, /_next/, /_vercel/,
  // /favicon.ico, /robots.txt, etc.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
