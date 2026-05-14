import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import en from '@/locales/en.json';
import ur from '@/locales/ur.json';

// Languages — keep this list in sync with the JSON files under src/locales.
export const SUPPORTED_LANGUAGES = ['en', 'ur'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const RTL_LANGUAGES: ReadonlySet<SupportedLanguage> = new Set(['ur']);

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ur: { translation: ur },
    },
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
    interpolation: { escapeValue: false }, // React already escapes
    react: { useSuspense: false },
  });

// Keep `dir` attribute in sync with current language so CSS can use `[dir="rtl"]`
i18n.on('languageChanged', (lng) => {
  const dir = RTL_LANGUAGES.has(lng as SupportedLanguage) ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('dir', dir);
  document.documentElement.setAttribute('lang', lng);
});

export default i18n;
