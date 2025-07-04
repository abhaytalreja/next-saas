'use client';

import { useState } from 'react';
import { Button } from './button';
import { supportedLocales, localeNames, localeFlags } from '@nextsaas/config/i18n';

export interface LanguageSelectorProps {
  className?: string;
  currentLocale?: string;
  onLocaleChange?: (locale: string) => void;
}

export function LanguageSelector({ 
  className, 
  currentLocale = 'en',
  onLocaleChange 
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleLocaleChange = (locale: string) => {
    if (onLocaleChange) {
      onLocaleChange(locale);
    } else {
      // Fallback to simple page reload with locale
      window.location.href = `/${locale}${window.location.pathname}`;
    }
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <span>{localeFlags[currentLocale as keyof typeof localeFlags]}</span>
        <span className="hidden sm:inline">{localeNames[currentLocale as keyof typeof localeNames]}</span>
        <svg 
          className="w-4 h-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1" role="menu">
            {supportedLocales.map((locale) => (
              <button
                key={locale.code}
                onClick={() => handleLocaleChange(locale.code)}
                className={`flex items-center gap-3 w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                  currentLocale === locale.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                }`}
                role="menuitem"
              >
                <span className="text-lg">{locale.flag}</span>
                <span>{locale.name}</span>
                {currentLocale === locale.code && (
                  <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}