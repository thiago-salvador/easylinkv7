// app/layout.tsx
import type React from "react";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ConditionalHeader } from "@/components/conditional-header";
import { LanguageProvider } from "@/lib/language-context";

import { cookies, headers } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// Importação do i18n para inicialização
import "@/i18n";

/**
 * RootLayout - Componente de layout principal da aplicação
 * 
 * Responsabilidades:
 * 1. Fornecer estrutura HTML básica
 * 2. Inicializar providers (tema, idioma)
 * 3. Renderizar o header condicional
 * 4. Gerenciar autenticação via Supabase
 * 5. Tratar rotas especiais como /view/
 */

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EasyLink",
  description: "Faça upload, compartilhe e publique seus arquivos em segundos",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    // Obter cookies e headers
    const cookieStore = cookies();
    const headersList = headers();
    
    // Obter o pathname da requisição atual
    // Usamos várias opções para garantir compatibilidade com diferentes ambientes
    const pathname = headersList.get('x-next-pathname') || 
                    headersList.get('x-invoke-path') || 
                    headersList.get('x-matched-path') || 
                    "";

    // Verificar se estamos em uma rota de visualização
    const isViewRoute = pathname.startsWith('/view/');
    
    // Log apenas em ambiente de desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log(`[RootLayout] Pathname: '${pathname}', isViewRoute: ${isViewRoute}`);
    }

    // Inicializar o cliente Supabase no servidor
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { 
            return cookieStore.get(name)?.value; 
          },
          set(name: string, value: string, options: CookieOptions) {
            try { 
              cookieStore.set({ name, value, ...options }); 
            } catch (error) {
              // Ignorar erros em contextos onde cookies não podem ser setados
              if (process.env.NODE_ENV === 'development') {
                console.warn(`[RootLayout] Erro ao definir cookie ${name}:`, error);
              }
            }
          },
          remove(name: string, options: CookieOptions) {
            try { 
              cookieStore.delete({ name, ...options }); 
            } catch (error) {
              // Ignorar erros em contextos onde cookies não podem ser removidos
              if (process.env.NODE_ENV === 'development') {
                console.warn(`[RootLayout] Erro ao remover cookie ${name}:`, error);
              }
            }
          },
        },
      }
    );
    
    // Obter informações do usuário autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError && process.env.NODE_ENV === 'development') {
      console.error('[RootLayout] Erro na autenticação:', authError.message);
    }

    // Renderização condicional baseada no tipo de rota
    if (isViewRoute) {
      // Para rotas de visualização, renderizar um HTML e Body mínimos,
      // passando o controle total do conteúdo para o app/view/layout.tsx
      return (
        <html lang="pt-BR" suppressHydrationWarning>
          <body className={inter.className}>
            {children}
          </body>
        </html>
      );
    }

    // Layout padrão para todas as outras páginas
    return (
      <html lang="pt-BR" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
            rel="stylesheet"
          />
          <meta httpEquiv="Content-Security-Policy" content="upgrade-insecure-requests" />
        </head>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <LanguageProvider>
              <ConditionalHeader user={user} />
              {children}
            </LanguageProvider>
          </ThemeProvider>
        </body>
      </html>
    );
  } catch (error) {
    // Log do erro apenas em ambiente de desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.error('[RootLayout] Erro não tratado:', error);
    }
    
    // Em caso de erro, renderizar um layout básico sem depender de serviços externos
    return (
      <html lang="pt-BR">
        <body className={inter.className}>
          <div className="min-h-screen flex flex-col">
            {children}
          </div>
        </body>
      </html>
    );
  }
}