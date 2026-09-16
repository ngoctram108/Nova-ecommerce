'use client';

import React from 'react';
import { useLocale } from '@/Frontend/contexts/LocaleContext';
import styles from './LanguageSwitcher.module.css';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <div className={styles.switcher} role="radiogroup" aria-label="Language">
      <button
        className={`${styles.option} ${locale === 'vi' ? styles.active : ''}`}
        onClick={() => setLocale('vi')}
        role="radio"
        aria-checked={locale === 'vi'}
        aria-label="Tiếng Việt"
      >
        VI
      </button>
      <span className={styles.divider}>|</span>
      <button
        className={`${styles.option} ${locale === 'en' ? styles.active : ''}`}
        onClick={() => setLocale('en')}
        role="radio"
        aria-checked={locale === 'en'}
        aria-label="English"
      >
        EN
      </button>
    </div>
  );
}
