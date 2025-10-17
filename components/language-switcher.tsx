"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { useEffect, useState } from 'react';
import { locales, type Locale, defaultLocale } from '@/lib/i18n';

export function LanguageSwitcher() {
  const router = useRouter();
  const [currentLocale, setCurrentLocale] = useState<Locale>(defaultLocale);

  // Get the current locale from cookie on component mount
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
    if (localeCookie && locales.includes(localeCookie as Locale)) {
      setCurrentLocale(localeCookie as Locale);
    }
  }, []);

  const handleLanguageChange = (locale: Locale) => {
    // Set the cookie
    document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000;SameSite=Lax${process.env.NODE_ENV === "production" ? ";Secure" : ""}`;
    
    // Update the current locale state
    setCurrentLocale(locale);
    
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
