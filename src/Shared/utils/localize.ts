// ─────────────────────────────────────────────
// NORA — Product Localization Utilities
// Single source of truth for resolving localized
// product name/description across the entire app.
// ─────────────────────────────────────────────

import type { Locale } from '@/i18n';

/** Minimal product shape needed for localization */
export interface LocalizableProduct {
  name?: string;
  description?: string;
  nameVi?: string;
  nameEn?: string;
  descriptionVi?: string;
  descriptionEn?: string;
}

/**
 * Get the localized product name.
 * Fallback chain:
 *   EN → nameEn || nameVi || name
 *   VI → nameVi || nameEn || name
 */
export function getLocalizedName(
  product: LocalizableProduct,
  locale: Locale
): string {
  if (locale === 'en') {
    return product.nameEn || product.nameVi || product.name || '';
  }
  return product.nameVi || product.nameEn || product.name || '';
}

/**
 * Get the localized product description.
 * Fallback chain:
 *   EN → descriptionEn || descriptionVi || description
 *   VI → descriptionVi || descriptionEn || description
 */
export function getLocalizedDescription(
  product: LocalizableProduct,
  locale: Locale
): string {
  if (locale === 'en') {
    return product.descriptionEn || product.descriptionVi || product.description || '';
  }
  return product.descriptionVi || product.descriptionEn || product.description || '';
}

/**
 * Check if a product has a translation for the given locale.
 * Used by Admin to show "Missing EN" indicators.
 */
export function hasTranslation(
  product: LocalizableProduct,
  locale: Locale
): boolean {
  if (locale === 'en') {
    return !!(product.nameEn && product.nameEn.trim());
  }
  return !!(product.nameVi && product.nameVi.trim());
}
