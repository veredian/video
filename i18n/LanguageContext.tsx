import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import en from './locales/en.json';
import rw from './locales/rw.json';

export type Language = 'en' | 'rw';
type Translations = typeof en;

const translations: Record<Language, Translations> = {
  en,
  rw,
};

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, options?: { [key: string]: string | number }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const savedLang = localStorage.getItem('NVNELtdLanguage');
      return (savedLang === 'en' || savedLang === 'rw') ? savedLang : 'en';
    } catch {
      return 'en';
    }
  });
  
  const setLanguage = (lang: Language) => {
    if (lang === 'en' || lang === 'rw') {
        setLanguageState(lang);
        try {
          localStorage.setItem('NVNELtdLanguage', lang);
        } catch (e) {
          console.error("Could not save language to localStorage", e);
        }
    }
  };

  const t = useCallback((key: string, options?: { [key: string]: string | number }) => {
    const keys = key.split('.');
    
    const findTranslation = (lang: Language, keysToFind: string[]): string | undefined => {
        let result: any = translations[lang];
        for (const k of keysToFind) {
            result = result?.[k];
            if (result === undefined) return undefined;
        }
        return result;
    }

    let translation = findTranslation(language, keys);

    if (translation === undefined) {
      translation = findTranslation('en', keys);
    }

    if (translation === undefined) {
        return key;
    }
    
    if (typeof translation === 'string' && options) {
      return Object.entries(options).reduce((str, [optKey, value]) => {
        return str.replace(`{${optKey}}`, String(value));
      }, translation);
    }

    return translation;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
