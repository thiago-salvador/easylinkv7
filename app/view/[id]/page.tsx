// app/view/[id]/page.tsx

import { createServerClient } from "@/lib/supabase";
import { FileViewer } from "@/components/file-viewer";
import { notFound } from "next/navigation";
// import { Database } from "@/types/supabase"; // Descomente se tiver tipos gerados

// Define a interface para as props da página
interface ViewPageProps {
  params: {
    id: string;
  };
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

// Função principal da página (Server Component)
export default async function ViewPage({ params }: ViewPageProps) {
  // Voltando a definir fileId aqui (mais limpo)
  const fileId = params.id;
  const supabase = createServerClient();

  console.log(`Tentando buscar dados para o fileId: ${fileId}`);

  // Busca os dados do arquivo no banco de dados Supabase
  const { data: fileData, error: fileError } = await supabase
    .from("files")
    .select("*") // Considere selecionar apenas as colunas necessárias
    .eq("id", fileId) // Usando a variável fileId
    .single<FileData>();

  // Verifica erro ou se o arquivo não existe
  if (fileError || !fileData) {
    console.error("Erro ao buscar dados do arquivo ou arquivo não encontrado:", fileError);
    notFound();
  }

  // Verifica se o caminho do arquivo existe
  if (!fileData.file_path) {
    console.error(`Caminho do arquivo (file_path) está faltando para o ID: ${fileId}`);
    notFound();
  }

  // Busca a URL pública
  const { data: publicUrlData } = supabase.storage
    .from("files")
    .getPublicUrl(fileData.file_path);

  // Verifica se a URL pública foi obtida
  if (!publicUrlData?.publicUrl) {
    console.error(`Não foi possível obter a URL pública para o caminho: ${fileData.file_path}`);
    // Considerar talvez mostrar um erro em vez de 404 aqui? Por agora, mantemos 404.
    notFound();
  }

  try {
    // Registra acesso e incrementa views
    await Promise.all([
      supabase.from("file_access_logs").insert({
        file_id: fileId, // Usando a variável fileId
        ip_address: "server-side-render",
        user_agent: "server-side-render",
      }),
      supabase
        .from("files")
        .update({ view_count: (fileData.view_count ?? 0) + 1 })
        .eq("id", fileId), // Usando a variável fileId
    ]);
  } catch (logOrUpdateError) {
    // Loga o erro mas não impede a renderização
    console.error("Erro ao registrar acesso ou atualizar contagem:", logOrUpdateError);
  }

  // Verifica se é premium
  const isPremium = fileData.is_premium ?? false;

  // Renderiza o FileViewer (Client Component)
  return (
    <div className="h-screen">
      <FileViewer
        fileId={fileId} // Usando a variável fileId
        fileType={fileData.file_type ?? "unknown"}
        fileUrl={publicUrlData.publicUrl}
        fileName={fileData.original_filename ?? "Arquivo sem nome"}
        isPremium={isPremium}
      />
    </div>
  );
}