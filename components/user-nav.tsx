// components/user-nav.tsx
"use client";

import { useState, useCallback, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User, Users, Zap, Trash2 } from "lucide-react";
import { useRouter } from 'next/navigation';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { AccountModal } from '@/components/account-modal';
import { UpgradeModal } from '@/components/upgrade-modal';
import { TeamManagementModal } from '@/components/team-management-modal';
import { DeleteAccountModal } from '@/components/delete-account-modal';
import { createClient } from '@/utils/supabase/client';

interface UserNavProps {
  user: SupabaseUser | null;
}

export function UserNav({ user }: UserNavProps) {
  const router = useRouter();
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);
  
  // Buscar o plano atual do usuário no perfil do Supabase
  const fetchUserPlan = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoadingPlan(true);
      // Buscar o perfil com o plano atual
      const supabase = createClient();
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('current_plan')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        // Se o erro for que a tabela não existe, consideramos o usuário como plano gratuito
        if (error.code === '42P01') { // Código para "relation does not exist"
          console.log('Tabela profiles não existe, usando plano padrão');
          setCurrentPlan('free');
        } else {
          console.error('Erro ao buscar plano do usuário:', error);
          setCurrentPlan('free'); // Fallback para plano gratuito em caso de erro
        }
      } else if (profile) {
        setCurrentPlan(profile.current_plan || 'free');
      } else {
        // Se o perfil for nulo, consideramos o usuário como plano gratuito
        setCurrentPlan('free');
      }
    } catch (error) {
      console.error('Erro não tratado ao verificar perfil:', error);
      setCurrentPlan('free'); // Fallback para plano gratuito
    } finally {
      setIsLoadingPlan(false);
    }
  }, [user]);
  
  // Executar a busca do plano quando o componente montar
  useEffect(() => {
    fetchUserPlan();
  }, [fetchUserPlan]);

  // Função de Logout (usada após deleção bem-sucedida)
  const handleLogout = async () => {
    console.log("[UserNav] Executando logout...");
    const response = await fetch('/api/auth/logout', { method: 'POST' });
    if (response.ok || response.redirected) {
       router.refresh(); // Garante que o estado do servidor é atualizado
       router.push('/'); // Redireciona para a home após logout
       console.log("[UserNav] Logout concluído, redirecionando para home.");
    } else {
       console.error("[UserNav] Falha ao fazer logout via API:", await response.text());
       alert("Erro ao finalizar a sessão após deletar a conta.");
       // Mesmo com erro no logout da API, força refresh e redirecionamento
       router.refresh();
       router.push('/');
    }
  };

  const openUpgradeModal = useCallback(() => {
    setIsAccountModalOpen(false);
    setIsTeamModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsUpgradeModalOpen(true);
  }, []);
  
  // Função para verificar se o usuário tem acesso ao recurso de time
  const handleOpenTeamModal = useCallback(() => {
    // Se o plano for empresarial, abrir o modal de gerenciamento de times
    if (currentPlan === 'business' || currentPlan === 'enterprise') {
      setIsTeamModalOpen(true);
    } else {
      // Para outros planos, abrir o modal de upgrade com a visualização de time
      // A flag showUpgradeView indica que queremos mostrar a visualização de upgrade específica para times
      setIsTeamModalOpen(true);
    }
  }, [currentPlan]);

  // --- Função ATUALIZADA para Deletar Conta ---
  const handleDeleteAccount = async () => {
    console.log("[UserNav] Iniciando chamada API para deletar conta...");
    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Lança erro para ser pego pelo catch no DeleteAccountModal
        throw new Error(errorData.error || "Falha ao deletar conta no servidor.");
      }

      // Se a API retornou sucesso (200 OK)
      console.log("[UserNav] API de deleção retornou sucesso. Executando logout...");
      setIsDeleteModalOpen(false); // Fecha o modal de confirmação
      await handleLogout(); // Faz logout e redireciona

    } catch (error) {
        // O erro será mostrado dentro do DeleteAccountModal
        console.error("[UserNav] Erro capturado ao chamar API de deleção:", error);
        // Re-lança o erro para que o modal possa exibi-lo
        throw error;
    }
    // O estado de loading será tratado dentro do DeleteAccountModal
  };

  const emailInitial = user?.email ? user.email[0].toUpperCase() : '?';
  const displayName = user?.email?.split('@')[0] || 'Utilizador';
  // currentPlan já está definido como state no início do componente

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              {/* <AvatarImage src={user?.user_metadata?.avatar_url} alt={displayName} /> */}
              <AvatarFallback>{emailInitial}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{displayName}</p>
              <p className="text-xs leading-none text-muted-foreground truncate">
                {user?.email || 'Email não disponível'}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => setIsAccountModalOpen(true)}>
              <User className="mr-2 h-4 w-4" />
              <span>Gerenciar Conta</span>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={openUpgradeModal}>
               <Zap className="mr-2 h-4 w-4" />
              <span>Upgrade</span>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleOpenTeamModal}>
              <Users className="mr-2 h-4 w-4" />
              <span>Gerenciar Time</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
           <DropdownMenuItem
             onSelect={() => setIsDeleteModalOpen(true)} // Abre o modal de deleção
             className="text-red-600 focus:text-red-700 focus:bg-red-50"
           >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Deletar Conta</span>
            </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Deslogar</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Renderiza os Modais */}
      <AccountModal user={user} open={isAccountModalOpen} onOpenChange={setIsAccountModalOpen} />
      <UpgradeModal open={isUpgradeModalOpen} onOpenChange={setIsUpgradeModalOpen} currentPlan={currentPlan} />
      <TeamManagementModal user={user} open={isTeamModalOpen} onOpenChange={setIsTeamModalOpen} currentPlan={currentPlan} onUpgradeClick={openUpgradeModal} />
      {/* Passa a função real de deleção para o modal */}
      <DeleteAccountModal open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen} onConfirmDelete={handleDeleteAccount} />
    </>
  );
}
