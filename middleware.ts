// middleware.ts

import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
// Não precisamos mais importar securityConfig daqui

// Função auxiliar segura para obter a origem do Supabase
function getSupabaseOrigin(): string {
    try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (url) {
            return new URL(url).origin; // ex: https://xyz.supabase.co
        }
    } catch (e) {
        console.error("[Middleware] Erro ao parsear NEXT_PUBLIC_SUPABASE_URL:", e);
    }
    return ''; // Retorna vazio se não conseguir obter
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value; },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // --- Autenticação ---
  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  if (!user && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (user && (pathname === '/login' || pathname === '/signup')) {
     return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // --- Cabeçalhos de Segurança ---
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');

  // --- Content-Security-Policy Definida Diretamente Aqui ---
  const supabaseOrigin = getSupabaseOrigin();
  const cspDirectives = [
      "default-src 'self' blob: data: https:",
      // Inclui Stripe e outros CDNs necessários. RISCO: unsafe-inline/eval
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://cdn.jsdelivr.net https://js.stripe.com",
      // Inclui Google Fonts e inline. RISCO: unsafe-inline
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "font-src 'self' https://fonts.gstatic.com data:",
      // Inclui Stripe API, Supabase (se origin obtida) e outros HTTPS
      `connect-src 'self' https://unpkg.com https://cdn.jsdelivr.net https://api.stripe.com ${supabaseOrigin} https:`.replace(/ +/g, ' ').trim(), // Remove espaço extra se origin for vazia
      // Inclui Stripe e Supabase (se origin obtida) para frames
      `frame-src 'self' blob: data: https://js.stripe.com ${supabaseOrigin}`.replace(/ +/g, ' ').trim(),
      "worker-src 'self' blob: https://cdn.jsdelivr.net",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      // "frame-ancestors 'none'",
      // "upgrade-insecure-requests",
  ];
  const cspString = cspDirectives.join('; ');

  // Aplica a CSP a TODAS as rotas correspondidas pelo matcher
  response.headers.set('Content-Security-Policy', cspString);

  return response;
}

// Configuração do Matcher (mantida)
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
    '/dashboard/:path*',
    '/login',
    '/signup',
  ],
};
