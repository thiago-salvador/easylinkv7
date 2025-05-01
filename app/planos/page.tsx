"use client";

import { useEffect, useState } from 'react';
import './styles.css';
import { Button } from "@/components/ui/button";
import { Check, AlertTriangle, Loader2 } from "lucide-react";
import { loadStripe } from '@stripe/stripe-js';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { Footer } from '@/components/footer';

// Carrega Stripe com segurança
const stripePromise = typeof window !== "undefined" ? 
  loadStripe(
    // @ts-ignore - Tipagem do Next.js não inclui isso diretamente
    (typeof window !== 'undefined' && window.__NEXT_DATA__?.env?.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) ||
    // @ts-ignore - process só é acessível no servidor
    (typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY : undefined) ||
    'pk_live_51RG71FGLj82qb9P7LvQqCV9f6bwBVbX8KOlrU7SgQRf7SG0Q5Mi0z8fVtKN2Pu1YI5gWOWvgFDCqLs7l1NmiacBk0003nhlMEo'
  ) : 
  Promise.resolve(null);

// Interface para detalhes do plano
interface PlanDetails {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: string;
  features: string[];
  limits: {
    projects: number | 'unlimited';
    storage: string;
    visitors: string;
  };
  priceId: string | null;
}

// Definição dos planos
const plans: PlanDetails[] = [
  {
    id: "free",
    name: "Grátis",
    price: 0,
    currency: "BRL",
    period: "mês",
    features: [],
    limits: {
      projects: 1,
      storage: "3 MB",
      visitors: "5.000/mês",
    },
    priceId: null,
  },
  {
    id: "basic",
    name: "Básico",
    price: 25,
    currency: "BRL",
    period: "mês",
    features: ["Remover marca EasyLink", "Códigos QR", "Analytics integrado"],
    limits: {
      projects: 1,
      storage: "25 MB",
      visitors: "10.000/mês",
    },
    priceId: "price_1RJRqUGLj82qb9P7dzBV02ei",
  },
  {
    id: "pro",
    name: "Pro",
    price: 65,
    currency: "BRL",
    period: "mês",
    features: ["Remover marca EasyLink", "Códigos QR", "Analytics integrado", "Domínios personalizados", "Modo de edição", "Proteção com senha"],
    limits: {
      projects: 5,
      storage: "75 MB",
      visitors: "100.000/mês",
    },
    priceId: "price_1RJRqxGLj82qb9P7WKknOOOq",
  },
  {
    id: "business",
    name: "Empresarial",
    price: 155,
    currency: "BRL",
    period: "mês",
    features: ["Remover marca EasyLink", "Códigos QR", "Analytics integrado", "Domínios personalizados", "Modo de edição", "Proteção com senha", "Modo de feedback", "Captura de emails", "Adicionar membros da equipe"],
    limits: {
      projects: 'unlimited',
      storage: "10 GB",
      visitors: "500.000/mês",
    },
    priceId: "price_1RJRrLGLj82qb9P7gwrVdBOf",
  },
];

// Lista completa de recursos para a tabela comparativa
const allFeatures = [
  { id: "projects", name: "Projetos ativos", type: "limit" },
  { id: "storage", name: "Limite de upload", type: "limit" },
  { id: "visitors", name: "Visitantes", type: "limit" },
  { id: "branding", name: "Remover marca EasyLink", type: "feature" },
  { id: "qr", name: "Códigos QR", type: "feature" },
  { id: "analytics", name: "Analytics integrado", type: "feature" },
  { id: "domains", name: "Domínios personalizados", type: "feature" },
  { id: "edit", name: "Modo de edição", type: "feature" },
  { id: "password", name: "Proteção com senha", type: "feature" },
  { id: "feedback", name: "Modo de feedback", type: "feature" },
  { id: "emails", name: "Captura de emails", type: "feature" },
  { id: "team", name: "Adicionar membros da equipe", type: "feature" },
];

