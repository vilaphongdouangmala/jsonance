"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { useLocale } from 'next-intl';
import { locales, type Locale, setClientLocaleCookie } from '@/lib/i18n';

export function LanguageSwitcher() {
  const router = useRouter();
  const currentLocale = useLocale() as Locale;

  const handleLanguageChange = (locale: Locale) => {
    // Set the cookie using our helper function
    setClientLocaleCookie(locale);
    
    // Refresh the page to apply the new locale
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="size-4" />
      <div className="flex gap-1">
        {locales.map((locale) => (
          <Button
            key={locale}
            variant={locale === currentLocale ? "default" : "outline"}
            size="sm"
            onClick={() => handleLanguageChange(locale)}
            className="px-2 py-1 h-7 text-xs"
          >
            {locale.toUpperCase()}
          </Button>
        ))}
      </div>
    </div>
  );
}
