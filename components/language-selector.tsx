"use client"

import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { useEffect, useState } from 'react';
import { initializeI18n } from "@/i18n";

export function LanguageSelector() {
  // Sempre chamar o hook useTranslation, independentemente do estado de montagem
  // Isso garante que o mesmo número de hooks seja chamado em todas as renderizações
  const { i18n, t } = useTranslation();
  
  // Flag para controlar quando os elementos de UI devem ser renderizados
  const [mounted, setMounted] = useState(false);
  
  // Inicializar o i18n e garantir que estamos no cliente
  useEffect(() => {
    initializeI18n();
    setMounted(true);
  }, []);

  // Função para mudar o idioma - só é usada quando mounted=true
  const changeLanguage = (lng: string) => {
    if (mounted) {
      i18n.changeLanguage(lng);
    }
  };

  // Renderização básica quando não está montado
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon">
        <Globe className="h-5 w-5" />
      </Button>
    );
  }
  
  // Renderização completa quando está montado
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={mounted ? t('langSelector.changeLang') : 'Change language'}>
          <Globe className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => changeLanguage('pt')}>
          {t('langSelector.portuguese')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage('en')}>
          {t('langSelector.english')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
