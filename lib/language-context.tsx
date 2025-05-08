// lib/language-context.tsx
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

// Função para obter um valor aninhado (sem alterações)
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

// Criar o contexto
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// --- AJUSTES PRINCIPAIS ABAIXO ---

// Helper para verificar se estamos no navegador
const isBrowser = typeof window !== 'undefined';

// Provider do contexto
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Estado para armazenar o idioma atual, iniciando com 'pt'
  // Este valor inicial ('pt') será usado no servidor durante o build
  const [language, setLanguageState] = useState<Language>('pt');

  // Efeito para LER do localStorage APENAS no navegador, APÓS a primeira renderização
  useEffect(() => {
    // Só executa se estiver no navegador
    if (isBrowser) {
      const savedLanguage = localStorage.getItem('easylink_language');
      if (savedLanguage === 'pt' || savedLanguage === 'en') {
        // Define o estado apenas se o idioma salvo for diferente do inicial
        // para evitar re-renderizações desnecessárias se já for 'pt'
        if (savedLanguage !== language) {
           setLanguageState(savedLanguage);
        }
      }
    }
    // O array vazio [] significa que este efeito só roda uma vez, quando o componente "monta" no navegador
  }, []); // Dependência vazia

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

  // Função de tradução (sem alterações na lógica principal)
  const t = (key: string, params?: Record<string, any>): string => {
    const currentTranslations = translations[language]; // Usa o estado atual
    let translatedText = getNestedValue(currentTranslations, key) || key;

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

// Hook para usar o contexto (sem alterações)
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    // Se este erro ainda ocorrer, significa que o problema é mais fundamental
    // ou que useLanguage está sendo chamado fora de um componente filho do Provider.
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}