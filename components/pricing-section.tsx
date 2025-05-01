// components/pricing-section.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, Monitor, HardDrive, Users, Zap, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { loadStripe } from '@stripe/stripe-js';

// Removemos a integração do Stripe para evitar erros de configuração
// e usar uma versão simplificada para prototipação

// Definição dos planos com IDs de Preço do Stripe
const getPlansData = (currency: "BRL" | "USD") => [
 {
    name: "Grátis", description: "Experimente e compartilhe um projeto rapidamente", price: currency === "BRL" ? "0" : "0", period: "mês", yearlyBilled: currency === "BRL" ? "R$0 /ano" : "$0 /year", ctaText: "Comece agora",
    features: ["1 projeto ativo", "3 MB limite de upload/projeto", "(0.5mb limite de PDF)", "5.000 visitantes /mês"], additionalFeatures: [], popular: false, priceId: null,
  },
  {
    name: "Básico", description: "Perfeito para um único link profissional", price: currency === "BRL" ? "25" : "5", period: "mês", yearlyBilled: currency === "BRL" ? "Cobrado R$300 /ano" : "Billed $60 /year", ctaText: "Selecionar Básico",
    features: ["1 projeto ativo", "25 MB limite de upload/projeto", "10.000 visitantes /mês"], additionalFeatures: ["Remover marca EasyLink", "Códigos QR", "Analytics integrado"], popular: false,
    priceId: currency === "BRL" ? "price_1RJRqUGLj82qb9P7dzBV02ei" : "price_SUBSTITUA_BASICO_USD_MENSAL",
  },
  {
    name: "Pro", description: "Ótimo para indivíduos e pequenos projetos", price: currency === "BRL" ? "65" : "13", period: "mês", yearlyBilled: currency === "BRL" ? "Cobrado R$780 /ano" : "Billed $156 /year", ctaText: "Selecionar Pro",
    features: ["5 projetos ativos", "75 MB limite de upload/projeto", "100.000 visitantes /mês"], additionalFeatures: ["Tudo no plano Básico", "Domínios personalizados", "Modo de edição", "Proteção com senha"], popular: true,
    priceId: currency === "BRL" ? "price_1RJRqxGLj82qb9P7WKknOOOq" : "price_SUBSTITUA_PRO_USD_MENSAL",
  },
  {
    name: "Empresarial", description: "Para freelancers, agências e empresas", price: currency === "BRL" ? "155" : "31", period: "mês", yearlyBilled: currency === "BRL" ? "Cobrado R$1.860 /ano" : "Billed $372 /year", ctaText: "Selecionar Empresarial",
    features: ["Projetos ativos ilimitados", "10 GB limite de conta", "500.000 visitantes /mês"], additionalFeatures: ["Tudo no plano Pro", "Modo de feedback", "Captura de emails", "Adicionar membros da equipe"], popular: false,
    priceId: currency === "BRL" ? "price_1RJRrLGLj82qb9P7gwrVdBOf" : "price_SUBSTITUA_EMP_USD_MENSAL",
  },
];


