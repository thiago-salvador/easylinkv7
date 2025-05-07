// middleware.ts

import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// Função auxiliar segura para obter a origem do Supabase
function getSupabaseOrigin(): string {
    try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (!url) {
            throw new Error('NEXT_PUBLIC_SUPABASE_URL não está definido');
        }
        return new URL(url).origin; // ex: https://xyz.supabase.co
    } catch (e) {
        console.error("[Middleware] Erro ao obter origem do Supabase:", e);
        // Retorna vazio em caso de erro, mas isso não deve acontecer em produção
        return '';
    }
}

export async function middleware(request: NextRequest) {
  try {
    let response = NextResponse.next({
      request: { headers: request.headers },
    });

    // Adiciona o pathname atual como um header para uso no RootLayout
    const pathname = request.nextUrl.pathname;
    request.headers.set('x-next-pathname', pathname);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return request.cookies.get(name)?.value; },
          set(name: string, value: string, options: CookieOptions) {
            try {
              request.cookies.set({ name, value, ...options });
              response = NextResponse.next({ request: { headers: request.headers } });
              response.cookies.set({ name, value, ...options });
            } catch (error) {
              console.error(`[Middleware] Erro ao definir cookie ${name}:`, error);
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              request.cookies.set({ name, value: '', ...options });
              response = NextResponse.next({ request: { headers: request.headers } });
              response.cookies.set({ name, value: '', ...options });
            } catch (error) {
              console.error(`[Middleware] Erro ao remover cookie ${name}:`, error);
            }
          },
        },
      }
    );

    // --- Autenticação ---
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('[Middleware] Erro na autenticação:', authError.message);
    }

    // Redirecionamentos baseados na autenticação
    if (!user && pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (user && (pathname === '/login' || pathname === '/signup')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // --- Cabeçalhos de Segurança ---
    // Aplicamos estes cabeçalhos aqui para garantir que todas as rotas os tenham,
    // mesmo que o next.config.mjs também defina alguns deles
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');

    // Não definimos CSP aqui para evitar conflitos com o next.config.mjs
    // A CSP já está definida no next.config.mjs e é mais completa

    return response;
  } catch (error) {
    console.error('[Middleware] Erro não tratado:', error);
    // Em caso de erro, continuamos com a requisição original
    return NextResponse.next();
  }
}

// Configuração do Matcher - Adicionando rotas de visualização para autenticação
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
    '/dashboard/:path*',
    '/login',
    '/signup',
    '/view/:path*', // Adicionando rotas de visualização para passar o pathname
  ],
};
