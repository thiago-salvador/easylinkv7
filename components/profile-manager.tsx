'use client';

import { useEffect, useState } from 'react';
import { useToast } from './ui/use-toast';

/**
 * ProfileManager - Componente responsável por garantir que todo usuário autenticado
 * tenha um perfil válido no sistema. Este componente é invisível e deve ser importado
 * em layouts ou componentes de alto nível que são renderizados após autenticação.
 */
export function ProfileManager() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();

  // Primeiro efeito: buscar usuário autenticado
  useEffect(() => {
    const fetchAuthUser = async () => {
      try {
        const { createClient } = await import('@/utils/supabase/client');
        const supabase = createClient();
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setCurrentUser(session.user);
        }
      } catch (error) {
        console.error('Erro ao buscar usuário autenticado:', error);
      }
    };
    
    fetchAuthUser();
  }, []);

  // Segundo efeito: verificar e criar perfil quando tivermos um usuário
  useEffect(() => {
    // Só executamos se tivermos um usuário autenticado
    if (!currentUser) return;

    // Função para verificar e criar o perfil se necessário
    const ensureUserProfile = async (user: any) => {
      if (!user) return;

      const { createClient } = await import('@/utils/supabase/client');
      const supabase = createClient();

      try {
        // Verificar se o perfil já existe
        const { data: profile, error: selectError } = await supabase
          .from('profiles')
          .select('id, email, current_plan') // Selecionar colunas necessárias
          .eq('id', user.id)
          .maybeSingle(); // <- MUDAR AQUI

        if (selectError && selectError.code !== 'PGRST116') { // Ignorar erro 'no rows found'
          console.error('Erro ao verificar perfil:', selectError);
          return;
        }

        // Se o perfil não existe, criar um
        if (!profile) {
          console.log(`Perfil não encontrado para ${user.id}. Criando novo perfil...`);
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || '',
              avatar_url: user.user_metadata?.avatar_url || '',
              current_plan: 'free', // Plano padrão inicial
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (insertError) {
            console.error('Erro ao criar perfil:', insertError);
            toast({
              title: 'Erro ao configurar perfil',
              description: 'Houve um problema ao configurar seu perfil. Tente recarregar a página.',
              variant: 'destructive',
            });
          } else {
            console.info(`Perfil criado com sucesso para o usuário ${user.id}`);
            // Recarregar a página para atualizar os dados
            window.location.reload();
          }
        } else {
          console.info('Perfil de usuário já existe:', profile.id);
        }
      } catch (err) {
        console.error('Erro inesperado na gestão do perfil:', err);
      }
    };

    // Executar a verificação do perfil
    ensureUserProfile(currentUser);
  }, [currentUser, toast]);

  // Componente não renderiza nada na UI
  return null;
}

export default ProfileManager;
