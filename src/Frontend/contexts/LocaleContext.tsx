'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Locale, DEFAULT_LOCALE, LOCALE_COOKIE, getTranslations, TranslationDictionary } from '@/i18n';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationDictionary;
}

const LocaleContext = createContext<LocaleContextType>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: getTranslations(DEFAULT_LOCALE),
});

function getInitialLocale(): Locale {
  if (typeof document === 'undefined') return DEFAULT_LOCALE;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE}=([^;]*)`));
  const saved = match ? (match[1] as Locale) : null;
  if (saved === 'vi' || saved === 'en') return saved;
  return DEFAULT_LOCALE;
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [t, setT] = useState<TranslationDictionary>(getTranslations(DEFAULT_LOCALE));

  // Read from cookie on mount
  useEffect(() => {
    const initial = getInitialLocale();
    setLocaleState(initial);
    setT(getTranslations(initial));
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    setT(getTranslations(newLocale));
    // Write cookie (1 year expiry, accessible across all paths)
    document.cookie = `${LOCALE_COOKIE}=${newLocale};path=/;max-age=31536000;SameSite=Lax`;
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
