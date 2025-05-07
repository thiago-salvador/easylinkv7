// components/html-viewer.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useLanguage } from "@/lib/language-context"; // <<< ALTERADO AQUI
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react"; // Ícones necessários
import { Logo } from "@/components/logo";

interface HTMLViewerProps {
  fileUrl: string;
  fileName?: string;
  isPremium?: boolean;
  skipLayout?: boolean;
}

export function HTMLViewer({
  fileUrl,
  fileName = "page.html",
  isPremium = false,
  skipLayout = false // Esta prop é recebida, mas sua lógica principal de "pular layout" acontece no RootLayout ou ViewLayout
}: HTMLViewerProps) {
  const isMounted = useRef(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [iframeKey, setIframeKey] = useState<number>(Date.now());

  const { t } = useLanguage(); // <<< ALTERADO AQUI

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchHtmlContent = useCallback(async () => {
    if (!fileUrl) {
      if (isMounted.current) {
        setError(t('htmlViewer.noFileUrl', "URL do arquivo não fornecida."));
        setIsLoading(false);
      }
      return;
    }
    
    if (!isMounted.current) return;
    setIsLoading(true);
    setError(null);
    setHtmlContent(null);

    try {
      const response = await fetch(fileUrl);
      if (!isMounted.current) return;

      if (!response.ok) {
        throw new Error(t('htmlViewer.fetchError', { status: response.status }) || `Erro ao buscar o conteúdo HTML: ${response.status}`);
      }
      const htmlText = await response.text(); // Renomeado para htmlText para clareza
      if (!isMounted.current) return;

      setHtmlContent(htmlText);
    } catch (err: any) {
      if (!isMounted.current) return;
      console.error("Erro ao buscar conteúdo HTML:", err);
      setError(err.message || t('htmlViewer.loadError') || "Erro ao carregar o conteúdo HTML");
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [fileUrl, t]);

  useEffect(() => {
    fetchHtmlContent();
  }, [fetchHtmlContent, iframeKey]);

  const handleReload = () => {
    if (!isMounted.current) return;
    setIframeKey(Date.now());
  };

  const handleIframeLoad = () => {
    // Geralmente, o setIsLoading(false) no 'finally' do fetchHtmlContent é mais confiável.
  };

  return (
    <div className="flex flex-col h-full w-full bg-white">
      <div className="flex-1 relative bg-white overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-20" role="status" aria-live="polite">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-2 text-sm text-gray-600">{t('common.loading')}</p> {/* Usando common.loading */}
          </div>
        )}
        {error && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-20 p-4" role="alert" aria-live="assertive">
            <div className="text-center p-6 max-w-lg bg-white rounded-lg shadow-md border border-red-200">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">{t('common.error')}</h3> {/* Usando common.error */}
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={handleReload}>{t('htmlViewer.tryAgain', "Tentar novamente")}</Button>
            </div>
          </div>
        )}
        {!error && htmlContent && (
          <iframe
            key={iframeKey}
            srcDoc={htmlContent}
            className="w-full h-full border-0 bg-white"
            title={fileName}
            loading="lazy"
            onLoad={handleIframeLoad}
            aria-label={t('htmlViewer.contentAriaLabel', { fileName: fileName }) || `Conteúdo de ${fileName}`}
            sandbox="allow-scripts allow-forms allow-popups allow-same-origin" 
          />
        )}
        {!isLoading && !error && !htmlContent && fileUrl && (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                <p>{t('htmlViewer.emptyContent', "Nenhum conteúdo para exibir.")}</p>
             </div>
        )}
      </div>
      {/* Marca d'água */}
      {!isPremium && (
        <div className="fixed bottom-4 right-4 z-30 opacity-70 hover:opacity-100 transition-opacity pointer-events-none">
          <a 
            href="https://easylink.live" // Coloque o link correto do seu site
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-1 bg-white/70 backdrop-blur-sm px-2 py-1 rounded-full shadow-md no-underline hover:shadow-lg"
            style={{ pointerEvents: 'auto' }} // Permite que o link da marca d'água seja clicável
          >
            <Logo className="w-4 h-4" />
            <span className="text-xs font-medium text-gray-700">EasyLink</span>
          </a>
        </div>
      )}
    </div>
  );
}