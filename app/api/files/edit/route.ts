// app/api/files/edit/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createAdminClient } from "@/utils/supabase/admin";
import { supabaseConfig } from "@/lib/config";

export async function PUT(request: NextRequest) {
  try {
    // Obter dados da requisição
    const data = await request.json();
    const { fileId, customSlug } = data;

    if (!fileId) {
      return NextResponse.json({ error: 'ID do arquivo não fornecido' }, { status: 400 });
    }

    // Autenticação do usuário
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

    // Verificar se o usuário está autenticado
    const { data: { user }, error: getUserError } = await supabase.auth.getUser();
    if (getUserError || !user) {
      console.error("[API Edit File] Erro ao obter usuário autenticado:", getUserError);
      return NextResponse.json({ error: 'Autenticação necessária.' }, { status: 401 });
    }

    // Cliente Admin para operações de banco de dados
    const supabaseAdmin = createAdminClient();

    // 1. Obter informações do arquivo para verificar propriedade
    const { data: fileData, error: fileError } = await supabaseAdmin
      .from(supabaseConfig.tables.files)
      .select('*')
      .eq('id', fileId)
      .single();

    if (fileError) {
      console.error("[API Edit File] Erro ao buscar arquivo:", fileError);
      return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 });
    }

    // 2. Verificar se o usuário é o proprietário do arquivo
    if (fileData.user_id !== user.id) {
      return NextResponse.json({ error: 'Você não tem permissão para editar este arquivo' }, { status: 403 });
    }

    // 3. Verificar se o slug personalizado já existe (se fornecido)
    if (customSlug) {
      // Sanitizar o slug (permitir apenas letras, números, hífens e underscores)
      const sanitizedSlug = customSlug.trim().replace(/[^a-zA-Z0-9-_]/g, '');
      
      if (!sanitizedSlug) {
        return NextResponse.json({ error: 'Slug personalizado inválido' }, { status: 400 });
      }
      
      // Verificar se o slug já está em uso por outro arquivo
      const { data: existingFile, error: slugCheckError } = await supabaseAdmin
        .from(supabaseConfig.tables.files)
        .select('id')
        .eq('custom_slug', sanitizedSlug)
        .neq('id', fileId) // Excluir o arquivo atual da verificação
        .maybeSingle();
        
      if (slugCheckError) {
        console.error("[API Edit File] Erro ao verificar slug:", slugCheckError);
        return NextResponse.json({ error: 'Erro ao verificar disponibilidade do slug' }, { status: 500 });
      }
      
      if (existingFile) {
        return NextResponse.json({ error: 'Este link personalizado já está em uso' }, { status: 409 });
      }
      
      // 4. Atualizar o arquivo com o novo slug
      const { error: updateError } = await supabaseAdmin
        .from(supabaseConfig.tables.files)
        .update({ custom_slug: sanitizedSlug })
        .eq('id', fileId);
        
      if (updateError) {
        console.error("[API Edit File] Erro ao atualizar arquivo:", updateError);
        return NextResponse.json({ 
          error: 'Erro ao atualizar arquivo',
          details: updateError.message
        }, { status: 500 });
      }
      
      // 5. Retornar o arquivo atualizado
      const { data: updatedFile, error: getUpdatedError } = await supabaseAdmin
        .from(supabaseConfig.tables.files)
        .select('*')
        .eq('id', fileId)
        .single();
        
      if (getUpdatedError) {
        console.error("[API Edit File] Erro ao obter arquivo atualizado:", getUpdatedError);
        return NextResponse.json({ 
          success: true,
          message: 'Arquivo atualizado com sucesso, mas não foi possível retornar os dados atualizados',
          fileId: fileId
        });
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Arquivo atualizado com sucesso',
        file: updatedFile
      });
    } else {
      // Se não foi fornecido um novo slug, apenas retornar os dados atuais do arquivo
      return NextResponse.json({ 
        success: true, 
        message: 'Nenhuma alteração realizada',
        file: fileData
      });
    }
  } catch (error: any) {
    console.error("[API Edit File] Erro não tratado:", error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error.message
    }, { status: 500 });
  }
}
