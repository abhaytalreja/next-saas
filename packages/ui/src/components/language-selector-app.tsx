'use client';

import { useState, useEffect } from 'react';
import { Button } from './button';
import { supportedLocales, localeNames, localeFlags } from '@nextsaas/config/i18n';

export interface LanguageSelectorAppProps {
  className?: string;
  showLabel?: boolean;
}

export function LanguageSelectorApp({ className, showLabel = false }: LanguageSelectorAppProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLocale, setCurrentLocale] = useState('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Get current locale from localStorage or browser
    const savedLocale = localStorage.getItem('nextsaas-locale');
    if (savedLocale && supportedLocales.some(locale => locale.code === savedLocale)) {
      setCurrentLocale(savedLocale);
    } else {
      // Try to detect from browser language
      const browserLang = navigator.language.split('-')[0];
      const supportedLang = supportedLocales.find(locale => locale.code === browserLang);
      setCurrentLocale(supportedLang?.code || 'en');
    }
  }, []);

  const handleLocaleChange = (locale: string) => {
    setCurrentLocale(locale);
    localStorage.setItem('nextsaas-locale', locale);
    setIsOpen(false);
    
    // For now, just save the preference. In a full implementation,
    // this would trigger a locale change throughout the app
    console.log(`Language changed to: ${locale}`);
    
    // Optional: Show a toast notification
    // toast.success(`Language changed to ${localeNames[locale]}`);
  };

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.language-selector')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  if (!mounted) {
    // Return a placeholder during SSR
    return (
      <div className={`relative language-selector ${className}`}>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
          aria-label="Select language"
        >
          <span className="text-lg">🌐</span>
          {showLabel && (
            <span className="hidden sm:inline">Language</span>
          )}
          <svg 
            className="w-4 h-4"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </Button>
      </div>
    );
  }

  return (
    <div className={`relative language-selector ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
        aria-label="Select language"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="text-lg">{localeFlags[currentLocale as keyof typeof localeFlags]}</span>
        {showLabel && (
          <span className="hidden sm:inline">{localeNames[currentLocale as keyof typeof localeNames]}</span>
        )}
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Button>

      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div className="fixed inset-0 z-10 md:hidden" onClick={() => setIsOpen(false)} />
          
          {/* Dropdown menu */}
          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 dark:ring-gray-700 z-50">
            <div className="py-1" role="menu" aria-orientation="vertical">
              {supportedLocales.map((locale) => (
                <button
                  key={locale.code}
                  onClick={() => handleLocaleChange(locale.code)}
                  className={`flex items-center gap-3 w-full text-left px-4 py-2 text-sm transition-colors ${
                    currentLocale === locale.code 
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-300' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  role="menuitem"
                >
                  <span className="text-lg">{locale.flag}</span>
                  <span className="flex-1">{locale.name}</span>
                  {currentLocale === locale.code && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}