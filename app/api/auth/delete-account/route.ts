// app/api/auth/delete-account/route.ts

import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/utils/supabase/admin'; // Importa o cliente admin

export async function POST(request: Request) {
  const cookieStore = cookies();

  // 1. Cria cliente normal para obter o ID do utilizador logado
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

  const { data: { user }, error: getUserError } = await supabase.auth.getUser();

  if (getUserError || !user) {
    console.error("Delete Account API: Utilizador não autenticado ou erro ao obter utilizador.", getUserError);
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const userIdToDelete = user.id;
  console.log(`[API Delete] Tentativa de deletar utilizador ID: ${userIdToDelete}`);

  // 2. Cria cliente ADMIN para realizar a deleção
  try {
    const supabaseAdmin = createAdminClient();
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userIdToDelete);

    if (deleteError) {
      console.error(`[API Delete] Erro ao deletar utilizador ${userIdToDelete} com cliente admin:`, deleteError);
      throw deleteError; // Lança o erro para o catch abaixo
    }

    console.log(`[API Delete] Utilizador ${userIdToDelete} deletado com sucesso.`);

    // 3. Limpar os cookies de sessão (embora o signOut no cliente também faça isso)
    // O signOut no cliente é mais importante após a deleção bem-sucedida.
    // Poderíamos tentar chamar signOut aqui também, mas pode ser redundante.
    // await supabase.auth.signOut(); // Opcional

    return NextResponse.json({ message: 'Conta deletada com sucesso' }, { status: 200 });

  } catch (error: any) {
    console.error(`[API Delete] Erro CATCH ao tentar deletar utilizador ${userIdToDelete}:`, error);
    return NextResponse.json(
        { error: `Falha ao deletar a conta: ${error.message || 'Erro desconhecido'}` },
        { status: 500 }
    );
  }
}
