"use client";

import { NextIntlClientProvider } from "next-intl";
import { ReactNode } from "react";

type ProvidersProps = {
  locale: string;
  messages: Record<string, unknown>;
  children: ReactNode;
};

export function Providers({ locale, messages, children }: ProvidersProps) {
  const timeZone = "Asia/Bangkok";
  return (
    <NextIntlClientProvider
      timeZone={timeZone}
      locale={locale}
      messages={messages}
    >
      {children}
    </NextIntlClientProvider>
  );
}
