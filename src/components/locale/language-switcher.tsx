"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Languages, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { locales, localeNames, localeFlags, type Locale } from "@/i18n/config";

export function LanguageSwitcher() {
  const t = useTranslations();
  const [currentLocale, setCurrentLocale] = useState<Locale>("en");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get current locale from cookie
    const locale = document.cookie
      .split('; ')
      .find(row => row.startsWith('NEXT_LOCALE='))
      ?.split('=')[1] as Locale;
    setCurrentLocale(locale || 'en');
  }, []);

  const switchLocale = async (locale: Locale) => {
    if (locale === currentLocale) {
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      await fetch('/api/locale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale }),
      });

      setCurrentLocale(locale);
      setIsOpen(false);

      // Reload page to apply new locale
      window.location.reload();
    } catch (error) {
      console.error('Failed to switch locale:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors"
        disabled={loading}
      >
        <Languages className="w-4 h-4" />
        <span className="text-sm font-medium hidden sm:inline">
          {localeFlags[currentLocale]} {localeNames[currentLocale]}
        </span>
        <span className="text-sm font-medium sm:hidden">
          {localeFlags[currentLocale]}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 glass-strong rounded-xl py-2 shadow-xl z-50 animate-slideUp">
            {locales.map((locale) => (
              <button
                key={locale}
                onClick={() => switchLocale(locale)}
                className={cn(
                  "flex items-center justify-between w-full px-4 py-2 text-sm hover:bg-muted/50 transition-colors",
                  currentLocale === locale && "bg-primary/10 text-primary"
                )}
                disabled={loading}
              >
                <span className="flex items-center gap-2">
                  <span>{localeFlags[locale]}</span>
                  <span>{localeNames[locale]}</span>
                </span>
                {currentLocale === locale && (
                  <Check className="w-4 h-4" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
