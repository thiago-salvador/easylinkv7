"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import dynamic from 'next/dynamic'; // Import dynamic para carregamento sob demanda
import { HTMLViewer } from "@/components/html-viewer"; // HTMLViewer pode ser importado normalmente
import { Loader2 } from "lucide-react";
import { pdfjs } from 'react-pdf'; // Importar pdfjs para configurar o worker
import { Button } from "@/components/ui/button"; // Importar Button para o fallback

// --- Importar CSS do react-pdf ---
// Necessário para a correta renderização das camadas do PDF
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// --- Configurar a Fonte do Worker do PDF.js ---
// Garante que isto corre apenas no lado do cliente
if (typeof window !== 'undefined') {
  try {
      // Usa a versão da biblioteca pdfjs instalada para construir a URL
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.mjs`;
  } catch (error) {
      console.error("FileViewer: Erro ao definir pdfjs workerSrc baseado na versão:", error);
      // Fallback para uma versão estável conhecida se a versão dinâmica falhar
      const fallbackVersion = "4.8.69"; // Ou fixe para a versão específica que instalou
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${fallbackVersion}/build/pdf.worker.mjs`;
  }
}

// --- Importação Dinâmica para o Visualizador de PDF ---
// Este componente só será carregado quando for realmente necessário (ou seja, quando fileType for pdf)
const VerticalPDFViewer = dynamic(() => import('@/components/vertical-pdf-viewer').then(mod => mod.VerticalPDFViewer), {
  ssr: false, // Desabilita Renderização no Lado do Servidor, pois depende de APIs do navegador
  loading: () => ( // Componente de loading opcional mostrado enquanto o componente do visualizador é carregado
    <div className="flex items-center justify-center h-screen bg-white" role="status">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" aria-hidden="true" />
        <p className="text-gray-600">Carregando visualizador...</p>
      </div>
    </div>
  ),
});

interface FileViewerProps {
  fileId: string;
  fileType?: string; // Deve ser o tipo final visualizável (ex: 'pdf' mesmo que original fosse 'presentation')
  fileUrl?: string;  // URL para o ficheiro final visualizável (ex: URL do PDF convertido)
  fileName?: string; // Nome original do ficheiro para exibição/download
  isPremium?: boolean;
}

export function FileViewer({ fileId, fileType, fileUrl, fileName, isPremium = false }: FileViewerProps) {
  // Referência para controlar o ciclo de vida do componente
  const isMounted = useRef(true);
  
  // Estado para carregar metadados do ficheiro (se não forem passados via props)
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(!fileUrl || !fileType);
  // Estado para guardar os dados do ficheiro a exibir
  const [displayData, setDisplayData] = useState<{ url: string; type: string; name: string; } | null>(
    fileUrl && fileType ? { url: fileUrl, type: fileType, name: fileName || "file" } : null
  );
  const [error, setError] = useState<string | null>(null);
  
  // Controle de ciclo de vida do componente
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Busca metadados do ficheiro se não forem fornecidos via props
  useEffect(() => {
    const fetchFileData = async () => {
      // Verificar se o componente ainda está montado antes de atualizar o estado
      if (!isMounted.current) return;
      
      setIsLoadingMetadata(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/files/${fileId}`);
        
        // Verificar novamente se o componente ainda está montado
        if (!isMounted.current) return;
        
        if (!response.ok) {
          let errorMsg = `Erro ao buscar dados (${response.status})`;
          try { 
            const errorData = await response.json(); 
            errorMsg = errorData.error || errorData.message || errorMsg; 
          } catch (_) {}
          throw new Error(errorMsg);
        }
        
        const data = await response.json();
        
        // Verificar novamente se o componente ainda está montado
        if (!isMounted.current) return;
        
        if (!data.url || !data.fileType || !data.fileName) {
           throw new Error("Dados da API incompletos para o ficheiro.");
        }
        
        setDisplayData({ url: data.url, type: data.fileType, name: data.fileName });
      } catch (err: any) {
        // Verificar se o componente ainda está montado antes de atualizar o estado de erro
        if (!isMounted.current) return;
        
        console.error("FileViewer: Erro ao buscar metadados do ficheiro:", err);
        setError(err.message || "Erro ao carregar informações do ficheiro.");
      } finally {
        // Verificar se o componente ainda está montado antes de atualizar o estado de carregamento
        if (isMounted.current) {
          setIsLoadingMetadata(false);
        }
      }
    };

    if (!fileUrl || !fileType) {
        if (fileId) {
            fetchFileData();
        } else {
            // Verificar se o componente ainda está montado
            if (isMounted.current) {
              setError("ID do ficheiro não fornecido.");
              setIsLoadingMetadata(false);
            }
        }
    }
    
    // Cleanup function para cancelar qualquer operação pendente
    return () => {
      // A referência isMounted.current já será definida como false no cleanup do useEffect principal
    };
  }, [fileId, fileUrl, fileType]); // Dependências para re-executar o fetch

  // --- Lógica de Renderização ---

  if (isLoadingMetadata) {
    return (
      <div className="flex items-center justify-center h-screen bg-white" role="status">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" aria-hidden="true" />
          <p className="text-gray-600">Carregando informações...</p>
        </div>
      </div>
    );
  }

  if (error || !displayData || !displayData.url) {
    return (
      <div className="flex items-center justify-center h-screen bg-white" role="alert">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center border border-red-200">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erro ao Carregar</h2>
          <p className="text-gray-700">{error || "Não foi possível obter as informações necessárias."}</p>
          <Button
            onClick={() => (window.location.href = "/")}
            className="mt-6 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Voltar para a página inicial
          </Button>
        </div>
      </div>
    );
  }

  // Determina qual visualizador usar
  const lowerCaseType = displayData.type.toLowerCase();

  // PDF ou Apresentação (convertida para PDF)
  if (lowerCaseType.includes("pdf") || lowerCaseType.includes("presentation")) {
    return (
      // Renderiza o componente importado dinamicamente
      <VerticalPDFViewer
          fileUrl={displayData.url}
          fileName={displayData.name}
          isPremium={isPremium}
      />
    );
  }

  // HTML
  if (lowerCaseType.includes("html")) {
    // Usando uma chave única para forçar a recriação completa do componente quando os dados mudam
    // Isso evita problemas de manipulação do DOM durante a atualização
    return (
      <div key={`html-viewer-${fileId}-${Date.now()}`} className="h-full w-full overflow-hidden">
        {/* Verificando se estamos no cliente antes de renderizar o HTMLViewer */}
        {typeof window !== 'undefined' && (
          <HTMLViewer 
            fileUrl={displayData.url} 
            fileName={displayData.name} 
            isPremium={isPremium} 
          />
        )}
      </div>
    );
  }

  // Fallback para outros tipos (ex: ZIP) -> Oferecer Download
  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Visualização Indisponível</h2>
        <p className="text-gray-700 mb-2">
          Não é possível visualizar ficheiros do tipo "{displayData.type}" diretamente.
        </p>
        <p className="text-gray-700">
          Faça o download para abrir o ficheiro no seu dispositivo.
        </p>
        <Button asChild className="mt-6">
           <a
             href={displayData.url}
             download={displayData.name || 'download'} // Usa nome original para download
             className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors inline-block"
             aria-label={`Fazer download do ficheiro ${displayData.name || 'arquivo'}`}
           >
             Download "{displayData.name || 'arquivo'}"
           </a>
        </Button>
      </div>
    </div>
  );
}
