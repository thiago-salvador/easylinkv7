// components/dashboard-header.tsx
"use client"; // Precisa ser client para usar UserNav e potencialmente hooks

import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { UserNav } from "@/components/user-nav"; // Importa o dropdown da conta
import { usePathname } from 'next/navigation'; // Para saber a página atual (opcional)
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { SimpleLanguageSelector } from "@/components/simple-language-selector"; // Importa o novo seletor de idioma
import { useLanguage } from "@/lib/language-context"; // Importa o hook de idioma

interface DashboardHeaderProps {
    user: SupabaseUser | null; // Recebe o objeto user
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const pathname = usePathname(); // Opcional: para estilizar link ativo
  const { t } = useLanguage(); // Hook de idioma

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Logo e Links Principais */}
        <div className="mr-4 hidden md:flex">
          <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
            <Logo className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block text-gradient">
              EasyLink
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/dashboard"
              className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center gap-1"
            >
              <FileText className="h-4 w-4" />
              {t('dashboard.myFiles')}
            </Link>
            <Link
              href="/ajuda" // Defina a rota correta
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              {t('dashboard.help')}
            </Link>
            <Link
              href="/api-docs" // Defina a rota correta
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              {t('dashboard.api')}
            </Link>
             {/* Link de Upgrade pode ser diferente ou removido se estiver no dropdown */}
             <Link
              href="/upgrade" // Defina a rota correta
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              {t('dashboard.upgrade')}
            </Link>
          </nav>
        </div>

        {/* Espaçador e Controles da Direita */}
        <div className="flex flex-1 items-center justify-end space-x-4">
           {/* Seletor de Idioma */}
           <SimpleLanguageSelector />
           
           {/* Botão de Upgrade (alternativa ou redundante ao link) */}
           {/* <Button size="sm">Upgrade</Button> */}

           {/* Dropdown da Conta do Utilizador */}
           <UserNav user={user} />
        </div>
      </div>
    </header>
  );
}

