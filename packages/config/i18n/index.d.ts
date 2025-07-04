export interface Locale {
  code: string;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  default?: boolean;
}

export interface LocaleInfo {
  code: string;
  name: string;
  flag: string;
}

export interface LocalesData {
  locales: Locale[];
  regions: Record<string, string[]>;
}

export declare const supportedLocales: readonly LocaleInfo[];
export type SupportedLocale = typeof supportedLocales[number]['code'];
export declare const defaultLocale: SupportedLocale;
export declare const localeNames: Record<string, string>;
export declare const localeFlags: Record<string, string>;
export declare const localesData: LocalesData;