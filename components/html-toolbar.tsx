// components/html-toolbar.tsx

import React, { useCallback, useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, RefreshCw, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface HTMLToolbarProps {
  fileUrl: string;
  fileName: string;
  isLoading: boolean;
  onReload: () => void;
}

export function HTMLToolbar({
  fileUrl,
  fileName,
  isLoading,
  onReload,
}: HTMLToolbarProps) {
  const mountedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  
  // Controle de montagem do componente usando useRef
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  
  // Handler seguro para recarregar
  const handleReload = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!mountedRef.current || isLoading) return;
    
    try {
      onReload();
    } catch (error) {
      console.error("Erro ao tentar recarregar:", error);
      if (mountedRef.current) {
        setError("Não foi possível recarregar o conteúdo.");
      }
    }
  }, [isLoading, onReload]);
  
  // Se o componente ainda não foi montado, não renderizar nada
  if (!mountedRef.current) return null;
  
  // Renderização simplificada com tratamento de erros
  try {
    return (
      <div className="flex items-center justify-between p-2 border-b bg-white flex-shrink-0">
        {/* Nome do arquivo */}
        <div className="flex items-center space-x-2 min-w-0">
          {error ? (
            <div className="flex items-center text-red-500 text-sm">
              <AlertTriangle className="h-4 w-4 mr-1" />
              <span>{error}</span>
            </div>
          ) : (
            <span className="text-sm font-medium truncate" title={fileName}>
              {fileName}
            </span>
          )}
        </div>

        {/* Botões de ação */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleReload} 
            title="Recarregar" 
            disabled={isLoading} 
            aria-label="Recarregar Conteúdo"
          >
            <RefreshCw className={cn("h-5 w-5", isLoading && "animate-spin")} />
          </Button>
          {fileUrl && (
            <>
              <Button variant="ghost" size="icon" asChild title="Download" aria-label="Fazer Download do Arquivo">
                <a 
                  href={fileUrl} 
                  download={fileName} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (isLoading) {
                      e.preventDefault();
                    }
                  }}
                >
                  <Download className="h-5 w-5" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild title="Abrir URL Direta" aria-label="Abrir URL Direta em Nova Aba">
                <a 
                  href={fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (isLoading) {
                      e.preventDefault();
                    }
                  }}
                >
                  <ExternalLink className="h-5 w-5" />
                </a>
              </Button>
            </>
          )}
        </div>
      </div>
    );
  } catch (renderError) {
    console.error("Erro ao renderizar HTMLToolbar:", renderError);
    // Fallback em caso de erro
    return (
      <div className="flex items-center justify-between p-2 border-b bg-white">
        <span className="text-sm">Visualizador de HTML</span>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => window.location.reload()} 
          title="Recarregar página"
        >
          <RefreshCw className="h-5 w-5" />
        </Button>
      </div>
    );
  }
}
