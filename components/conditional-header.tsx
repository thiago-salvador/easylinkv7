"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { DashboardHeader } from "@/components/dashboard-header";
import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';

export function ConditionalHeader() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Função para carregar o estado do usuário
    const loadUserState = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        // Atualiza o estado com o usuário, se houver uma sessão
        if (session) {
          setUser(session.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Carregar o estado inicial
    loadUserState();

    // Configurar um listener para mudanças de autenticação
    const supabase = createClient();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    // Limpar a inscrição quando o componente for desmontado
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Durante o carregamento, não mostramos nenhum header
  // Ou podemos mostrar um header padrão enquanto carrega, como o normal
  if (loading) {
    return <Header />;
  }

  // Depois de carregar, mostrar o header apropriado com base no estado de autenticação
  return user ? <DashboardHeader user={user} /> : <Header />;
}
