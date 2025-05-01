// app/api/create-checkout-session/route.ts

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import Stripe from 'stripe';

// Ler a chave secreta do ambiente
const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || '', 
  { 
    apiVersion: '2023-10-16' as Stripe.LatestApiVersion, 
    typescript: true
  }
);

export async function POST(request: Request) {
  console.log("Iniciando POST /api/create-checkout-session");
  
  // Inicializar Supabase usando a função importada
  const cookieStore = cookies(); // <- Obter o cookieStore
  const supabase = createClient(cookieStore); // <- Passar cookieStore para createClient
  
  // Extrair dados da requisição
  let priceId: string;
  let returnUrl: string;
  let planType: string;
  
  try {
    const body = await request.json();
    priceId = body.priceId;
    returnUrl = body.returnUrl || 'http://localhost:3000/dashboard';
    planType = body.planType || 'free';
    
    if (!priceId) {
      throw new Error("Price ID é obrigatório");
    }
  } catch (e) {
    console.error("Erro ao processar corpo da requisição:", e);
    return NextResponse.json({ error: 'Pedido inválido: dados incompletos.' }, { status: 400 });
  }
  
  // Verificar autenticação
  try {
    // Tentar autenticação via token Bearer
    let authToken = request.headers.get('Authorization');
    let user: any = null;
    
    if (authToken && authToken.startsWith('Bearer ')) {
      authToken = authToken.substring(7); // Remove 'Bearer '
      
      const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(authToken);
      
      if (tokenUser && !tokenError) {
        console.log(`Usuário autenticado via token: ${tokenUser.id}`);
        user = tokenUser;
      } else {
        console.log("Token inválido ou expirado");
      }
    } else {
      console.log("Nenhum token Bearer fornecido");
    }
    
    // Se não conseguiu autenticar
    if (!user) {
      console.log("Autenticação falhou");
      return NextResponse.json({ error: 'Autenticação necessária.' }, { status: 401 });
    }
    
    // Processar checkout
    // 1. Verificar perfil existente
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, stripe_customer_id, current_plan')
      .eq('id', user.id)
      .single();
    
    // Variável para armazenar o stripe_customer_id do usuário
    let stripeCustomerId = '';
    
    // 2. Criar perfil se não existir
    if (profileError && profileError.message.includes('No rows')) {
      console.log(`Criando perfil para usuário ${user.id}...`);
      
      const { error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || '',
          avatar_url: user.user_metadata?.avatar_url || '',
          current_plan: 'free',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (createError) {
        console.error("Erro ao criar perfil:", createError);
        return NextResponse.json({ error: 'Erro ao criar perfil de usuário.' }, { status: 500 });
      }
    } else if (profileError) {
      // Outro erro ao buscar perfil
      console.error("Erro ao buscar perfil:", profileError);
      return NextResponse.json({ error: 'Erro ao acessar dados do usuário.' }, { status: 500 });
    } else {
      // Perfil existe, usar o stripe_customer_id existente
      stripeCustomerId = profile.stripe_customer_id || '';
    }
    
    // 3. Criar uma sessão do Stripe
    try {
      // Parâmetros básicos da sessão
      const params: Stripe.Checkout.SessionCreateParams = {
        payment_method_types: ['card'],
        line_items: [{
          price: priceId,
          quantity: 1,
        }],
        mode: 'subscription',
        success_url: returnUrl || 'http://localhost:3000/dashboard?success=true',
        cancel_url: 'http://localhost:3000/dashboard?canceled=true',
      };
      
      // Adicionar cliente existente ou usar email para criar novo
      if (stripeCustomerId) {
        params.customer = stripeCustomerId;
      } else {
        params.customer_email = user.email;
      }
      
      // Criar sessão
      const session = await stripe.checkout.sessions.create(params);
      
      console.log(`Sessão Stripe criada com sucesso: ${session.id}`);
      
      // Retornar o ID da sessão
      return NextResponse.json({ sessionId: session.id });
      
    } catch (stripeError: any) {
      console.error("Erro ao criar sessão no Stripe:", stripeError);
      return NextResponse.json(
        { error: `Erro ao processar pagamento: ${stripeError.message || 'Erro desconhecido'}` }, 
        { status: 500 }
      );
    }
    
  } catch (error: any) {
    console.error("Erro não tratado:", error);
    return NextResponse.json(
      { error: `Erro interno do servidor: ${error.message || 'Erro desconhecido'}` }, 
      { status: 500 }
    );
  }
}
