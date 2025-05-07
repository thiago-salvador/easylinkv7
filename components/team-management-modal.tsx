// components/team-management-modal.tsx
"use client";

import { useState } from 'react';
import * as React from 'react';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UserPlus, Trash2, Crown, Check, Zap, Info, Trophy, CreditCard, Loader2, ArrowRight, X } from "lucide-react";
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { useLanguage } from "@/lib/language-context";

// Create Dialog components directly from Radix UI
const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  // Importamos useLanguage aqui para usar no componente
  const { t } = useLanguage();
  
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">{t('common.close')}</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

// Não usamos mais o Stripe diretamente para evitar problemas no ambiente local

interface TeamManagementModalProps {
  user: SupabaseUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan?: string;
  onUpgradeClick?: () => void; // Callback para abrir o modal de upgrade completo (opcional)
  showUpgradeView?: boolean; // Força a visualização de upgrade
}

// Definir tipo para o papel do membro
type MemberRole = 'owner' | 'member';

// Definir tipo para o membro da equipe
interface TeamMember {
  id: string;
  email: string;
  role: MemberRole;
}

// Dados de exemplo para membros
const exampleMembers: TeamMember[] = [
  { id: '1', email: 'dono@exemplo.com', role: 'owner' },
  { id: '2', email: 'membro1@exemplo.com', role: 'member' },
];

// Planos que permitem gestão de equipa
const plansWithTeamFeature = ['pro', 'empresarial'];

// Features do plano Empresarial (ajuste conforme necessário)
const empresarialPlanFeatures = [
  "Projetos ativos ilimitados",
  "10 GB limite de conta",
  "500.000 visitantes /mês",
  "Adicionar membros da equipe",
  "Modo de feedback",
  "Captura de emails",
  "Todos os recursos do plano Pro",
];

// Detalhes do plano Empresarial para upgrade
const empresarialPlanDetails = {
  name: "Empresarial",
  monthlyPrice: 155,
  yearlyPrice: 1860, 
  yearlyDiscount: "2 meses grátis",
  currencySymbol: "R$",
  // Product IDs do Stripe
  priceIdMonthly: "price_1RJRrLGLj82qb9P7gwrVdBOf",
  priceIdYearly: "price_1RJSmPGLj82qb9P7wVlkgHBY",
};

