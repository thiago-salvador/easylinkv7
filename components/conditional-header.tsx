// components/conditional-header.tsx
"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/header";
import { DashboardHeader } from "@/components/dashboard-header";
import type { User } from '@supabase/supabase-js';
import { useLanguage } from "@/lib/language-context";
import { useEffect, useState } from "react";

interface ConditionalHeaderProps {
  user: User | null; // Recebe o usuário obtido no RootLayout (Server Component)
}

/**
 * ConditionalHeader - Componente que decide qual header mostrar baseado na rota e no estado de autenticação
 * 
 * Regras:
 * 1. Rotas /view/* não mostram header
 * 2. Usuários autenticados veem o DashboardHeader
 * 3. Usuários não autenticados veem o Header padrão
 */
export function ConditionalHeader({ user }: ConditionalHeaderProps) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  // Garantir que o componente só renderize no cliente para evitar problemas de hidratação
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Não renderizar nada durante a hidratação para evitar mismatch
  if (!mounted) {
    return null;
  }

  // Regra 1: Se estivermos em uma rota de visualização, não renderiza nenhum header
  if (pathname?.startsWith('/view/')) {
    return null;
  }

  // Regra 2: Para todas as outras rotas, decide qual header mostrar baseado na prop 'user'
  try {
    if (user) {
      // Usuário está logado
      return <DashboardHeader user={user} />;
    } else {
      // Usuário não está logado
      return <Header />;
    }
  } catch (error) {
    console.error("Error rendering header:", error);
    // Em caso de erro, mostrar o header padrão como fallback
    return <Header />;
  }
}