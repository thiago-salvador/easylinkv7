// components/upgrade-modal.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, X as CloseIcon, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { loadStripe } from '@stripe/stripe-js';
import { createClient } from '@/utils/supabase/client';
import { useLanguage } from "@/lib/language-context";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan?: string;
}

// --- Dados dos Planos (Copiar/Colar ou Importar de um local compartilhado) ---
// IMPORTANTE: Substitua os priceId pelos IDs REAIS do seu painel Stripe!
const getPlansData = (currency: "BRL" | "USD") => [
 {
    name: "Básico",
    description: "Perfeito para um único link profissional",
    price: currency === "BRL" ? "25" : "5",
    period: "/mês",
    yearlyBilled: currency === "BRL" ? "Cobrado R$300 /ano" : "Billed $60 /year",
    ctaText: "Selecionar Básico",
    features: ["1 projeto ativo", "25 MB upload (projeto)", "10.000 visitantes /mês"],
    additionalFeatures: ["Remover marca EasyLink", "Códigos QR", "Analytics integrado"],
    popular: false,
    priceId: currency === "BRL" ? "price_1RJRqUGLj82qb9P7dzBV02ei" : "price_1RJRqUGLj82qb9P7dzBV02ei",
  },
  {
    name: "Pro",
    description: "Ótimo para indivíduos e pequenos projetos",
    price: currency === "BRL" ? "65" : "13",
    period: "/mês",
    yearlyBilled: currency === "BRL" ? "Cobrado R$780 /ano" : "Billed $156 /year",
    ctaText: "Selecionar Pro",
    features: ["5 projetos ativos", "75 MB upload (projeto)", "100.000 visitantes /mês"],
    additionalFeatures: ["Tudo no plano Básico", "Domínios personalizados", "Modo de edição", "Proteção com senha"],
    popular: true,
    priceId: currency === "BRL" ? "price_1RJRqxGLj82qb9P7WKknOOOq" : "price_1RJRqxGLj82qb9P7WKknOOOq",
  },
  {
    name: "Empresarial",
    description: "Para freelancers, agências e empresas",
    price: currency === "BRL" ? "155" : "31",
    period: "/mês",
    yearlyBilled: currency === "BRL" ? "R$1.860 /ano" : "Billed $372 /year",
    ctaText: "Selecionar Empresarial",
    features: ["Projetos ativos ilimitados", "10 GB limite de conta", "500.000 visitantes /mês"],
    additionalFeatures: ["Tudo no plano Pro", "Modo de feedback", "Captura de emails", "Adicionar membros da equipe"],
    popular: false,
    priceId: currency === "BRL" ? "price_1RJRrLGLj82qb9P7gwrVdBOf" : "price_1RJRrLGLj82qb9P7gwrVdBOf",
  },
];

