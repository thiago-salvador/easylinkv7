"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { SimpleLanguageSelector } from "@/components/simple-language-selector";
import { useLanguage } from "@/lib/language-context";
import { ArrowLeft } from "lucide-react";

interface ViewerHeaderProps {
  fileName?: string;
  backUrl?: string;
}

export function ViewerHeader({ fileName, backUrl = "/" }: ViewerHeaderProps) {
  const { t } = useLanguage();
  const mountedRef = useRef(false);
  
  // Controle de montagem do componente usando useRef
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  
  // Se o componente não estiver montado, não renderizar nada
  if (!mountedRef.current) return null;
  
  // Renderização simplificada
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Logo e Botão de Voltar */}
        <div className="flex items-center">
          <Link href={backUrl} className="mr-4 flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">{t('common.back')}</span>
          </Link>
          <div className="flex items-center space-x-2">
            <Logo className="h-6 w-6" />
            <span className="font-bold text-gradient">
              EasyLink
            </span>
          </div>
        </div>

        {/* Nome do arquivo no centro */}
        {fileName && (
          <div className="flex-1 flex justify-center">
            <h1 className="text-sm font-medium truncate max-w-md">
              {fileName}
            </h1>
          </div>
        )}

        {/* Seletor de Idioma */}
        <div className="flex items-center">
          <SimpleLanguageSelector />
        </div>
      </div>
    </header>
  );
}
