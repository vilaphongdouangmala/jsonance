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
