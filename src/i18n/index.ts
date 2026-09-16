// ─────────────────────────────────────────────
// NORA — i18n Configuration
// ─────────────────────────────────────────────

import vi from './vi';
import type { TranslationDictionary } from './vi';
import en from './en';

export type Locale = 'vi' | 'en';
export type { TranslationDictionary };

export const DEFAULT_LOCALE: Locale = 'vi';
export const LOCALE_COOKIE = 'nora-locale';

const dictionaries: Record<Locale, TranslationDictionary> = { vi, en };

export function getTranslations(locale: Locale): TranslationDictionary {
  return dictionaries[locale] || dictionaries[DEFAULT_LOCALE];
}
