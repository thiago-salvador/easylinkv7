// components/pdf-page-renderer.tsx

import React from 'react';
import { Page } from 'react-pdf';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageInfo {
  width: number;
  height: number;
}

interface PDFPageRendererProps {
  pageNumber: number;
  pageInfo: PageInfo | null;
  containerWidth: number; // Largura do container pai
  scale: number; // Escala manual para páginas retrato
  onLoadSuccess: (page: any) => void; // Callback para quando a página carrega
}

export function PDFPageRenderer({
  pageNumber,
  pageInfo,
  containerWidth,
  scale,
  onLoadSuccess,
}: PDFPageRendererProps) {

  // Determina se é paisagem (APENAS se já tivermos a info)
  const isLandscape = pageInfo ? pageInfo.width > pageInfo.height : false;

  // Define as props de tamanho condicionalmente
  const sizeProps = isLandscape
    ? { width: containerWidth, scale: undefined } // Paisagem: ajusta à largura
    : { width: undefined, scale: scale };       // Retrato: usa o zoom manual

  // Estima altura para o placeholder de loading
  const estimatedHeight = containerWidth * (isLandscape ? (pageInfo ? pageInfo.height / pageInfo.width : 0.75) : 1.41);

  return (
    // Container da página com margem e sombra
    <div className="mb-8 shadow-lg bg-white" aria-label={`Página ${pageNumber}`}>
      <Page
        key={`page_${pageNumber}`} // Chave interna do react-pdf
        pageNumber={pageNumber}
        width={sizeProps.width}
        scale={sizeProps.scale}
        onLoadSuccess={onLoadSuccess} // Passa o callback para obter dimensões
        renderTextLayer={false} // Mantido como false por performance
        renderAnnotationLayer={false}
        className="flex justify-center" // Centraliza conteúdo interno da página
        loading={ // Placeholder enquanto esta página específica carrega
          <div
            className="flex items-center justify-center bg-gray-100"
            style={{
              width: containerWidth,
              height: estimatedHeight,
              minHeight: '200px' // Altura mínima para evitar colapso
            }}
            role="status"
            aria-label={`Carregando página ${pageNumber}`}
          >
            <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
          </div>
        }
      />
    </div>
  );
}
