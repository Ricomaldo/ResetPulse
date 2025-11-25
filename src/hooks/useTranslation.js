// src/hooks/useTranslation.js
import { useCallback } from 'react';
import i18n from '../i18n';

/**
 * Custom hook for translations
 * Usage: const t = useTranslation();
 * Then: t('settings.title') or t('welcome.title')
 */
export function useTranslation() {
  const t = useCallback((key, options = {}) => {
    return i18n.t(key, options);
  }, []);

  return t;
}

export default useTranslation;
