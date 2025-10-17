import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "./providers";
import { defaultLocale } from "@/lib/i18n";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "jsonance",
  description: "jsonance",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Use default locale - the client-side will handle locale detection
  const locale = defaultLocale;

  // Load messages for the current locale
  const messages = (await import(`../messages/${locale}/index.json`)).default;

  return (
    <>
      <html lang={locale} suppressHydrationWarning>
        <head />
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Providers locale={locale} messages={messages}>
              {children}
            </Providers>
          </ThemeProvider>
        </body>
      </html>
    </>
  );
}
