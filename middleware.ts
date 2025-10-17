import { NextRequest, NextResponse } from "next/server";
import { defaultLocale } from "./lib/i18n";

// A simple middleware that just ensures the NEXT_LOCALE cookie is set
export default function middleware(request: NextRequest) {
  // Skip middleware for non-page routes
  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".") // Files with extensions
  ) {
    return NextResponse.next();
  }

  // Get the response
  const response = NextResponse.next();
  
  // Always set the default locale cookie if it doesn't exist
  // This ensures we always have a locale cookie
  if (!request.cookies.has("NEXT_LOCALE")) {
    response.cookies.set("NEXT_LOCALE", defaultLocale, {
      path: "/",
      maxAge: 31536000, // 1 year
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }
  
  return response;
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next|api|favicon\.ico).*)',
  ],
};
