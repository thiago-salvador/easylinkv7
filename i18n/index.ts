// i18n/index.ts
'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importar arquivos de tradução
import translationPT from './locales/pt/translation.json';
import translationEN from './locales/en/translation.json';

// Evitar inicializações redundantes
let initialized = false;

// Recursos de tradução
const resources = {
  pt: {
    translation: translationPT,
  },
  en: {
    translation: translationEN,
  },
};

// Configuração básica do i18n (sem inicialização completa)
// Isso é necessário para que o hook useTranslation funcione mesmo antes da inicialização completa
i18n
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt',
    // Desabilitar inicialização automática - será feita explicitamente pelo initializeI18n
    initImmediate: false,
  });

// Implementação lazy para garantir que só inicialize completamente no cliente
const initializeI18n = () => {
  // Verificar se já foi inicializado ou se está no lado do servidor
  if (initialized || typeof window === 'undefined') {
    return;
  }

  try {
    // Configuração completa com detector de idioma e outras opções
    i18n
      // Corrigindo o erro de tipagem com o LanguageDetector
      .use(LanguageDetector as any)
      .init({
        resources,
        fallbackLng: 'pt',
        debug: process.env.NODE_ENV === 'development',
        interpolation: {
          // Evita conflitos com React
          escapeValue: false,
        },
        detection: {
          // Ordem de detecção de idioma - adicionando cookie para melhor persistência
          order: ['localStorage', 'cookie', 'navigator', 'htmlTag'],
          // Nome da chave no localStorage e cookie
          lookupLocalStorage: 'easylink_language',
          lookupCookie: 'easylink_language',
          // Persistir idioma no localStorage e cookie
          caches: ['localStorage', 'cookie'],
        },
        // Configuração de cookies separada da detecção para evitar erros de tipagem
        // Estas opções são usadas pelo detector de idioma
        cookieOptions: {
          expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365), // 1 ano
          domain: window.location.hostname,
          secure: window.location.protocol === 'https:',
        },
      } as any); // Usando 'as any' para evitar problemas de tipagem com as opções de cookies

    initialized = true;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`i18n initialized successfully with languages: ${Object.keys(resources).join(', ')}`);
    }
  } catch (error) {
    console.error('Error initializing i18n:', error);
  }
};

// Inicializar no lado do cliente se estiver disponível
if (typeof window !== 'undefined') {
  initializeI18n();
}

export default i18n;
export { initializeI18n };

