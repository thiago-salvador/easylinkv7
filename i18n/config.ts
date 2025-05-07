// i18n/config.ts (novo arquivo)
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector'; // Para detecção de idioma
import enTranslations from './locales/en/translation.json'; // Seus JSONs existentes
import ptTranslations from './locales/pt/translation.json'; // Seus JSONs existentes

// Idealmente, você também teria namespaces, como 'DashboardPage'
// Exemplo:
// import dashboardEn from './locales/en/DashboardPage.json';
// import dashboardPt from './locales/pt/DashboardPage.json';


i18n
  .use(LanguageDetector) // Para detectar o idioma do navegador ou localStorage
  .use(initReactI18next) // Passa a instância do i18n para o react-i18next
  .init({
    debug: process.env.NODE_ENV === 'development', // Logs no console em dev
    fallbackLng: 'pt', // Idioma padrão se a detecção falhar ou o idioma não for suportado
    supportedLngs: ['pt', 'en'],
    interpolation: {
      escapeValue: false, // React já faz o escape por padrão
    },
    resources: {
      en: {
        translation: enTranslations, // Namespace padrão
        // DashboardPage: dashboardEn, // Namespace específico
      },
      pt: {
        translation: ptTranslations, // Namespace padrão
        // DashboardPage: dashboardPt, // Namespace específico
      },
    },
    // Configuração do detector de idioma (opcional, mas recomendado)
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'easylink_language', // Chave que você já usa
    },
  });

export default i18n;