export function UpgradeModal({ open, onOpenChange, currentPlan = "Gratuito" }: UpgradeModalProps) {
  const { t } = useLanguage();
  const [currency, setCurrency] = useState<"BRL" | "USD">("BRL");
  const [isLoading, setIsLoading] = useState<string | null>(null); // Guarda o ID do plano sendo carregado
  const [error, setError] = useState<string | null>(null);
  const plans = getPlansData(currency);

    // Estado para armazenar os dados do usuário atual
  const [userData, setUserData] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(true);
  
  // Buscar dados do usuário ao montar o componente
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setUserLoading(true);
        const supabase = createClient();
        
        // Verificar autenticação
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          console.error('Usuário não autenticado');
          setError(t('modals.upgrade.needLogin'));
          setUserLoading(false);
          return;
        }
        
        // Buscar perfil do usuário
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Erro ao buscar perfil:', profileError.message);
          setError(`Erro ao buscar dados do perfil: ${profileError.message}`);
        } else if (profile) {
          console.log('Perfil carregado:', profile);
          setUserData({
            ...session.user,
            profile
          });
        } else {
          // Perfil não encontrado
          console.log('Perfil não encontrado para o usuário, assumindo plano free.');
          setUserData({
            ...session.user,
            profile: null
          });
        }
      } catch (err: any) {
        console.error('Erro ao carregar dados do usuário:', err);
        setError('Erro ao carregar seus dados. Tente novamente.');
      } finally {
        setUserLoading(false);
      }
    };
    
    if (open) {
      fetchUserData();
    }
  }, [open]);
  
  // Função para processar o checkout
  const handleCheckout = async (priceId: string | null, planName: string) => {
    if (!priceId) {
      setError(`Preço não disponível para o plano ${planName}.`);
      return;
    }
    
    setIsLoading(planName);
    setError(null);
    
    try {
      // Verificar se o usuário está autenticado
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Você precisa estar logado para fazer upgrade do plano.');
      }
      
      // Criar sessão de checkout no Stripe
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          priceId,
          planType: planName.toLowerCase(),
          returnUrl: `${window.location.origin}/dashboard?success=true&plan=${planName.toLowerCase()}`
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar sessão de checkout');
      }
      
      const { sessionId } = await response.json();
      
      if (!sessionId) {
        throw new Error('Não foi possível criar a sessão de checkout.');
      }
      
      // Redirecionar para o checkout do Stripe
      const stripe = await loadStripe("pk_test_51RJRpSGLj82qb9P7Jt2Qm4xhYFTbWmXCHJRGvkPGVXNJKxuXtGSQKkpBELMnAQXPXpPYxXTRNJkKBZOXkZbQJNSL00kpZGLTGF");
      
      if (!stripe) {
        throw new Error('Erro ao carregar Stripe.');
      }
      
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId
      });
      
      if (stripeError) {
        throw new Error(stripeError.message);
      }
      
    } catch (error: any) {
      console.error('Erro no checkout:', error);
      setError(error.message || "Ocorreu um erro no checkout. Tente novamente.");
      setIsLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl p-0 overflow-y-auto max-h-[90vh]">
        <DialogHeader className="p-6 pb-4 sticky top-0 bg-background z-10 border-b">
          <DialogTitle className="text-center text-xl md:text-2xl">{t('modals.upgrade.title')}</DialogTitle>
          <DialogDescription className="text-center pt-2">
            {userLoading ? (
              t('modals.upgrade.loading')
            ) : userData ? (
              <>Seu plano atual: <span className="font-medium">{userData.profile?.current_plan || "Gratuito"}</span></>
            ) : (
              t('modals.upgrade.selectPlan')
            )}
          </DialogDescription>
          <DialogClose asChild>
             <Button variant="ghost" size="icon" className="absolute right-4 top-4 rounded-sm opacity-70">
               <CloseIcon className="h-4 w-4" />
               <span className="sr-only">Fechar</span>
             </Button>
           </DialogClose>
           {/* Seletor de Moeda */}
           <div className="flex justify-center pt-4">
             <Button variant="outline" size="sm" className="flex items-center gap-1.5 text-xs" onClick={() => setCurrency(currency === "BRL" ? "USD" : "BRL")}>
               {currency === "BRL" ? "R$ (BRL)" : "$ (USD)"}
               <ChevronDown className="w-3 h-3" />
             </Button>
           </div>
        </DialogHeader>

        {/* Mensagem de Erro Global */}
        {error && (
            <div className="px-6 md:px-8 pt-2">
                <p className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200 text-center flex items-center justify-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  {error}
                </p>
            </div>
        )}
        
        {/* Status do usuário */}
        {userLoading ? (
          <div className="px-6 md:px-8 pt-4">
            <div className="flex items-center justify-center p-3 bg-gray-50 rounded-md border border-gray-200">
              <Loader2 className="h-4 w-4 mr-2 animate-spin text-gray-500" />
              <span className="text-sm text-gray-600">Verificando seu perfil...</span>
            </div>
          </div>
        ) : !userData ? (
          <div className="px-6 md:px-8 pt-4">
            <div className="flex items-center justify-center p-3 bg-amber-50 rounded-md border border-amber-200">
              <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
              <span className="text-sm text-amber-700">Você precisa estar logado para fazer upgrade.</span>
            </div>
          </div>
        ) : null}

        {/* Conteúdo do Modal - Planos */}
        <div className="px-6 py-4 md:px-8 md:py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "border rounded-lg p-6 flex flex-col relative",
                plan.popular ? "border-primary shadow-lg" : "border-border",
                userData?.profile?.current_plan && plan.name.toLowerCase() === userData.profile.current_plan.toLowerCase() ? 
                  "bg-green-50 border-green-200" : "bg-card"
              )}
            >
              {plan.popular && ( 
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#9333EA] to-[#7C3AED] text-white px-3 py-0.5 rounded-full text-xs font-semibold shadow-md">{t('modals.upgrade.mostPopular')}</div> 
              )}
              
              {userData?.profile?.current_plan && plan.name.toLowerCase() === userData.profile.current_plan.toLowerCase() && (
                <div className="absolute -top-3 right-3 bg-green-500 text-white px-3 py-0.5 rounded-full text-xs font-semibold shadow-md flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  <span>{t('modals.upgrade.currentPlan')}</span>
                </div>
              )}
              <h3 className={cn("text-xl font-semibold mb-2 text-center", plan.popular ? 'mt-4' : '')}>{plan.name}</h3>
              <p className="text-center mb-4"><span className="text-3xl font-bold">{currency === "BRL" ? "R$" : "$"}{plan.price}</span><span className="text-sm text-muted-foreground">{plan.period}</span></p>
              <p className="text-xs text-muted-foreground mb-4 text-center">{plan.yearlyBilled}</p>
              <p className="text-sm text-muted-foreground mb-6 text-center flex-grow min-h-[40px]">{plan.description}</p>
              <ul className="space-y-2 mb-4 text-sm">
                {plan.features.map((feature, index) => ( <li key={index} className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" /><span>{feature}</span></li> ))}
              </ul>
               {plan.additionalFeatures.length > 0 && (
                 <ul className="space-y-2 mb-6 text-sm border-t pt-4 mt-4">
                    {plan.additionalFeatures.map((feature, index) => ( <li key={index} className="flex items-center"><Check className="h-4 w-4 mr-2 text-primary/80 flex-shrink-0" /><span className="text-muted-foreground">{feature}</span></li> ))}
                 </ul>
               )}
              <Button
                onClick={() => handleCheckout(plan.priceId, plan.name)}
                variant={plan.popular ? 'default' : 'outline'}
                disabled={isLoading !== null || 
                          userLoading || 
                          (userData?.profile?.current_plan && 
                           plan.name.toLowerCase() === userData.profile.current_plan.toLowerCase())}
                className={cn("w-full mt-auto", plan.popular ? "bg-gradient-to-r from-[#9333EA] to-[#7C3AED] text-white hover:opacity-90" : "")}
              >
                {isLoading === plan.name ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span>{t('modals.upgrade.processing')}</span>
                  </>
                ) : userData?.profile?.current_plan && 
                   plan.name.toLowerCase() === userData.profile.current_plan.toLowerCase() ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    <span>{t('modals.upgrade.currentPlan')}</span>
                  </>
                ) : (
                  plan.ctaText
                )}
              </Button>
            </div>
          ))}
        </div>
         <DialogFooter className="p-6 pt-2 border-t">
             <p className="text-xs text-muted-foreground text-center w-full">{t('modals.upgrade.moneyBackGuarantee')}</p>
         </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
