"use client";

import { ConditionalHeader } from "@/components/conditional-header";
import { useLanguage } from "@/lib/language-context";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function ViewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Controle de montagem do componente
  const [mounted, setMounted] = useState(false);
  const [isHtmlContent, setIsHtmlContent] = useState(false);
  const { t } = useLanguage();
  
  // Obter parâmetros da URL para verificar o tipo de conteúdo
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Garantir que o componente só seja renderizado no cliente
  useEffect(() => {
    setMounted(true);
    
    // Verificar se o conteúdo é HTML baseado nos parâmetros da URL
    const fileType = searchParams.get('type');
    if (fileType && (fileType.toLowerCase() === 'html' || fileType.toLowerCase().includes('html'))) {
      setIsHtmlContent(true);
    } else {
      // Verificar o caminho para identificar se é HTML (caso o parâmetro não esteja disponível)
      const pathSegments = pathname.split('/');
      const fileId = pathSegments[pathSegments.length - 1];
      if (fileId && fileId.toLowerCase().endsWith('.html')) {
        setIsHtmlContent(true);
      }
    }
    
    return () => setMounted(false);
  }, [searchParams, pathname]);

  // Renderizar apenas quando montado no cliente
  if (!mounted) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="animate-pulse text-center">
          <p>{t('common.loading') || "Carregando..."}</p>
        </div>
      </div>
    );
  }

  // Renderização normal quando montado
  if (isHtmlContent) {
    // Para conteúdo HTML, renderizar sem header para uma interface limpa e minimalista
    return (
      <div className="flex flex-col h-screen w-full">
        {/* Sem header para conteúdo HTML, conforme solicitado */}
        {children}
      </div>
    );
  }
  
  // Para outros tipos de conteúdo, manter o header
  return (
    <div className="flex flex-col h-screen w-full">
      {/* O ConditionalHeader será renderizado apenas para conteúdo não-HTML */}
      <ConditionalHeader />
      {children}
    </div>
  );
}
