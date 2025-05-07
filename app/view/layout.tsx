// app/view/layout.tsx
"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/lib/language-context";
import { useLanguage } from "@/lib/language-context";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

/**
 * ViewLayout - Layout especial para páginas de visualização de arquivos
 * 
 * Este layout fornece:
 * 1. ThemeProvider para controle de tema
 * 2. LanguageProvider para internacionalização
 * 3. Estado de carregamento com feedback visual
 * 4. Estrutura flex para conteúdo de visualização
 * 
 * Não inclui o header principal da aplicação para manter a interface limpa
 */

export default function ViewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Efeito para montar o componente e lidar com erros
  useEffect(() => {
    try {
      setMounted(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      console.error('Error mounting view layout:', err);
    }

    // Cleanup function
    return () => {
      setMounted(false);
    };
  }, []);

  // Estado de carregamento - mostrado enquanto o componente não está montado
  if (!mounted) {
    return (
      <div 
        className="h-screen w-full flex items-center justify-center bg-background"
        role="status"
        aria-live="polite"
      >
        <div className="animate-pulse text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" aria-hidden="true" />
          <p>Carregando Visualizador...</p> 
        </div>
      </div>
    );
  }

  // Estado de erro - mostrado se ocorrer algum erro durante a montagem
  if (error) {
    return (
      <div 
        className="h-screen w-full flex items-center justify-center bg-background"
        role="alert"
      >
        <div className="text-center text-red-500">
          <p className="text-lg font-semibold">Erro ao carregar o visualizador</p>
          <p className="text-sm mt-2">{error.message}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // Renderização normal - com providers e estrutura para o conteúdo
  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="light" 
      enableSystem 
      disableTransitionOnChange
    >
      <LanguageProvider>
        <div 
          className="flex flex-col h-screen w-full bg-background" 
          role="main"
        >
          {children}
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}