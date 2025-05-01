// app/api/auth/login/route.ts

import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const formData = await request.formData();
  const email = String(formData.get('email'));
  const password = String(formData.get('password'));
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

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Login Error:', error);
    // Retorna erro genérico para o cliente
     return NextResponse.json(
        { error: 'Credenciais inválidas. Verifique o email e a senha.' },
        { status: 400 }
    );
  }

  // Login bem-sucedido, a sessão é definida nos cookies pelo helper
  // O frontend pode redirecionar ou atualizar a UI
  return NextResponse.json(
    { message: 'Login bem-sucedido!' },
    { status: 200 }
  );

  // Alternativa: Redirecionar para o painel após login
  // return NextResponse.redirect(requestUrl.origin, { status: 301 });
}
