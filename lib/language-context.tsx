// lib/language-context.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Tipos de idiomas suportados
export type Language = 'pt' | 'en';

// Importar traduções
import ptTranslations from '@/i18n/locales/pt/translation.json';
import enTranslations from '@/i18n/locales/en/translation.json';

// Mapa de traduções
const translations = {
  pt: ptTranslations,
  en: enTranslations
};

// Função para obter um valor aninhado
function getNestedValue(obj: any, path: string): string {
  const keys = path.split('.');
  let result = obj;
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      return path; // Retorna a chave se não encontrar
    }
  }
  return String(result); // Garante que seja string
}

// Valores padrão para o servidor - IMPORTANTE para SSR
const defaultLanguage: Language = 'pt';

// Função de tradução que funciona mesmo sem contexto (para SSR)
function getTranslation(lang: Language, key: string, params?: Record<string, any>): string {
  const currentTranslations = translations[lang];
  let translatedText = getNestedValue(currentTranslations, key) || key;

  if (params) {
    Object.entries(params).forEach(([paramKey, paramValue]) => {
      translatedText = translatedText.replace(`{${paramKey}}`, String(paramValue));
    });
  }
  return translatedText;
}

// Tipo do contexto
type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, any>) => string;
};

// Criar o contexto com um valor padrão para SSR
// Esta é a chave para resolver o problema de SSR - fornecemos um valor padrão
// que será usado durante a renderização no servidor
const defaultContextValue: LanguageContextType = {
  language: defaultLanguage,
  setLanguage: () => {}, // Função vazia no servidor
  t: (key: string, params?: Record<string, any>) => getTranslation(defaultLanguage, key, params)
};

const LanguageContext = createContext<LanguageContextType>(defaultContextValue);

// Helper para verificar se estamos no navegador
const isBrowser = typeof window !== 'undefined';

// Provider do contexto
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Estado para armazenar o idioma atual, iniciando com o valor padrão
  const [language, setLanguageState] = useState<Language>(defaultLanguage);

  // Efeito para LER do localStorage APENAS no navegador, APÓS a primeira renderização
  useEffect(() => {
    // Só executa se estiver no navegador
    if (isBrowser) {
      const savedLanguage = localStorage.getItem('easylink_language');
      if (savedLanguage === 'pt' || savedLanguage === 'en') {
        // Define o estado apenas se o idioma salvo for diferente do inicial
        if (savedLanguage !== language) {
           setLanguageState(savedLanguage as Language);
        }
      }
    }
  }, [language]);

  // Função para alterar o idioma e salvar no localStorage (apenas no navegador)
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    // Só tenta salvar se estiver no navegador
    if (isBrowser) {
      try {
        localStorage.setItem('easylink_language', lang);
      } catch (e) {
        console.error("Falha ao salvar idioma no localStorage:", e);
      }
    }
  };

  // Função de tradução
  const t = (key: string, params?: Record<string, any>): string => {
    return getTranslation(language, key, params);
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

// Hook para usar o contexto - agora SEMPRE retorna um valor válido
export function useLanguage() {
  return useContext(LanguageContext);
}