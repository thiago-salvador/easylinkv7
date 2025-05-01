// components/html-viewer.tsx

"use client"

import { useState, useEffect, useRef, useCallback } from "react" // Added useCallback
import { Button } from "@/components/ui/button"
import { AlertTriangle, Loader2 } from "lucide-react" // Only these icons needed here
import { Logo } from "@/components/logo"
import { cn } from "@/lib/utils"
import { HTMLToolbar } from "@/components/html-toolbar"; // Import the new toolbar component

interface HTMLViewerProps {
  fileUrl: string // URL to fetch the HTML content
  fileName?: string
  isPremium?: boolean
}

export function HTMLViewer({ fileUrl, fileName = "page.html", isPremium = false }: HTMLViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [htmlContent, setHtmlContent] = useState<string | null>(null)

  // Sandbox Permissions:
  // RECOMMENDATION: Remove 'allow-same-origin' if the HTML content doesn't strictly need it.
  const sandboxPermissions = [
    "allow-scripts",
    "allow-same-origin",
    "allow-forms",
    "allow-popups",
    "allow-modals",
  ].join(" ");

  // Effect to fetch HTML content
  useEffect(() => {
    const fetchHtml = async () => {
      setIsLoading(true);
      setError(null);
      setHtmlContent(null);

      try {
        const response = await fetch(fileUrl);
        if (!response.ok) {
          const statusText = response.statusText || 'Unknown Error';
          throw new Error(`Falha ao buscar HTML (${response.status}): ${statusText}`);
        }
        const textContent = await response.text();
        setHtmlContent(textContent);
      } catch (fetchError: any) {
        console.error("HTMLViewer: Error fetching HTML content:", fetchError); // Keep real error logging
        setError(`Não foi possível carregar o conteúdo HTML. ${fetchError.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (fileUrl) {
      fetchHtml();
    } else {
      setError("URL do arquivo HTML inválida ou não fornecida.");
      setIsLoading(false);
    }
  }, [fileUrl]);

  // Reload content function (wrapped in useCallback)
  const reloadContent = useCallback(() => {
     if (fileUrl && !isLoading) {
        setIsLoading(true);
        setError(null);
        setHtmlContent(null);
        const fetchHtml = async () => {
            try {
                const response = await fetch(fileUrl);
                if (!response.ok) throw new Error(`Falha ao buscar HTML (${response.status})`);
                setHtmlContent(await response.text());
            } catch (fetchError: any) {
                setError(`Falha ao recarregar: ${fetchError.message}`);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHtml();
     }
  }, [fileUrl, isLoading]); // Dependencies for useCallback

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Use the new Toolbar component */}
      <HTMLToolbar
        fileUrl={fileUrl}
        fileName={fileName}
        isLoading={isLoading}
        onReload={reloadContent} // Pass the reload function as a prop
      />

      {/* HTML Content Area */}
      <div className="flex-1 relative bg-white overflow-hidden">
        {/* Loader Overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-20" role="status" aria-label="Carregando conteúdo HTML">
            <Loader2 className="h-12 w-12 animate-spin text-primary" aria-hidden="true" />
            <p className="mt-2 text-sm text-gray-600">Carregando...</p>
          </div>
        )}

        {/* Error Overlay */}
        {error && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-20 p-4" role="alert">
            <div className="text-center p-6 max-w-lg bg-white rounded-lg shadow-md border border-red-200">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" aria-hidden="true" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Erro ao Carregar Conteúdo</h3>
              <p className="text-gray-600 mb-4 text-sm">{error}</p>
              {/* Reload button uses the passed callback */}
              <Button onClick={reloadContent}>Tentar novamente</Button>
            </div>
          </div>
        )}

        {/* Iframe using srcdoc */}
        {!isLoading && !error && htmlContent !== null && (
          <iframe
            ref={iframeRef}
            srcDoc={htmlContent}
            className="w-full h-full border-0 bg-white"
            title={fileName || 'Conteúdo HTML'}
            sandbox={sandboxPermissions}
            loading="eager"
          />
        )}
         {/* Fallback if content is empty but no error/loading */}
         {!isLoading && !error && htmlContent === null && (
             <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-gray-500">
                 Não foi possível carregar o conteúdo HTML ou o arquivo está vazio.
             </div>
         )}
      </div>

      {/* Watermark */}
      {!isPremium && (
        <div className="fixed bottom-4 right-4 z-30 opacity-70 pointer-events-none" aria-hidden="true">
          <div className="flex items-center gap-1 bg-white/50 backdrop-blur-sm px-2 py-1 rounded-full">
            <Logo className="w-4 h-4" />
            <span className="text-xs font-medium text-gray-600">EasyLink</span>
          </div>
        </div>
      )}
    </div>
  )
}
