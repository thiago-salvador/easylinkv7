// app/api/files/delete/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createAdminClient } from "@/utils/supabase/admin";
import { supabaseConfig } from "@/lib/config";

export async function DELETE(request: NextRequest) {
  console.log("[API Delete File] Iniciando processo de exclusão de arquivo");
  
  // Definir uma função para retornar erro com detalhes
  const returnError = (error: any, status = 500, additionalInfo = {}) => {
    const isConstraintError = error.code === '23503' && error.message.includes('foreign key constraint');
    
    return NextResponse.json({ 
      error: isConstraintError ? 'Erro de restrição de chave estrangeira' : 'Erro ao excluir arquivo',
      details: error.message,
      code: error.code,
      foreignKeyError: isConstraintError,
      ...additionalInfo
    }, { status: isConstraintError ? 409 : status });
  };
  
  try {
    // Obter ID do arquivo da URL
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('id');

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
      console.error("[API Delete File] Erro ao obter usuário autenticado:", getUserError);
      return NextResponse.json({ error: 'Autenticação necessária.' }, { status: 401 });
    }

    // Cliente Admin para operações de banco de dados e storage
    const supabaseAdmin = createAdminClient();

    // 1. Obter informações do arquivo para verificar propriedade e caminho no storage
    const { data: fileData, error: fileError } = await supabaseAdmin
      .from(supabaseConfig.tables.files)
      .select('*')
      .eq('id', fileId)
      .single();

    if (fileError) {
      console.error("[API Delete File] Erro ao buscar arquivo:", fileError);
      return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 });
    }

    // 2. Verificar se o usuário é o proprietário do arquivo
    if (fileData.user_id !== user.id) {
      return NextResponse.json({ error: 'Você não tem permissão para excluir este arquivo' }, { status: 403 });
    }

    // 3. Excluir o arquivo do storage
    try {
      console.log(`[API Delete File] Tentando excluir arquivo do storage: ${fileData.file_path}`);
      const { error: storageError } = await supabaseAdmin
        .storage
        .from(supabaseConfig.storage.buckets.files)
        .remove([fileData.file_path]);

      if (storageError) {
        console.error("[API Delete File] Erro ao excluir arquivo do storage:", storageError);
        // Continuar mesmo com erro no storage, para limpar o banco de dados
        console.warn("[API Delete File] Continuando com a exclusão do registro no banco de dados...");
      } else {
        console.log(`[API Delete File] Arquivo excluído com sucesso do storage: ${fileData.file_path}`);
      }
    } catch (storageDeleteError) {
      console.error("[API Delete File] Erro não tratado ao excluir arquivo do storage:", storageDeleteError);
      // Continuar mesmo com erro no storage, para limpar o banco de dados
      console.warn("[API Delete File] Continuando com a exclusão do registro no banco de dados...");
    }

    // 4. Excluir registros de acesso primeiro, depois o arquivo
    try {
      console.log(`[API Delete File] Tentando excluir registros para o arquivo ID: ${fileId}`);
      
      // Primeiro, excluir os registros de acesso
      console.log(`[API Delete File] Excluindo registros de acesso para o arquivo ID: ${fileId}`);
      
      // Usar o método padrão do Supabase para excluir registros
      const { error: deleteLogsError } = await supabaseAdmin
        .from(supabaseConfig.tables.fileAccessLogs)
        .delete()
        .eq('file_id', fileId);
      
      if (deleteLogsError) {
        console.error("[API Delete File] Erro ao excluir registros de acesso:", deleteLogsError);
        return returnError(deleteLogsError, 500, { context: 'Exclusão de registros de acesso' });
      }
      
      console.log(`[API Delete File] Registros de acesso excluídos com sucesso`);
      
      // Agora excluir o arquivo
      console.log(`[API Delete File] Excluindo arquivo com ID: ${fileId}`);
      const { error: deleteFileError } = await supabaseAdmin
        .from('files')
        .delete()
        .eq('id', fileId);
      
      if (deleteFileError) {
        console.error("[API Delete File] Erro ao excluir arquivo:", deleteFileError);
        return returnError(deleteFileError, 500, { 
          context: 'Exclusão de arquivo',
          hint: deleteFileError.code === '23503' ? 'Há registros de acesso associados a este arquivo que não puderam ser excluídos automaticamente.' : undefined
        });
      }
      
      console.log(`[API Delete File] Arquivo excluído com sucesso`);
      console.log(`[API Delete File] Exclusão completa para o arquivo ID: ${fileId}`);
    
    } catch (dbDeleteError: any) {
      console.error("[API Delete File] Erro não tratado ao excluir registros:", dbDeleteError);
      return returnError(dbDeleteError, 500, { context: 'Erro não tratado na exclusão' });
    }

    // 5. Retornar sucesso
    return NextResponse.json({ 
      success: true, 
      message: 'Arquivo excluído com sucesso',
      fileId: fileId
    });

  } catch (error: any) {
    console.error("[API Delete File] Erro não tratado:", error);
    return returnError(error, 500, { context: 'Erro geral na API' });
  }
}
