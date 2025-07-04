export const supportedLocales = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
] as const;

export type SupportedLocale = typeof supportedLocales[number]['code'];

export const defaultLocale: SupportedLocale = 'en';

export const localeNames = supportedLocales.reduce((acc, locale) => {
  acc[locale.code] = locale.name;
  return acc;
}, {} as Record<SupportedLocale, string>);

export const localeFlags = supportedLocales.reduce((acc, locale) => {
  acc[locale.code] = locale.flag;
  return acc;
}, {} as Record<SupportedLocale, string>);