export default function PlansComparison() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [highlightedPlan, setHighlightedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [currency, setCurrency] = useState<"BRL" | "USD">("BRL");
  const router = useRouter();

  // Capturar o parâmetro plan da URL se estiver presente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const planParam = urlParams.get('plan');
      if (planParam) {
        // Guardar o plano que o usuário estava interessado na página inicial
        localStorage.setItem('selectedPlan', planParam);
      }
    }
  }, []);

  // Função para buscar o usuário atual e seu plano
  const fetchUserAndPlan = async () => {
    try {
      // 1. Verificar se o usuário está autenticado
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Sem sessão - usuário não está logado
        router.push('/login?returnTo=/planos');
        return;
      }
      
      // Usuário está logado
      setUser(session.user);
      
      // 2. Buscar o plano atual do usuário (se houver)
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('current_plan')
          .eq('id', session.user.id)
          .single();
        
        if (!profileError && profileData?.current_plan) {
          setCurrentPlan(profileData.current_plan);
        } else {
          console.log('Usando plano free como padrão');
          setCurrentPlan('free');
        }
      } catch (profileErr) {
        console.error('Erro ao buscar plano atual:', profileErr);
        setCurrentPlan('free');
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      setError('Falha ao carregar as informações do usuário');
    } finally {
      // 3. Verificar se há um plano na URL para destacar
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const planParam = urlParams.get('plan');
        
        if (planParam) {
          // Encontrar o ID do plano pelo nome (normalizado)
          const planId = plans.find(p => 
            p.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') === planParam
          )?.id || null;
          
          if (planId) {
            console.log('Destacando plano:', planId);
            setHighlightedPlan(planId);
            
            // Rolar a tela para o plano destacado após um pequeno atraso
            setTimeout(() => {
              const element = document.getElementById(`plan-${planId}`);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }, 500);
          }
        }
      } catch (urlError) {
        console.error('Erro ao processar parâmetros da URL:', urlError);
      }
      
      setIsPageLoading(false);
    }
  };
  
  // Executar a função quando o componente montar
  useEffect(() => {
    fetchUserAndPlan();
  }, []);

  // Função para iniciar o checkout do Stripe
  const handleCheckout = async (planId: string) => {
    if (!user) {
      router.push('/login?returnTo=/planos');
      return;
    }
    
    const plan = plans.find(p => p.id === planId);
    if (!plan || !plan.priceId) {
      setError(`Plano inválido ou indisponível: ${planId}`);
      return;
    }
    
    setIsLoading(planId);
    setError(null);
    
    try {
      // Iniciar checkout com Stripe
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Sistema de pagamento indisponível no momento.");
      }
      
      // Obter a sessão do Supabase para incluir no cabeçalho
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      // Criar sessão de checkout com token de autenticação
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          // Incluir token de autenticação para garantir que a API reconheça o usuário
          'Authorization': `Bearer ${session?.access_token || ''}`
        },
        credentials: 'include', // Importante para incluir cookies
        body: JSON.stringify({ priceId: plan.priceId })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar sessão de checkout');
      }
      
      const { sessionId } = await response.json();
      const result = await stripe.redirectToCheckout({ sessionId });
      
      if (result.error) {
        throw result.error;
      }
    } catch (error: any) {
      setError(error.message || "Ocorreu um erro ao processar o pagamento.");
      console.error("Erro no checkout:", error);
    } finally {
      setIsLoading(null);
    }
  };

  // Renderizar estado de carregamento
  if (isPageLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-lg text-gray-600">Carregando seus planos...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Função para verificar se um recurso está disponível em um plano
  const hasFeature = (planId: string, featureId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return false;
    
    // Verificar limites
    if (featureId === 'projects') {
      return plan.limits.projects;
    }
    if (featureId === 'storage') {
      return plan.limits.storage;
    }
    if (featureId === 'visitors') {
      return plan.limits.visitors;
    }
    
    // Verificar recursos específicos
    switch (featureId) {
      case 'branding': return plan.features.includes("Remover marca EasyLink");
      case 'qr': return plan.features.includes("Códigos QR");
      case 'analytics': return plan.features.includes("Analytics integrado");
      case 'domains': return plan.features.includes("Domínios personalizados");
      case 'edit': return plan.features.includes("Modo de edição");
      case 'password': return plan.features.includes("Proteção com senha");
      case 'feedback': return plan.features.includes("Modo de feedback");
      case 'emails': return plan.features.includes("Captura de emails");
      case 'team': return plan.features.includes("Adicionar membros da equipe");
      default: return false;
    }
  };

  // Função para obter o valor de um limite específico
  const getLimitValue = (planId: string, limitId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return "-";
    
    switch (limitId) {
      case 'projects':
        return plan.limits.projects === 'unlimited' ? 'Ilimitados' : `${plan.limits.projects}`;
      case 'storage':
        return plan.limits.storage;
      case 'visitors':
        return plan.limits.visitors;
      default:
        return "-";
    }
  };

  // Função para renderizar células da tabela
  const renderCell = (planId: string, featureId: string, featureType: string) => {
    if (featureType === 'limit') {
      return (
        <td className={`p-4 text-center border-b border-gray-100 ${planId === currentPlan ? 'bg-blue-50' : ''}`}>
          <span className="font-medium">
            {getLimitValue(planId, featureId)}
          </span>
        </td>
      );
    }
    
    const available = hasFeature(planId, featureId);
    return (
      <td className={`p-4 text-center border-b border-gray-100 ${planId === currentPlan ? 'bg-blue-50' : ''}`}>
        {available ? (
          <div className="flex justify-center">
            <Check className="w-5 h-5 text-green-500" />
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-4 h-0.5 rounded-full bg-gray-300"></div>
          </div>
        )}
      </td>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#F9FAFB] to-white">
      {/* Elementos decorativos */}
      <div className="absolute top-40 left-1/4 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 right-1/4 w-64 h-64 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      
      <main className="flex-1 pt-16 pb-20 relative z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            {/* Badge superior */}
            <div className="inline-block mb-5 px-4 py-1.5 bg-gradient-to-r from-blue-50 to-blue-100 rounded-full">
              <span className="text-primary text-sm font-medium">Escolha o melhor para você</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">Compare os planos</h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              {currentPlan === 'free' 
                ? 'Encontre o plano ideal para seus projetos e necessidades' 
                : <>Seu plano atual é <span className="font-semibold text-primary">{plans.find(p => p.id === currentPlan)?.name || ''}</span></>}
            </p>
            
            <div className="mt-8 px-5 py-4 bg-blue-50/80 text-blue-700 rounded-xl inline-flex items-center border border-blue-100/80 shadow-sm backdrop-blur-sm">
              <div className="bg-blue-100 p-2 rounded-full mr-3 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 16v-4"></path>
                  <path d="M12 8h.01"></path>
                </svg>
              </div>
              <span className="text-blue-800">
                Clique em <strong>Selecionar</strong> no plano desejado para prosseguir com o pagamento via Stripe
              </span>
            </div>
          </div>
          
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span>{error}</span>
            </div>
          )}
          
          {/* Tabela Comparativa de Planos - Visão Desktop */}
          <div className="hidden md:block mb-16 overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-lg">
            <table className="w-full border-collapse comparison-table">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-50/50">
                  <th className="p-6 text-left text-gray-700 font-semibold border-b border-gray-100/70">
                    <div className="text-lg">Recursos</div>
                    <p className="text-xs font-normal text-gray-500 mt-1">Compare todos os recursos disponíveis</p>
                  </th>
                  {plans.map(plan => (
                    <th 
                      key={plan.id}
                      id={`plan-${plan.id}`} 
                      className={`p-6 text-center border-b border-gray-100/70 ${plan.id === highlightedPlan ? 'highlight-plan' : plan.id === currentPlan ? 'bg-blue-50/50' : ''} transition-all duration-500`}
                    >
                      <div className="flex flex-col items-center">
                        {/* Badge do tipo de plano */}
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 ${plan.id === 'pro' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'}`}>
                          {plan.id === 'pro' ? 'Mais Popular' : plan.id === 'free' ? 'Free' : plan.name}
                        </span>
                        
                        <span className="text-xl font-bold text-gray-900 mb-1">{plan.name}</span>
                        
                        <div className="my-3 flex items-baseline justify-center">
                          <span className="text-4xl font-bold price-tag">
                            {Number(plan.price) === 0 ? "" : currency === "BRL" ? "R$" : "$"}{Number(plan.price) === 0 ? "Grátis" : plan.price}
                          </span>
                          {Number(plan.price) > 0 && (
                            <span className="text-gray-500 ml-1 text-sm">/{plan.period}</span>
                          )}
                        </div>
                        <Button
                          onClick={() => handleCheckout(plan.id)}
                          className={`w-full ${plan.id === currentPlan ? 'bg-gray-300 cursor-not-allowed' : plan.id === 'pro' ? 'bg-primary hover:bg-primary/90' : ''}`}
                          disabled={isLoading !== null || plan.id === currentPlan || plan.id === 'free'}
                        >
                          {isLoading === plan.id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processando
                            </>
                          ) : plan.id === currentPlan ? (
                            'Plano Atual'
                          ) : plan.id === 'free' ? (
                            'Grátis'
                          ) : (
                            `Selecionar ${plan.name}`
                          )}
                        </Button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allFeatures.map(feature => (
                  <tr key={feature.id} className="hover:bg-gray-50/80 transition-colors duration-150">
                    <td className="p-5 text-gray-700 font-medium border-b border-gray-100/80">
                      <div className="flex items-center">
                        <div className="bg-blue-50 p-1.5 rounded-md mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-primary">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                        {feature.name}
                      </div>
                    </td>
                    {plans.map(plan => (
                      renderCell(plan.id, feature.id, feature.type)
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Cards de Planos - Visão Mobile */}
          <div className="md:hidden grid grid-cols-1 gap-8 mt-2 px-1">
            {plans.map(plan => (
              <div 
                key={plan.id}
                id={`plan-${plan.id}-mobile`}
                className={`bg-white rounded-2xl overflow-hidden shadow-lg ${plan.id === highlightedPlan ? 'highlight-plan scale-[1.02]' : ''} ${plan.id === currentPlan ? 'ring-2 ring-primary ring-offset-4' : 'border border-gray-100'} transition-all duration-500 hover:shadow-xl`}
              >
                {/* Cabeçalho do card */}
                <div className={`p-6 ${plan.id === 'pro' ? 'bg-gradient-to-br from-primary/10 to-blue-50/80' : 'bg-gray-50'}`}>
                  {/* Badge do tipo de plano */}
                  <div className="flex justify-between items-center mb-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${plan.id === 'pro' ? 'bg-primary/20 text-primary' : 'bg-gray-200 text-gray-700'}`}>
                      {plan.id === 'pro' ? 'Mais Popular' : plan.id === 'free' ? 'Free' : 'Premium'}
                    </span>
                    
                    {plan.id === currentPlan && (
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Plano Atual
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  
                  <div className="flex items-baseline mb-4">
                    <span className={`text-4xl font-bold ${plan.id === 'pro' ? 'price-tag' : 'text-gray-900'}`}>
                      {Number(plan.price) === 0 ? "" : currency === "BRL" ? "R$" : "$"}{Number(plan.price) === 0 ? "Grátis" : plan.price}
                    </span>
                    {Number(plan.price) > 0 && (
                      <span className="text-gray-500 ml-1 text-sm">/{plan.period}</span>
                    )}
                  </div>
                  
                  {/* Garantia de satisfação para planos pagos */}
                  {Number(plan.price) > 0 && (
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 mr-2 text-primary">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-9.618 5.04C2.127 9.504 2 11.138 2 12s.127 2.496.382 4.016C3.873 18.944 7.523 22 12 22s8.127-3.056 9.618-5.984C21.873 14.496 22 12.862 22 12s-.127-2.496-.382-4.016z" />
                      </svg>
                      <span>Garantia de 7 dias</span>
                    </div>
                  )}
                  
                  <Button
                    onClick={() => handleCheckout(plan.id)}
                    className={`w-full shadow-sm ${plan.id === currentPlan ? 'bg-gray-300 cursor-not-allowed' : plan.id === 'pro' ? 'bg-primary hover:bg-primary/90' : ''}`}
                    disabled={isLoading !== null || plan.id === currentPlan || plan.id === 'free'}
                  >
                    {isLoading === plan.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processando
                      </>
                    ) : plan.id === currentPlan ? (
                      'Plano Atual'
                    ) : plan.id === 'free' ? (
                      'Grátis'
                    ) : (
                      `Selecionar ${plan.name}`
                    )}
                  </Button>
                </div>
                
                <div className="p-6 bg-white">
                  <div className="flex items-center gap-2 mb-5">
                    <span className="w-1.5 h-5 bg-gradient-to-b from-primary to-blue-400 rounded-full"></span>
                    <h4 className="font-semibold text-gray-800">Recursos incluídos</h4>
                  </div>
                  
                  <ul className="space-y-4">
                    <li className="feature-item">
                      <div className="feature-icon bg-blue-50 text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                        </svg>
                      </div>
                      <div>
                        <span className="feature-value">{getLimitValue(plan.id, 'projects')}</span>
                        <span className="feature-text">projetos ativos</span>
                      </div>
                    </li>
                    
                    <li className="feature-item">
                      <div className="feature-icon bg-emerald-50 text-emerald-500">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="7 10 12 15 17 10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                      </div>
                      <div>
                        <span className="feature-value">{getLimitValue(plan.id, 'storage')}</span>
                        <span className="feature-text">limite de upload</span>
                      </div>
                    </li>
                    
                    <li className="feature-item">
                      <div className="feature-icon bg-violet-50 text-violet-500">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                        </svg>
                      </div>
                      <div>
                        <span className="feature-value">{getLimitValue(plan.id, 'domains')}</span>
                        <span className="feature-text">domínios personalizados</span>
                      </div>
                    </li>
                    
                    {/* Mostrar apenas recursos incluídos no plano */}
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="flex-shrink-0 mt-1">
                          <Check className="h-4 w-4 text-green-500" />
                        </span>
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Todos os planos incluem SSL, uptime de 99,9% e suporte via email.
            </p>
            <p className="text-gray-500 text-sm">
              Precisa de mais? Entre em contato para um plano personalizado.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
