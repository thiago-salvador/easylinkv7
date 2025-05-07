'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Tipos de idiomas suportados
export type Language = 'pt' | 'en';

// Tipo do contexto
type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, any>) => string;
};

// Importar traduções
import ptTranslations from '@/i18n/locales/pt/translation.json';
import enTranslations from '@/i18n/locales/en/translation.json';

// Mapa de traduções
const translations = {
  pt: ptTranslations,
  en: enTranslations
};

// Função para obter um valor aninhado de um objeto usando uma string de caminho
function getNestedValue(obj: any, path: string): string {
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      return path; // Retorna a chave se não encontrar a tradução
    }
  }
  
  return result as string;
}

// Criar o contexto
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Provider do contexto
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Estado para armazenar o idioma atual
  const [language, setLanguageState] = useState<Language>('pt');
  
  // Efeito para carregar o idioma salvo no localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('easylink_language');
    if (savedLanguage === 'pt' || savedLanguage === 'en') {
      setLanguageState(savedLanguage);
    }
  }, []);
  
  // Função para alterar o idioma e salvar no localStorage
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('easylink_language', lang);
  };
  
  // Função de tradução com suporte a interpolação de parâmetros
  const t = (key: string, params?: Record<string, any>): string => {
    const currentTranslations = translations[language];
    let translatedText = getNestedValue(currentTranslations, key) || key;
    
    // Interpolar parâmetros se fornecidos
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translatedText = translatedText.replace(`{${paramKey}}`, String(paramValue));
      });
    }
    
    return translatedText;
  };
  
  // Valor do contexto
  const contextValue: LanguageContextType = {
    language,
    setLanguage,
    t
  };
  
  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook para usar o contexto
export function useLanguage() {
  const context = useContext(LanguageContext);
  
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  
  return context;
}
