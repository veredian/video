import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';

export type Language = 'en' | 'rw';

// Define a generic type for translations, as we can't import the JSON directly anymore.
type TranslationValue = string | { [key: string]: TranslationValue };
type Translations = Record<string, TranslationValue>;


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

  const [translations, setTranslations] = useState<Translations | null>(null);

  useEffect(() => {
    const loadTranslations = async (lang: Language) => {
      try {
        const response = await fetch(`/i18n/locales/${lang}.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTranslations(data);
      } catch (error) {
        console.error(`Failed to load translations for ${lang}:`, error);
        // Attempt to fall back to English if the current language failed and isn't English
        if (lang !== 'en') {
          console.warn('Falling back to English translations.');
          try {
            const fallbackResponse = await fetch('/i18n/locales/en.json');
            if (!fallbackResponse.ok) {
                throw new Error(`HTTP error! status: ${fallbackResponse.status}`);
            }
            const fallbackData = await fallbackResponse.json();
            setTranslations(fallbackData);
          } catch (fallbackError) {
             console.error('Failed to load fallback English translations:', fallbackError);
             // If even English fails, set an empty object to avoid crashes.
             setTranslations({});
          }
        } else {
             setTranslations({});
        }
      }
    };

    loadTranslations(language);
  }, [language]);
  
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
    if (!translations) {
      return key; // Return key as a fallback during loading
    }
    const keys = key.split('.');
    
    let result: any = translations;
    for (const k of keys) {
        result = result?.[k];
        if (result === undefined) {
            // Return the key if translation is not found
            return key;
        }
    }
    
    if (typeof result === 'string' && options) {
      return Object.entries(options).reduce((str, [optKey, value]) => {
        return str.replace(`{${optKey}}`, String(value));
      }, result);
    }

    if (typeof result !== 'string') {
        // This happens if the key points to an object, not a string. Return the key.
        return key;
    }

    return result;
  }, [translations]);
  
  // Prevent rendering children until translations are loaded to avoid a flash of untranslated text.
  if (!translations) {
    return null; 
  }

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
