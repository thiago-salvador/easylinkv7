// app/api/upload/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { convertPresentationToPDF, processZipFile } from "@/lib/file-conversion";
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createAdminClient } from "@/utils/supabase/admin";
import { supabaseConfig } from "@/lib/config";
import { v4 as uuidv4 } from "uuid";
import path from 'path';

export async function POST(request: NextRequest) {
  // --- Início do Bloco try Principal ---
  try {
    const cookieStore = cookies();

    // Cria cliente Supabase para obter utilizador autenticado
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

    // Obtém utilizador autenticado
    const { data: { user }, error: getUserError } = await supabase.auth.getUser();

    if (getUserError || !user) {
      console.error("[API Upload] Erro ao obter utilizador autenticado ou utilizador não logado:", getUserError);
      return NextResponse.json({ error: 'Autenticação necessária.' }, { status: 401 });
    }
    const authenticatedUserId = user.id;
    const userEmail = user.email; // Pega o email do utilizador autenticado
    console.log(`[API Upload] Utilizador autenticado encontrado: ${authenticatedUserId}, Email: ${userEmail}`);

    // --- Cliente Admin ---
    let supabaseAdmin;
    try {
      supabaseAdmin = createAdminClient();
    } catch (adminClientError) {
      console.error('[API Upload] Erro cliente Supabase Admin:', adminClientError);
      return NextResponse.json({ error: "Erro config Supabase Admin" }, { status: 500 });
    }

    // --- CORREÇÃO: Garantir que o utilizador existe na tabela public.users ---
    try {
        console.log(`[API Upload] Verificando/Criando registo para user ${authenticatedUserId} na tabela public.users`);
        const { data: publicUser, error: findUserError } = await supabaseAdmin
            .from(supabaseConfig.tables.users)
            .select('id')
            .eq('id', authenticatedUserId)
            .maybeSingle(); // Usa maybeSingle para não dar erro se não encontrar

        if (findUserError && findUserError.code !== 'PGRST116') { // Ignora erro 'not found' (PGRST116)
            throw findUserError; // Lança outros erros
        }

        if (!publicUser) {
            console.log(`[API Upload] Utilizador ${authenticatedUserId} não encontrado em public.users, criando...`);
            const { error: insertUserError } = await supabaseAdmin
                .from(supabaseConfig.tables.users)
                .insert({
                    id: authenticatedUserId,
                    email: userEmail, // Usa o email da sessão
                    // Adicione outros campos padrão se necessário (ex: is_anonymous = false)
                });
            if (insertUserError) {
                 console.error(`[API Upload] Erro ao inserir utilizador ${authenticatedUserId} em public.users:`, insertUserError);
                 throw insertUserError; // Lança erro se a inserção falhar
            }
            console.log(`[API Upload] Utilizador ${authenticatedUserId} criado em public.users.`);
        } else {
             console.log(`[API Upload] Utilizador ${authenticatedUserId} já existe em public.users.`);
        }
    } catch (userSyncError: any) {
         console.error("[API Upload] Erro ao sincronizar utilizador com tabela pública:", userSyncError);
         // Decide se quer continuar ou retornar erro. Por segurança, retornamos erro.
         return NextResponse.json({ error: "Erro ao preparar dados do utilizador.", details: userSyncError.message }, { status: 500 });
    }
    // --- FIM DA CORREÇÃO ---


    // Processa FormData
    let formData;
    try { formData = await request.formData(); } catch (e) { /* ... */ return NextResponse.json({ error: 'Erro ao ler dados do formulário.' }, { status: 400 }); }
    const file = formData.get("file") as File;
    const customSlug = formData.get("customSlug") as string || null;
    if (!file) return NextResponse.json({ error: "Nenhum ficheiro encontrado" }, { status: 400 });

    console.log(`[API Upload] Iniciando upload para utilizador ${authenticatedUserId}, Ficheiro: ${file.name}`);

    // Lógica de Bucket (mantida)
    console.log('[API Upload] Verificando bucket...');
    try {
        const { data: bucketsData, error: listError } = await supabaseAdmin.storage.listBuckets();
        if (listError) throw listError;
        const bucketExists = bucketsData.some(b => b.name === supabaseConfig.storage.buckets.files);
        if (!bucketExists) {
            console.log('[API Upload] Criando bucket...');
            const { error: createBucketError } = await supabaseAdmin.storage.createBucket(supabaseConfig.storage.buckets.files, { public: true });
            if (createBucketError) throw createBucketError;
        } else { console.log('[API Upload] Bucket existe.'); }
    } catch (bucketError: any) { /* ... */ return NextResponse.json({ error: `Erro no storage: ${bucketError.message}` }, { status: 500 }); }


    // Lógica de Upload e Conversão (mantida como estava)
    const fileExtension = path.extname(file.name).toLowerCase();
    const uniqueFileNameBase = uuidv4();
    const originalFileNameInStorage = `${uniqueFileNameBase}${fileExtension}`;
    const originalFilePath = `uploads/${authenticatedUserId}/${originalFileNameInStorage}`;
    const bytes = await file.arrayBuffer();
    const originalMimeType = file.type;
    let finalFilePath = originalFilePath;
    let finalFileType = "other";
    let finalMimeType = originalMimeType;

    // 1. Upload Original
    try {
      console.log(`[API Upload] Fazendo upload do ficheiro ORIGINAL para: ${originalFilePath}`);
      const { error: uploadError } = await supabaseAdmin.storage.from(supabaseConfig.storage.buckets.files).upload(originalFilePath, bytes, { contentType: originalMimeType, cacheControl: '3600', upsert: false });
      if (uploadError) throw uploadError;
      console.log(`[API Upload] Upload original concluído para ${originalFilePath}`);
    } catch (uploadErr: any) { /* ... */ return NextResponse.json({ error: `Erro ao fazer upload inicial: ${uploadErr.message}` }, { status: 500 }); }

    // 2. Determinar tipo e Conversão
    if (originalMimeType === "application/pdf" || fileExtension === ".pdf") { finalFileType = "pdf"; }
    else if ( /* ... lógica de apresentação ... */ ["ppt", ".pptx", ".key"].includes(fileExtension) || ["application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/vnd.apple.keynote"].includes(originalMimeType) ) {
        console.log("[API Upload] Tipo 'presentation' detectado. Iniciando conversão...");
        const convertedPdfPath = await convertPresentationToPDF(originalFilePath, file.name);
        if (convertedPdfPath) { /* ... atualiza finalFilePath, finalFileType, finalMimeType ... */ finalFilePath = convertedPdfPath; finalFileType = "pdf"; finalMimeType = "application/pdf"; }
        else { /* ... trata erro de conversão ... */ await supabaseAdmin.storage.from(supabaseConfig.storage.buckets.files).remove([originalFilePath]).catch(err => console.error("Falha ao deletar original:", err)); return NextResponse.json({ error: "Falha ao converter o ficheiro." }, { status: 500 }); }
    }
    else if (originalMimeType === "application/zip" || fileExtension === ".zip") { finalFileType = "zip"; }
    else if (originalMimeType === "text/html" || [".html", ".htm"].includes(fileExtension)) { finalFileType = "html"; }
    else { finalFileType = "other"; }

    // 3. Obter URL Pública Final
    console.log(`[API Upload] Obtendo URL pública para o caminho final: ${finalFilePath}`);
    const { data: publicUrlData } = supabaseAdmin.storage.from(supabaseConfig.storage.buckets.files).getPublicUrl(finalFilePath);
    if (!publicUrlData?.publicUrl) { /* ... trata erro ... */ await supabaseAdmin.storage.from(supabaseConfig.storage.buckets.files).remove([finalFilePath]).catch(err => console.error("Falha ao deletar ficheiro final:", err)); return NextResponse.json({ error: "Falha ao gerar URL pública." }, { status: 500 }); }
    console.log('[API Upload] URL pública obtida:', publicUrlData.publicUrl);

    // 4. Inserir no Banco de Dados (agora deve funcionar pois o user_id existe em public.users)
    console.log(`[API Upload] Inserindo registro no DB para user ${authenticatedUserId}: type=${finalFileType}, path=${finalFilePath}`);
    let insertedFileData;
    try {
      const { data, error: dbError } = await supabaseAdmin
        .from(supabaseConfig.tables.files)
        .insert({
          filename: path.basename(finalFilePath),
          original_filename: file.name,
          file_type: finalFileType,
          file_size: file.size,
          file_path: finalFilePath,
          content_type: finalMimeType,
          custom_slug: customSlug || null,
          user_id: authenticatedUserId, // ID da sessão autenticada
        })
        .select()
        .single();

      if (dbError) throw dbError;
      insertedFileData = data;
      console.log('[API Upload] Registro DB inserido:', insertedFileData);

    } catch (insertError: any) {
      console.error('[API Upload] Erro CATCH ao inserir no DB:', insertError);
      console.log(`[API Upload] Tentando deletar ${finalFilePath} do storage devido a erro no DB...`);
      await supabaseAdmin.storage.from(supabaseConfig.storage.buckets.files).remove([finalFilePath]).catch(err => console.error("Falha ao deletar ficheiro final:", err));
      // Retorna o erro específico do banco para o frontend
      return NextResponse.json({ error: "Falha ao registrar informações do ficheiro no banco.", details: insertError.message }, { status: 500 });
    }

    // 5. Retornar Sucesso
    return NextResponse.json({
      id: insertedFileData.id,
      fileName: file.name,
      fileType: finalFileType,
      url: publicUrlData.publicUrl,
      customSlug: insertedFileData.custom_slug,
    });

  } catch (error: any) { // Catch do try principal
    console.error("[API Upload] Erro GERAL no handler POST:", error);
    return NextResponse.json({ error: "Erro interno do servidor durante o upload.", technicalDetails: { message: error.message } }, { status: 500 });
  }
}

// Função OPTIONS (mantida)
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
