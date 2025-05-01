// app/api/auth/logout/route.ts

import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.delete({ name, ...options });
        },
      },
    }
  );

  // Faz logout no Supabase (invalida a sessão do lado do servidor)
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Logout Error:', error);
    return NextResponse.json(
        { error: 'Não foi possível fazer logout.' },
        { status: 500 }
    );
  }

  // Os cookies de autenticação são removidos automaticamente pelo helper
  // Redireciona para a página inicial após o logout
  // O status 302 (Found) é mais apropriado para redirecionamentos temporários pós-ação
  return NextResponse.redirect(requestUrl.origin, {
    status: 302,
  });
}
