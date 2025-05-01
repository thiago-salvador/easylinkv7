// app/dashboard/page.tsx
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { redirect } from 'next/navigation';
import { Footer } from '@/components/footer';
import { supabaseConfig } from '@/lib/config';
import { DashboardClientContent } from '@/components/dashboard-client-content'; // Importa o novo componente cliente

// Definição de tipo para os dados do ficheiro (mantida)
export interface UserFile {
  id: string;
  original_filename: string;
  file_type: string;
  created_at: string;
  custom_slug: string | null;
}

export default async function DashboardPage() {
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

  // 1. Verificar sessão do utilizador
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/login');
  }

  // 2. Buscar os ficheiros do utilizador logado
  const { data: files, error: filesError } = await supabase
    .from(supabaseConfig.tables.files)
    .select('id, original_filename, file_type, created_at, custom_slug')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Mesmo que haja erro ao buscar ficheiros, renderiza a página com a tabela vazia ou mensagem de erro
  if (filesError) {
    console.error("Erro ao buscar ficheiros do utilizador:", filesError);
    // Passa um array vazio ou trata o erro no componente cliente
  }

  // 3. Renderizar a página do painel
  return (
    <div className="flex min-h-screen flex-col">
      {/* Conteúdo Principal agora é renderizado pelo Componente Cliente */}
      <main className="flex-1 bg-gray-50/50">
        <div className="container mx-auto px-4 py-8 md:py-12">
          {/* Renderiza o componente cliente, passando os dados */}
          <DashboardClientContent files={files || []} />
          {/* A secção de Domínios Personalizados foi removida */}
        </div>
      </main>

      <Footer />
    </div>
  );
}
