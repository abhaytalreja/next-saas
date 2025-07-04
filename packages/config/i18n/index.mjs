// Hardcode the locale data to avoid filesystem issues
const localesData = {
  "locales": [
    {
      "code": "en",
      "name": "English",
      "nativeName": "English",
      "direction": "ltr",
      "default": true
    },
    {
      "code": "es",
      "name": "Spanish",
      "nativeName": "Español",
      "direction": "ltr"
    },
    {
      "code": "fr",
      "name": "French",
      "nativeName": "Français",
      "direction": "ltr"
    },
    {
      "code": "de",
      "name": "German",
      "nativeName": "Deutsch",
      "direction": "ltr"
    },
    {
      "code": "it",
      "name": "Italian",
      "nativeName": "Italiano",
      "direction": "ltr"
    },
    {
      "code": "pt",
      "name": "Portuguese",
      "nativeName": "Português",
      "direction": "ltr"
    },
    {
      "code": "ja",
      "name": "Japanese",
      "nativeName": "日本語",
      "direction": "ltr"
    },
    {
      "code": "ko",
      "name": "Korean",
      "nativeName": "한국어",
      "direction": "ltr"
    },
    {
      "code": "zh",
      "name": "Chinese",
      "nativeName": "中文",
      "direction": "ltr"
    },
    {
      "code": "ar",
      "name": "Arabic",
      "nativeName": "العربية",
      "direction": "rtl"
    },
    {
      "code": "he",
      "name": "Hebrew",
      "nativeName": "עברית",
      "direction": "rtl"
    },
    {
      "code": "ru",
      "name": "Russian",
      "nativeName": "Русский",
      "direction": "ltr"
    },
    {
      "code": "nl",
      "name": "Dutch",
      "nativeName": "Nederlands",
      "direction": "ltr"
    },
    {
      "code": "sv",
      "name": "Swedish",
      "nativeName": "Svenska",
      "direction": "ltr"
    },
    {
      "code": "no",
      "name": "Norwegian",
      "nativeName": "Norsk",
      "direction": "ltr"
    }
  ],
  "regions": {
    "en": ["US", "GB", "CA", "AU", "NZ"],
    "es": ["ES", "MX", "AR", "CO", "CL"],
    "fr": ["FR", "CA", "BE", "CH"],
    "de": ["DE", "AT", "CH"],
    "pt": ["PT", "BR"],
    "zh": ["CN", "TW", "HK", "SG"],
    "ar": ["SA", "AE", "EG", "MA"]
  }
};

// Extract supported locales
export const supportedLocales = localesData.locales.map(locale => locale.code);

// Create locale names mapping
export const localeNames = {};
localesData.locales.forEach(locale => {
  localeNames[locale.code] = locale.nativeName;
});

// Create locale flags mapping (using emoji flags)
export const localeFlags = {
  'en': '🇺🇸',
  'es': '🇪🇸',
  'fr': '🇫🇷',
  'de': '🇩🇪',
  'it': '🇮🇹',
  'pt': '🇵🇹',
  'ja': '🇯🇵',
  'ko': '🇰🇷',
  'zh': '🇨🇳',
  'ar': '🇸🇦',
  'he': '🇮🇱',
  'ru': '🇷🇺',
  'nl': '🇳🇱',
  'sv': '🇸🇪',
  'no': '🇳🇴',
};

export { localesData };