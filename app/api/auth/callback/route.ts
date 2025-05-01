// app/api/auth/callback/route.ts

import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Esta rota é chamada pelo Supabase após um login bem-sucedido
// (especialmente com OAuth ou confirmação de email) ou quando a sessão precisa ser estabelecida
// usando um código de autorização (fluxo PKCE).
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // Se 'next' estiver nos parâmetros de busca, use-o para redirecionar após o login
  const next = searchParams.get('next') ?? '/dashboard'; // Redireciona para dashboard por padrão

  console.log(`[Auth Callback] Recebido código: ${code ? 'Sim' : 'Não'}, next: ${next}`);

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value; },
          set(name: string, value: string, options: CookieOptions) { cookieStore.set({ name, value, ...options }); },
          remove(name: string, options: CookieOptions) { cookieStore.delete({ name, ...options }); },
        },
      }
    );
    // Troca o código por uma sessão
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      console.log(`[Auth Callback] Código trocado por sessão com sucesso. Redirecionando para: ${next}`);
      // Redireciona para a página desejada (ex: dashboard) APÓS definir os cookies da sessão
      return NextResponse.redirect(`${origin}${next}`);
    } else {
       console.error("[Auth Callback] Erro ao trocar código por sessão:", error);
       // Redirecionar para uma página de erro ou login em caso de falha
       return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
    }
  } else {
     console.warn("[Auth Callback] Nenhum código encontrado na URL.");
     // Redirecionar para uma página de erro ou login se nenhum código for encontrado
     return NextResponse.redirect(`${origin}/login?error=no_code_received`);
  }
}

