"use client";

import { NextIntlClientProvider } from "next-intl";
import { ReactNode, useEffect, useState } from "react";
import { defaultLocale, locales, type Locale } from "@/lib/i18n";

type ProvidersProps = {
  locale: string;
  messages: Record<string, unknown>;
  children: ReactNode;
};

export function Providers({ locale: initialLocale, messages: initialMessages, children }: ProvidersProps) {
  const timeZone = "Asia/Bangkok";
  const [clientLocale, setClientLocale] = useState<string>(initialLocale);
  const [clientMessages, setClientMessages] = useState<Record<string, unknown>>(initialMessages);
  
  // Check for locale in cookie on client side
  useEffect(() => {
    const getCookieValue = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        const cookieValue = parts.pop()?.split(';').shift();
        return cookieValue;
      }
      return null;
    };

    const localeCookie = getCookieValue('NEXT_LOCALE');
    if (localeCookie && locales.includes(localeCookie as Locale) && localeCookie !== clientLocale) {
      // Load messages for the locale from cookie
      import(`../messages/${localeCookie}/index.json`)
        .then((moduleMessages) => {
          setClientLocale(localeCookie);
          setClientMessages(moduleMessages.default);
        })
        .catch(() => {
          console.error(`Failed to load messages for locale: ${localeCookie}`);
        });
    }
  }, [clientLocale]);

  return (
    <NextIntlClientProvider
      timeZone={timeZone}
      locale={clientLocale}
      messages={clientMessages}
    >
      {children}
    </NextIntlClientProvider>
  );
}
