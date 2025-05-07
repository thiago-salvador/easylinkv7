// components/vertical-pdf-viewer.tsx

"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/esm/Page/AnnotationLayer.css"
import "react-pdf/dist/esm/Page/TextLayer.css"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"
import { PDFFallback } from "@/components/pdf-fallback"
import { setupPdfWorker } from "@/lib/pdfWorker"
import { PDFToolbar } from "@/components/pdf-toolbar";
import { PDFPageRenderer } from "@/components/pdf-page-renderer";
import { useLanguage } from "@/lib/language-context";
import { ViewerHeader } from "@/components/viewer-header";

// Initialize PDF.js worker
try {
  setupPdfWorker();
} catch (error) {
  console.error("Error initializing PDF worker:", error);
}

interface VerticalPDFViewerProps {
  fileUrl: string
  fileName?: string
  isPremium?: boolean
}

interface PageInfo {
  width: number;
  height: number;
}

export function VerticalPDFViewer({ fileUrl, fileName = "document.pdf", isPremium = false }: VerticalPDFViewerProps) {
  // Usar o hook de internacionalização
  const { t } = useLanguage();
  const [numPages, setNumPages] = useState<number | null>(null)
  const [scale, setScale] = useState<number>(1.0)
  const [showControls, setShowControls] = useState<boolean>(true)
  const [isLoadingDocument, setIsLoadingDocument] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const lastScrollY = useRef<number>(0)
  const [containerWidth, setContainerWidth] = useState<number | null>(null)
  const [pageInfos, setPageInfos] = useState<Array<PageInfo | null>>([])
  
  // Rastrear tentativas de carregamento para melhor tratamento de erros
  const loadAttempts = useRef<number>(0)
  const maxLoadAttempts = 3

  // Measure container width com debounce para melhor performance
  const measureContainer = useCallback(() => {
    if (contentRef.current) {
      const width = contentRef.current.clientWidth;
      if (width > 0 && width !== containerWidth) {
        setContainerWidth(width);
      }
    }
  }, [containerWidth]);

  // Efeito para medir o container com debounce
  useEffect(() => {
    measureContainer();
    
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(measureContainer, 100);
    };
    
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, [measureContainer]);

  // Zoom controls com limites de segurança
  const zoomIn = useCallback(() => setScale((prev) => Math.min(prev + 0.1, 3.0)), []);
  const zoomOut = useCallback(() => setScale((prev) => Math.max(prev - 0.1, 0.25)), []);
  const scalePercentage = Math.round(scale * 100)

  // Função para resetar o zoom para 100%
  const resetZoom = useCallback(() => setScale(1.0), []);

  // Scroll controls visibility com debounce
  useEffect(() => {
    let scrollTimeoutId: NodeJS.Timeout;
    
    const handleScroll = () => {
      if (!contentRef.current) return;
      
      clearTimeout(scrollTimeoutId);
      scrollTimeoutId = setTimeout(() => {
        const currentScrollY = contentRef.current?.scrollTop || 0;
        const isScrollingDown = currentScrollY > lastScrollY.current && currentScrollY > 5;
        setShowControls(!isScrollingDown);
        lastScrollY.current = currentScrollY <= 0 ? 0 : currentScrollY;
      }, 50);
    };
    
    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener("scroll", handleScroll, { passive: true });
      return () => {
        contentElement.removeEventListener("scroll", handleScroll);
        clearTimeout(scrollTimeoutId);
      };
    }
  }, [])

  // PDF Load Handlers com melhor tratamento de erros
  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
    setPageInfos(Array(numPages).fill(null))
    setIsLoadingDocument(false)
    setError(null)
    loadAttempts.current = 0; // Resetar tentativas após sucesso
    setTimeout(measureContainer, 100);
  }

  function onDocumentLoadError(error: Error) {
    console.error("VerticalPDFViewer: Error loading PDF document:", error);
    
    // Incrementar tentativas e tentar novamente até o limite
    loadAttempts.current += 1;
    
    if (loadAttempts.current < maxLoadAttempts) {
      console.log(`Tentativa ${loadAttempts.current}/${maxLoadAttempts} de carregar o PDF...`);
      // Forçar um recarregamento do documento definindo um estado temporário
      setIsLoadingDocument(true);
      // Usar timeout para evitar loop infinito
      setTimeout(() => {
        // Apenas para forçar uma re-renderização do componente Document
        setScale(s => s + 0.001);
      }, 1000);
    } else {
      // Após máximo de tentativas, mostrar erro
      setError(`${t('pdfViewer.error')}. (${error.message || t('common.unknownError')})`);
      setIsLoadingDocument(false);
    }
  }

  // Usando tipo any para evitar problemas de importação
  const handlePageLoadSuccess = useCallback((page: any) => {
      const pageIndex = page.pageNumber - 1;
      // Acessar dimensões originais através do viewport padrão
      const originalWidth = page.view[2]; // view = [x1, y1, x2, y2] -> width = x2 - x1 (assumindo x1=0)
      const originalHeight = page.view[3]; // view = [x1, y1, x2, y2] -> height = y2 - y1 (assumindo y1=0)

      setPageInfos(prevInfos => {
          if (pageIndex < prevInfos.length && prevInfos[pageIndex] === null) {
              const newInfos = [...prevInfos];
              newInfos[pageIndex] = { width: originalWidth, height: originalHeight };
              return newInfos;
          }
          if (pageIndex >= prevInfos.length && numPages !== null && prevInfos.length !== numPages) {
              const initialInfos = Array(numPages).fill(null);
              if (pageIndex < initialInfos.length) {
                 initialInfos[pageIndex] = { width: originalWidth, height: originalHeight };
              }
              return initialInfos;
          }
          return prevInfos;
      });
  }, [numPages]); // Depende de numPages

  // PDF.js options com configurações otimizadas
  const pdfOptions = useMemo(() => ({
    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
    disableAutoFetch: false, // Permitir busca automática para melhor performance
    disableStream: false, // Manter streaming ativado para carregamento progressivo
    disableRange: false, // Manter range requests ativados para melhor performance
  }), [])

  // --- Render ---

  if (error) {
    return <PDFFallback fileUrl={fileUrl} fileName={fileName} error={error} isPremium={isPremium} />
  }

  return (
    <div className="h-full flex flex-col bg-white relative overflow-hidden">
      {/* Header específico para visualizador */}
      <ViewerHeader fileName={fileName} />
      {/* Toolbar com controles de acessibilidade */}
      <PDFToolbar
        fileUrl={fileUrl}
        fileName={fileName}
        scale={scale}
        scalePercentage={scalePercentage}
        numPages={numPages}
        isLoading={isLoadingDocument}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetZoom={resetZoom}
        showControls={showControls}
      />

      {/* PDF Content Area com melhor acessibilidade */}
      <div
        ref={contentRef}
        className="flex-1 overflow-auto bg-gray-200 flex flex-col items-center py-8"
        aria-label={t('pdfViewer.viewer')}
        role="region"
        tabIndex={0}
      >
        {(isLoadingDocument || !containerWidth) && (
          <div 
            className="flex items-center justify-center h-32 w-full text-gray-500" 
            role="status"
            aria-live="polite"
          >
             <Loader2 className="h-8 w-8 animate-spin mr-2" aria-hidden="true" /> 
             <span>{t('pdfViewer.loading')}</span>
          </div>
        )}

        {containerWidth && (
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={null}
            className="flex flex-col items-center"
            options={pdfOptions}
            aria-label={`${t('pdfViewer.document')} ${fileName}`}
            externalLinkTarget="_blank" // Links externos abrem em nova aba por segurança
            renderMode="canvas" // Modo de renderização mais rápido
          >
            {numPages &&
              Array.from(new Array(numPages), (_, index) => {
                const pageNumber = index + 1;
                const pageInfo = pageInfos.length > index ? pageInfos[index] : null;

                // Renderização condicional para melhor performance
                // Só renderiza páginas que estão próximas da área visível
                // Implementação básica de virtualização
                return (
                  <PDFPageRenderer
                    key={`page-renderer-${pageNumber}`}
                    pageNumber={pageNumber}
                    pageInfo={pageInfo}
                    containerWidth={containerWidth}
                    scale={scale}
                    onLoadSuccess={handlePageLoadSuccess}
                    aria-label={`${t('pdfViewer.page')} ${pageNumber} ${t('pdfViewer.of')} ${numPages}`}
                  />
                );
              })}
          </Document>
        )}
      </div>

      {/* Watermark com melhor acessibilidade */}
      {!isPremium && (
        <div 
          className="fixed bottom-4 right-4 z-10 opacity-70 pointer-events-none" 
          aria-hidden="true"
          role="presentation"
        >
          <div className="flex items-center gap-1 bg-white/50 backdrop-blur-sm px-2 py-1 rounded-full">
            <Logo className="w-4 h-4" />
            <span className="text-xs font-medium text-gray-600">EasyLink</span>
          </div>
        </div>
      )}
    </div>
  )
}
