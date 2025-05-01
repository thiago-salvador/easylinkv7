'use client';

import { useState, useEffect } from 'react';

// Hook personalizado para obter o usuário autenticado
export function useUser() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Função para buscar o usuário atual
    const fetchUser = async () => {
      try {
        // Importa o cliente Supabase dinamicamente para evitar múltiplas instâncias
        const { createClient } = await import('@/utils/supabase/client');
        const supabase = createClient();

        // Busca a sessão atual
        const { data: { session } } = await supabase.auth.getSession();
        
        // Se tivermos uma sessão, atualiza o estado com o usuário
        if (session) {
          setUser(session.user);
        }
      } catch (error) {
        console.error('Erro ao buscar usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Listener para atualizar o usuário quando o estado da autenticação muda
    let subscription: { unsubscribe: () => void } | null = null;
    
    const setupAuthListener = async () => {
      try {
        const { createClient } = await import('@/utils/supabase/client');
        const supabase = createClient();
        
        const { data } = supabase.auth.onAuthStateChange((_event, session) => {
          setUser(session?.user || null);
          setLoading(false);
        });
        
        subscription = data.subscription;
      } catch (error) {
        console.error('Erro ao configurar listener de autenticação:', error);
      }
    };
    
    setupAuthListener();

    // Limpa a assinatura quando o componente é desmontado
    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}

export default useUser;
