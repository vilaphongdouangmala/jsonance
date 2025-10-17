import { getRequestConfig } from "next-intl/server";

export const locales = ["en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

// Configuration for next-intl
export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming locale is valid
  const validatedLocale = locales.includes(locale as Locale)
    ? (locale as Locale)
    : defaultLocale;

  return {
    locale: validatedLocale,
    messages: (await import(`../messages/${validatedLocale}/index.json`)).default,
  };
});

// Since we're having issues with the cookies() API in TypeScript,
// we'll simplify by just returning the default locale
// The actual locale detection will happen in the middleware
export function getLocale(): Locale {
  return defaultLocale;
}

// This is a client-side function to set the locale cookie
// It will be called from the LanguageSwitcher component
export function setClientLocaleCookie(locale: Locale): void {
  document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000;SameSite=Lax${process.env.NODE_ENV === "production" ? ";Secure" : ""}`;
}
