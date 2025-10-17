"use client";

import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations();
  
  return (
    <footer className="gap-x-1 flex flex-wrap items-center justify-center text-secondary-foreground/50 text-sm mt-8">
      <div>{t('app.copyright')}</div>
      <a
        href="https://github.com/vilaphongdouangmala"
        target="_blank"
        rel="noopener noreferrer"
      >
        Vilaphong Douangmala
      </a>
      <div>{t('app.allRightsReserved')}</div>
    </footer>
  );
}
