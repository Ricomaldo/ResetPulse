// src/i18n/index.js
import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';

// Import translation files
import en from '../../locales/en.json';
import fr from '../../locales/fr.json';
import es from '../../locales/es.json';
import de from '../../locales/de.json';
import it from '../../locales/it.json';
import pt from '../../locales/pt.json';
import nl from '../../locales/nl.json';
import ja from '../../locales/ja.json';
import ko from '../../locales/ko.json';
import zhHans from '../../locales/zh-Hans.json';
import zhHant from '../../locales/zh-Hant.json';
import ar from '../../locales/ar.json';
import ru from '../../locales/ru.json';
import sv from '../../locales/sv.json';
import no from '../../locales/no.json';

// Create i18n instance
const i18n = new I18n({
  en,
  fr,
  es,
  de,
  it,
  pt,
  nl,
  ja,
  ko,
  'zh-Hans': zhHans,
  'zh-Hant': zhHant,
  ar,
  ru,
  sv,
  no,
});

// Set the locale once at the beginning of your app
i18n.locale = Localization.getLocales()[0].languageCode;

// When a value is missing from a language, it'll fallback to English
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

// Helper function to get current locale
export const getCurrentLocale = () => {
  return Localization.getLocales()[0];
};

// Helper function to get available locales
export const getAvailableLocales = () => {
  return Object.keys(i18n.translations);
};

// Helper function to change locale programmatically
export const setLocale = (locale) => {
  i18n.locale = locale;
};

export default i18n;