export function TeamManagementModal({
  user,
  open,
  onOpenChange,
  currentPlan = "free", // Default para free se não fornecido
  onUpgradeClick,
  showUpgradeView = false,
}: TeamManagementModalProps) {
  const { t } = useLanguage();
  // Verificar se o usuário tem acesso ao recurso de gerenciamento de times
  const hasTeamAccess = currentPlan === 'business' || currentPlan === 'enterprise';
  // Estados para a visualização de gerenciamento de equipe
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [members, setMembers] = useState(exampleMembers); // Usar estado local para exemplo

  // Estados para a visualização de upgrade
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Funcionalidade de gerenciamento de equipe já verificada na constante hasTeamAccess
  // Remover showUpgradeView que não é mais necessário - sempre mostramos upgrade quando não tem acesso

  // Lógica de Convite (Placeholder)
  const handleInvite = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsInviting(true);
    
    // Simulação de API
    setTimeout(() => {
      setIsInviting(false);
      setInviteEmail('');
      // Adicionar o convite à lista (em uma app real, isso seria após resposta da API)
      setMembers(prev => [...prev, { id: Date.now().toString(), email: inviteEmail, role: 'member' as const }]);
    }, 1000);
  };

  // Lógica de Remoção (Placeholder)
  const handleRemoveMember = (memberId: string) => {
    // Simular remoção
    setMembers(prev => prev.filter(member => member.id !== memberId));
  };

  // Lógica de Checkout simplificada (sem depender do Stripe)
  const handleUpgradeCheckout = async () => {
    if (isProcessingPayment || !user) return; // Evita múltiplos cliques e verifica login
    setIsProcessingPayment(true);
    setPaymentError(null);
    
    try {
      // Produto e Preço IDs do plano selecionado
      const priceId = billingCycle === "monthly" 
        ? empresarialPlanDetails.priceIdMonthly 
        : empresarialPlanDetails.priceIdYearly;
      
      if (!priceId) {
        throw new Error("ID de preço não encontrado para checkout.");
      }

      // Buscar o token de autenticação para incluir no header da requisição
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Você precisa estar logado para fazer upgrade do plano.');
      }
      
      // Simular o processo de upgrade através da atualização do perfil
      console.log(`Processando upgrade para plano empresarial (${priceId})`);
      
      // Atualizar o perfil no Supabase primeiro
      try {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            potential_plan: 'business',
            business_plan_billing: billingCycle,
            updated_at: new Date().toISOString()
          })
          .eq('id', session.user.id);
        
        if (updateError) {
          console.error('Erro ao atualizar perfil:', updateError.message);
        } else {
          console.log('Perfil atualizado com interesse no plano empresarial');
        }
      } catch (err) {
        console.error('Exceção ao atualizar perfil:', err);
      }
      
      // Guardar no localStorage que o usuário tem interesse no plano empresarial
      localStorage.setItem('potentialPlan', 'business');
      localStorage.setItem('billingCycle', billingCycle);
      
      // Mostrar feedback de sucesso e simular o redirecionamento
      console.log('Processando upgrade...');
      
      // Simular um tempo de processamento para feedback visual
      setTimeout(() => {
        // Redirecionar para página de sucesso simulada
        window.location.href = '/dashboard?upgrade=pending';
      }, 2000);

    } catch (error: any) {
      console.error("Erro ao processar upgrade:", error);
      setPaymentError(
        error.message || "Ocorreu um erro ao processar o upgrade. Tente novamente."
      );
      setIsProcessingPayment(false);
    }
  };

  // Preço a ser exibido com base no ciclo de cobrança
  const displayPrice = billingCycle === "monthly" 
    ? empresarialPlanDetails.monthlyPrice 
    : empresarialPlanDetails.yearlyPrice;
  
  // Texto do ciclo de cobrança
  const billingText = billingCycle === "monthly" ? "por mês" : "por ano";
  
  // Símbolo da moeda
  const currencySymbol = empresarialPlanDetails.currencySymbol;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "p-0 overflow-hidden rounded-lg", // Estilos base do DialogContent
        hasTeamAccess ? "sm:max-w-lg" : "sm:max-w-[700px] max-h-[90vh] overflow-y-auto" // Largura e altura condicional
      )}>
        {hasTeamAccess ? (
          // --- Visualização de Gerenciamento de Equipe ---
          <div className="p-6"> {/* Adiciona padding interno */}
            <DialogHeader>
              <DialogTitle className="text-xl">{t('modals.team.title')}</DialogTitle>
              <DialogDescription>{t('modals.team.description')}</DialogDescription>
            </DialogHeader>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">{t('modals.team.teamMembers')}</h3>
              <p className="text-sm text-muted-foreground mb-6">
                {t('modals.team.manageMembersDescription')}
              </p>
              <div className="space-y-2 mb-6">
                {members.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{member.email[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{member.email}</p>
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-800 flex items-center">
                          <Crown className="h-3 w-3 mr-1" />
                          {t('modals.team.owner')}
                        </span>
                      </div>
                    </div>
                    {member.role !== 'owner' && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 rounded-full text-gray-400 hover:text-red-500"
                        onClick={() => handleRemoveMember(member.id)}
                        disabled={false} // Já verificamos acima que role !== 'owner'
                        title={t('modals.team.removeMember')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              
              <form onSubmit={handleInvite} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('modals.team.guestEmail')}</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="email"
                      name="email"
                      type="email" 
                      placeholder={t('modals.team.emailPlaceholder')} 
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                    />
                    <Button type="submit" disabled={isInviting}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      {t('modals.team.invite')}
                    </Button>
                  </div>
                  {inviteError && <p className="text-sm text-red-500">{inviteError}</p>}
                </div>
              </form>
            </div>
            
            <DialogClose className="absolute top-4 right-4" />
          </div>
        ) : (
          // --- Visualização de Upgrade com design moderno ---
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Elementos decorativos de fundo reduzidos */}
            <div className="absolute top-6 left-6 w-16 h-16 bg-blue-100 rounded-full mix-blend-multiply filter blur-lg opacity-20 animate-blob"></div>
            <div className="absolute bottom-6 right-6 w-16 h-16 bg-primary/20 rounded-full mix-blend-multiply filter blur-lg opacity-10 animate-blob animation-delay-2000"></div>
            
            {/* Coluna esquerda: Informações do plano com visual aprimorado */}
            <div className="md:col-span-1 p-5 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 flex flex-col space-y-4 relative z-10 rounded-l-lg overflow-hidden">
              {/* Elemento decorativo superior */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full"></div>
              
              {/* Badge superior */}
              <div className="inline-flex items-center mb-1 px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-primary text-xs font-medium">{t('modals.team.teamManagement')}</span>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-primary/90 to-indigo-800 text-transparent bg-clip-text">{t('modals.team.businessPlan')}</h2>
                
                <div className="mt-5 mb-2">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold price-tag">
                      {currencySymbol}{displayPrice}
                    </span>
                    <span className="text-gray-500 ml-1 text-sm">
                      {billingText}
                    </span>
                  </div>
                  
                  {/* Garantia de satisfação */}
                  <div className="inline-flex items-center text-xs text-gray-600 mt-2 px-2 py-1 bg-green-50 rounded-md border border-green-100">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 mr-1 text-green-600">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{t('modals.team.sevenDayGuarantee')}</span>
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <div className="mb-3 flex items-center justify-between bg-gradient-to-r from-blue-100/80 to-indigo-100/50 py-1.5 px-3 rounded-md">
                  <h3 className="font-semibold text-gray-800 text-sm">{t('modals.team.features')}</h3>
                  <span className="bg-blue-100 p-1 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white/80 border border-blue-100 rounded-lg p-2.5 flex flex-col items-center text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-xs font-medium text-gray-800">{t('modals.team.unlimitedProjects')}</span>
                  </div>
                  
                  <div className="bg-white/80 border border-blue-100 rounded-lg p-2.5 flex flex-col items-center text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                    </svg>
                    <span className="text-xs font-medium text-gray-800">{t('modals.team.storage')}</span>
                  </div>
                  
                  <div className="bg-white/80 border border-blue-100 rounded-lg p-2.5 flex flex-col items-center text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-xs font-medium text-gray-800">{t('modals.team.unlimitedMembers')}</span>
                  </div>
                  
                  <div className="bg-white/80 border border-blue-100 rounded-lg p-2.5 flex flex-col items-center text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    </svg>
                    <span className="text-xs font-medium text-gray-800">{t('modals.team.visits')}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Coluna direita: Formulário de pagamento com visual moderno */}
            <div className="md:col-span-1 p-5 bg-gradient-to-b from-white to-gray-50/30 flex flex-col space-y-4 relative z-10 rounded-r-lg overflow-hidden">
              {/* Elementos decorativos */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100/20 to-transparent rounded-bl-[100px]"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-primary/5 to-transparent rounded-tr-[80px]"></div>
              
              {/* Título com badge */}
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium">{t('modals.team.currentMembers', { count: members.length })}</h4>
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-medium px-3 py-1 rounded-full shadow-sm flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Ativação imediata
                </div>
              </div>
              
              {/* Seleção de Ciclo de Cobrança */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3.5 mt-1">
                <Tabs defaultValue="monthly" value={billingCycle} onValueChange={(value) => setBillingCycle(value as "monthly" | "yearly")} className="w-full">
                  <TabsList className="grid grid-cols-2 w-full p-1 h-10 bg-blue-50/70 rounded-lg mb-3">
                    <TabsTrigger value="monthly" className="rounded-md flex items-center justify-center text-sm py-1 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
                      {t('modals.team.monthly')}
                    </TabsTrigger>
                    <TabsTrigger value="yearly" className="rounded-md flex items-center justify-center text-sm py-1 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
                      {t('modals.team.yearly')} <span className="text-xs text-green-600 ml-1 font-medium">(-{empresarialPlanDetails.yearlyDiscount})</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <div className="flex items-center justify-between px-2">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">{t('modals.team.total')} {billingCycle === "monthly" ? t('modals.team.monthly') : t('modals.team.yearly')}</div>
                      <div className="text-xl font-bold text-gray-900">{currencySymbol}{displayPrice}</div>
                    </div>
                    
                    <div className="bg-green-50 border border-green-100 rounded-lg p-1.5 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs text-green-800">{t('modals.team.sevenDayGuarantee')}</span>
                    </div>
                  </div>
                </Tabs>
              </div>
              
              {/* Botão de Pagamento com badge de segurança */}
              <div className="mt-1">
                <Button 
                  onClick={handleUpgradeCheckout} 
                  className="w-full h-11 text-white bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 transition-all shadow-md rounded-lg text-sm font-medium" 
                  disabled={isProcessingPayment}
                >
                  {isProcessingPayment ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('modals.team.processingPayment')}
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      {t('modals.team.upgradeNow')}
                    </>
                  )}
                </Button>
                
                <div className="flex items-center justify-center mt-3 mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-400 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-[11px] text-gray-500">{t('modals.team.securePayment')}</span>
                </div>
              </div>
              
              {paymentError && (
                <div className="p-2 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-xs text-red-600 text-center">{paymentError}</p>
                </div>
              )}
              
              <div className="flex items-center justify-center gap-2 mt-2">
                <img src="/stripe-logo.svg" alt="Stripe" className="h-5 opacity-70" />
              </div>
              
              <p className="text-[10px] text-gray-400 text-center">
                {t('modals.team.termsAgreement')} <Link href="/termos" className="text-gray-500 hover:text-primary">{t('modals.team.terms')}</Link> {t('common.and')} <Link href="/privacidade" className="text-gray-500 hover:text-primary">{t('modals.team.privacy')}</Link>                
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