export function PricingSection() {
  const [currency, setCurrency] = useState<"BRL" | "USD">("BRL");
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const plans = getPlansData(currency);
  const router = useRouter();

  useEffect(() => {
    // Buscar usuário autenticado
    const fetchUser = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
        }
      } catch (error) {
        console.error("Erro ao obter sessão:", error);
      }
    };
    
    fetchUser();
  }, []);

  const handleCheckout = async (priceId: string | null, planName: string) => {
    if (!priceId) {
      // Plano grátis ou plano sem ID definido
      if (planName === "Grátis") {
        router.push("/signup?plan=free");
        return;
      }
      setError(`Preço não disponível para o plano ${planName}.`);
      return;
    }

    setIsLoading(planName);
    setError(null);

    try {
      // Buscar o token de autenticação do Supabase
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      // Verificar se o usuário está autenticado
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

  const getButtonText = (planName: string) => {
    if (isLoading === planName) return "Processando...";
    if (planName === "Grátis") return "Comece agora";
    
    // Texto padrão para botões de planos pagos
    return `Selecionar ${planName}`;
  };

  const handleButtonClick = (priceId: string | null, planName: string) => {
    // Se estamos em um processo de carregamento, não faça nada
    if (isLoading) return;
    
    // Normalizar o nome do plano para usar como parâmetro
    const planParam = planName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    // Verificar se o usuário está logado
    if (user) {
      // Já está logado, redirecionar diretamente para a página de comparativo de planos
      router.push(`/planos?plan=${planParam}`);
    } else {
      // Não está logado, redirecionar para a página de login
      // com redirecionamento para a página de comparativo de planos após o login
      router.push(`/login?returnTo=/planos&plan=${planParam}`);
    }
  };

  return (
    <section className="py-16 md:py-24 w-full bg-gradient-to-b from-[#F9FAFB] to-white">
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        {/* Elemento decorativo acima do título */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-br from-blue-100 to-primary/10 rounded-full blur-3xl opacity-70 -z-10"></div>
        
        {/* Header, Seletor Moeda, Erro Global */}
        <div className="text-center mb-16 animate-fadeIn">
          <div className="inline-block mb-4 px-4 py-1.5 bg-gradient-to-r from-blue-50 to-blue-100 rounded-full">
            <span className="text-primary text-sm font-medium">Escolha seu plano</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">Preços transparentes</h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">Encontre o plano perfeito para suas necessidades, sem surpresas</p>
        </div>
        
        <div className="flex justify-center mb-12">
          <div className="bg-white p-1 rounded-full flex items-center shadow-sm border border-gray-100 transition-all duration-300 hover:shadow">
            <button
              onClick={() => setCurrency("BRL")}
              className={`px-5 py-2.5 text-sm font-medium transition-all duration-300 rounded-full ${currency === "BRL" ? "bg-primary text-white shadow-inner" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"}`}
            >
              <span className="flex items-center gap-1.5">
                <span className="font-semibold">R$</span> Real
              </span>
            </button>
            <button
              onClick={() => setCurrency("USD")}
              className={`px-5 py-2.5 text-sm font-medium transition-all duration-300 rounded-full ${currency === "USD" ? "bg-primary text-white shadow-inner" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"}`}
            >
              <span className="flex items-center gap-1.5">
                <span className="font-semibold">$</span> Dólar
              </span>
            </button>
          </div>
        </div>
        
        {error && (
          <div className="mb-8 p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Grid de Planos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 items-stretch">
          {plans.map((plan, index) => {
             // Verifica se os arrays existem ANTES de tentar aceder a length
             const hasFeatures = Array.isArray(plan.features) && plan.features.length > 0;
             const hasAdditionalFeatures = Array.isArray(plan.additionalFeatures) && plan.additionalFeatures.length > 0;

             return (
                <div 
                  key={plan.name} 
                  className={cn(
                    "relative bg-white rounded-2xl overflow-hidden transition-all duration-500 group",
                    plan.popular 
                      ? "shadow-lg ring-4 ring-primary/20 hover:shadow-xl hover:ring-primary/30 hover:transform hover:scale-[1.03]" 
                      : "border border-gray-100 hover:shadow-lg hover:border-transparent hover:transform hover:scale-[1.02]"
                  )}>
                  {/* Fundo decorativo gradiente sutil */}
                  <div className="absolute inset-0 bg-gradient-to-b from-gray-50/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {plan.popular && (
                    <div className="absolute -right-12 top-7 bg-gradient-to-r from-primary to-blue-500 text-white text-xs font-bold py-1.5 px-12 transform rotate-45 shadow-md">
                      Mais Popular
                    </div>
                  )}
                  <div className={cn("p-8 flex flex-col flex-grow relative z-10", plan.popular && "pt-12")}>
                     {/* Etiqueta do tipo de plano */}
                     <div className="flex items-center gap-2 mb-3">
                       <span className={cn(
                         "inline-block px-3 py-1 rounded-full text-xs font-medium",
                         plan.popular
                           ? "bg-primary/10 text-primary"
                           : "bg-gray-100 text-gray-600"
                       )}>
                         {plan.name === "Grátis" ? "Free" : plan.name}
                       </span>
                     </div>
                     
                     {/* Conteúdo Superior */}
                     <div className="flex-grow mb-6">
                       <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                       <p className="text-gray-500 mb-6 min-h-[50px]">{plan.description}</p>
                       
                       <div className="flex items-baseline mb-2">
                         <span className="text-5xl font-bold text-gray-900 tracking-tight">
                           {Number(plan.price) === 0 ? "" : currency === "BRL" ? "R$" : "$"}{Number(plan.price) === 0 ? "Grátis" : plan.price}
                         </span>
                         {Number(plan.price) > 0 && (
                           <span className="text-gray-500 ml-2 text-sm font-medium">/{plan.period}</span>
                         )}
                       </div>
                       
                       {Number(plan.price) > 0 && (
                         <p className="text-sm text-gray-500 mb-8">{plan.yearlyBilled}</p>
                       )}
                     </div>
                     
                     {/* Botão CTA */}
                     <div className="mt-auto">
                       <Button 
                         onClick={() => handleButtonClick(plan.priceId, plan.name)} 
                         className={cn(
                           "w-full py-6 relative overflow-hidden transition-all duration-300 shadow-sm",
                           plan.popular ? 
                             "bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-600 text-white" : 
                             plan.name === "Grátis" ?
                               "bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-900" :
                               "bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-900"
                         )}
                         disabled={isLoading !== null}
                         variant={plan.popular ? "default" : "outline"}
                       >
                         {isLoading === plan.name ? (
                           <>
                             <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                             <span className="font-medium">Processando</span>
                           </>
                         ) : (
                           <span className="font-medium">{getButtonText(plan.name)}</span>
                         )}
                       </Button>
                       
                       {plan.name !== "Grátis" && (
                         <p className="text-xs text-gray-500 mt-3 text-center flex items-center justify-center">
                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 mr-1 text-primary/70">
                             <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                           </svg>
                           Garantia de 14 dias ou seu dinheiro de volta
                         </p>
                       )}
                     </div>
                  </div>

                  {/* Conteúdo Inferior (Features) */}
                  {/* Exibe a seção apenas se houver algum tipo de feature */}
                  {(hasFeatures || hasAdditionalFeatures) ? (
                    <div className="border-t border-gray-100/60 px-8 py-7 bg-gradient-to-b from-gray-50/80 to-transparent relative z-10">
                      <h4 className="text-sm font-medium text-gray-900 mb-5">O que está incluído:</h4>
                      
                      {/* Renderiza features principais */}
                      {hasFeatures && (
                        <ul className="space-y-4 mb-6">
                          {plan.features.map((feature, i) => (
                            <li key={`feat-${i}`} className="flex items-start gap-3">
                              <div className="rounded-full p-0.5 bg-primary/10 mt-0.5 flex-shrink-0">
                                <Check className="w-3.5 h-3.5 text-primary" />
                              </div>
                              <span className="text-gray-700 text-sm leading-tight">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      
                      {/* Renderiza recursos adicionais */}
                      {hasAdditionalFeatures && (
                        <>
                          <div className={cn("mb-3 text-xs font-semibold text-gray-500 tracking-wide", hasFeatures ? "mt-6" : "")}>Recursos adicionais:</div>
                          <ul className="space-y-3">
                            {plan.additionalFeatures.map((feature, i) => (
                              <li key={`addfeat-${i}`} className="flex items-start gap-3">
                                <div className="rounded-full p-0.5 bg-gray-100 mt-0.5 flex-shrink-0">
                                  <Check className="w-3 h-3 text-gray-500" />
                                </div>
                                <span className="text-gray-500 text-sm leading-tight">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  ) : null }
                </div>
             );
          })}
        </div>
      </div>
    </section>
  )
}
