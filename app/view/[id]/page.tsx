// app/view/[id]/page.tsx (CORRIGIDO)

import { createServerClient } from "@/lib/supabase"; // Verifique se este é seu cliente Supabase do lado do servidor
import { FileViewer } from "@/components/file-viewer";
import { HTMLViewer } from "@/components/html-viewer";
import { notFound } from "next/navigation";
import type { Metadata, ResolvingMetadata } from 'next'; // Importa tipos para Metadata
import { supabaseConfig } from '@/lib/config'; // Importa sua config para nome do bucket

// Define a interface para as props da página (mantida)
interface ViewPageProps {
  params: { id: string; };
}

// Define como seus dados do arquivo se parecem (Ajuste se necessário)
interface FileData {
  id: string;
  file_path: string | null;
  file_type: string | null;
  original_filename: string | null;
  view_count: number | null;
  is_premium?: boolean | null;
}

// --- FUNÇÃO PARA GERAR METADADOS DINÂMICOS (PARA O <title>) ---
export async function generateMetadata(
  { params }: ViewPageProps,
  parent: ResolvingMetadata // Opcional: para acessar metadados do pai
): Promise<Metadata> {
  const fileId = params.id;
  // Crie uma nova instância do cliente Supabase aqui se necessário, ou passe-a
  // Se createServerClient() puder ser chamado múltiplas vezes sem problemas, ok.
  const supabase = createServerClient();

  console.log(`[generateMetadata for ViewPage] Buscando nome para fileId: ${fileId}`);
  const { data: fileData, error } = await supabase
    .from(supabaseConfig.tables.files) // Usando nome da tabela da config
    .select("original_filename")
    .eq("id", fileId)
    .single<Pick<FileData, 'original_filename'>>();

  if (error || !fileData) {
    console.error(`[generateMetadata for ViewPage] Arquivo não encontrado para ID: ${fileId}`, error);
    return {
      title: "Arquivo não encontrado", // Título de fallback
    };
  }
  return {
    title: fileData.original_filename ?? "Visualização de Arquivo",
  };
}
// --- FIM DA FUNÇÃO DE METADADOS ---


// Função principal da página (Server Component)
export default async function ViewPage({ params }: ViewPageProps) {
  const fileId = params.id;
  const supabase = createServerClient();

  console.log(`[ViewPage] Tentando buscar dados para o fileId: ${fileId}`);

  const { data: fileData, error: fileError } = await supabase
    .from(supabaseConfig.tables.files) // Usando nome da tabela da config
    .select("id, file_path, file_type, original_filename, view_count, is_premium") // Seleciona colunas explícitas
    .eq("id", fileId)
    .single<FileData>();

  if (fileError || !fileData) {
    console.error("Erro ao buscar dados do arquivo ou arquivo não encontrado:", fileError);
    notFound();
  }

  if (!fileData.file_path) {
    console.error(`Caminho do arquivo (file_path) está faltando para o ID: ${fileId}`);
    notFound();
  }

  const { data: publicUrlData } = supabase.storage
    .from(supabaseConfig.storage.buckets.files) // Usando nome do bucket da config
    .getPublicUrl(fileData.file_path);

  if (!publicUrlData?.publicUrl) {
    console.error(`Não foi possível obter a URL pública para o caminho: ${fileData.file_path}`);
    notFound();
  }

  try {
    // Registra acesso e incrementa views
    console.log(`[ViewPage] Registrando acesso para fileId: ${fileId}`);
    await Promise.all([
      supabase.from(supabaseConfig.tables.fileAccessLogs).insert({ // Usando nome da tabela da config
        file_id: fileId,
        ip_address: "server-side-render", // Simplificado para SSR
        user_agent: "server-side-render",
      }),
      supabase
        .from(supabaseConfig.tables.files) // Usando nome da tabela da config
        .update({ view_count: (fileData.view_count ?? 0) + 1 })
        .eq("id", fileId),
    ]);
  } catch (logOrUpdateError) {
    console.error("[ViewPage] Erro ao registrar acesso ou atualizar contagem:", logOrUpdateError);
  }

  const isPremium = fileData.is_premium ?? false;
  const isHtmlContent = fileData.file_type?.toLowerCase().includes('html');

  if (isHtmlContent) {
    // --- CORREÇÃO: Retorna APENAS o componente HTMLViewer ---
    // Envolva em um div se precisar de um container com altura/largura total
    return (
      <div className="h-full w-full">
        <HTMLViewer
          fileUrl={publicUrlData.publicUrl}
          fileName={fileData.original_filename ?? "Arquivo sem nome"}
          isPremium={isPremium}
          skipLayout={true} // Esta prop no HTMLViewer é importante
        />
      </div>
    );
  }

  // Para outros tipos de conteúdo, usar o FileViewer normal
  return (
    <div className="h-screen w-full">
      <FileViewer
        fileId={fileId}
        fileType={fileData.file_type ?? "unknown"}
        fileUrl={publicUrlData.publicUrl}
        fileName={fileData.original_filename ?? "Arquivo sem nome"}
        isPremium={isPremium}
      />
    </div>
  );
}