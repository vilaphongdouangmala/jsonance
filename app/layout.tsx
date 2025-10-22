import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./prism.css";
import { ThemeProvider } from "@/components/theme-provider";
import { NextIntlClientProvider } from "next-intl";

type Props = {
  children: React.ReactNode;
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "jsonance",
    template: "%s | jsonance",
  },
  description: "Free online JSON formatter, viewer, validator, and beautifier.",
  authors: [{ name: "Vilaphong Douangmala" }],
  creator: "Vilaphong Douangmala",
  publisher: "Vilaphong Douangmala",
  metadataBase: new URL("https://jsonance.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "jsonance",
    description:
      "Free online JSON formatter, viewer, validator, and beautifier.",
    url: "https://jsonance.vercel.app",
    siteName: "jsonance",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "jsonance",
    description:
      "Free online JSON formatter, viewer, validator, and beautifier.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({ children }: Props) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider>{children}</NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
