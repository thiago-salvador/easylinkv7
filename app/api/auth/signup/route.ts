// app/api/auth/signup/route.ts

import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  let jsonData;
  try {
      // Ler os dados como JSON
      jsonData = await request.json();
  } catch (e) {
      return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
  }

  const email = String(jsonData.email);
  const password = String(jsonData.password);
  const name = String(jsonData.name || ''); // Obtém o nome (opcional, default vazio)
  const cookieStore = cookies();

  // Validações básicas (pode adicionar mais)
  if (!email || !password) {
      return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 });
  }
   if (password.length < 6) {
      return NextResponse.json({ error: 'Senha deve ter pelo menos 6 caracteres' }, { status: 400 });
  }

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

  // Tenta criar o utilizador com email, senha e metadados (nome)
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Guarda o nome em raw_user_meta_data na tabela auth.users
      data: {
        full_name: name, // Ou apenas 'name', como preferir
        // Pode adicionar outros dados aqui se necessário
      },
      emailRedirectTo: `${requestUrl.origin}/api/auth/callback`, // URL de confirmação
    },
  });

  if (error) {
    console.error('Signup API Error:', error);
    // Retorna uma mensagem mais específica se possível, senão genérica
    let errorMessage = 'Não foi possível registar o utilizador.';
    if (error.message.includes('User already registered')) {
        errorMessage = 'Este email já está registado.';
    } else if (error.message.includes('Password should be at least 6 characters')) {
         errorMessage = 'Senha deve ter pelo menos 6 caracteres.';
    }
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }

  // Sucesso
  return NextResponse.json(
    { message: 'Registo iniciado! Verifique o seu email para confirmação.' },
    { status: 200 }
  );
}
