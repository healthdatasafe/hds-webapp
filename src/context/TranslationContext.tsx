
import React, { createContext, useState, useContext, useEffect } from 'react';
import en from '../translations/en';
import fr from '../translations/fr';

// Define available languages
const languages: Record<string, any> = {
  en,
  fr
};

interface TranslationContextType {
  t: (key: string) => string;
  currentLanguage: string;
  changeLanguage: (lang: string) => void;
  availableLanguages: string[];
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get the language from localStorage or use browser language or default to 'en'
  const getBrowserLanguage = () => {
    const browserLang = navigator.language.split('-')[0];
    return Object.keys(languages).includes(browserLang) ? browserLang : 'en';
  };

  const [currentLanguage, setCurrentLanguage] = useState<string>(
    localStorage.getItem('language') || getBrowserLanguage()
  );

  // Save language preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('language', currentLanguage);
  }, [currentLanguage]);

  // Translation function
  const t = (key: string): string => {
    const translations = languages[currentLanguage] || languages['en'];
    return translations[key] || key;
  };

  // Change language function
  const changeLanguage = (lang: string) => {
    if (Object.keys(languages).includes(lang)) {
      setCurrentLanguage(lang);
    }
  };

  const value = {
    t,
    currentLanguage,
    changeLanguage,
    availableLanguages: Object.keys(languages)
  };

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
};

export const useTranslation = (): TranslationContextType => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};
