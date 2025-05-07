// Declaração de tipos para arquivos de tradução JSON
declare module '*/translation.json' {
  const content: Record<string, any>;
  export default content;
}

// Typings para i18next-browser-languagedetector
declare module 'i18next-browser-languagedetector' {
  import { DetectorOptions } from 'i18next';
  
  export interface BrowserDetectorOptions extends DetectorOptions {
    lookupLocalStorage?: string;
    lookupSessionStorage?: string;
    lookupCookie?: string;
    cookieExpirationDate?: Date;
    cookieDomain?: string;
    order?: string[];
    caches?: string[];
  }
  
  export default class BrowserLanguageDetector {
    constructor(services?: any, options?: BrowserDetectorOptions);
    init(services?: any, options?: BrowserDetectorOptions): void;
    detect(): string | readonly string[] | undefined;
    cacheUserLanguage(lng: string): void;
  }
}
