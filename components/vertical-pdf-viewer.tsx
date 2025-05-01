// components/vertical-pdf-viewer.tsx

"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { Document, Page, pdfjs } from "react-pdf"
// --- CORREÇÃO: Importar tipo específico para a página ---
import type { PDFPageProxy } from 'pdfjs-dist/types/display/api';
import "react-pdf/dist/esm/Page/AnnotationLayer.css"
import "react-pdf/dist/esm/Page/TextLayer.css"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"
import { PDFFallback } from "@/components/pdf-fallback"
import { setupPdfWorker } from "@/lib/pdfWorker"
import { PDFToolbar } from "@/components/pdf-toolbar";
import { PDFPageRenderer } from "@/components/pdf-page-renderer";

// Initialize PDF.js worker
setupPdfWorker()

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
  const [numPages, setNumPages] = useState<number | null>(null)
  const [scale, setScale] = useState<number>(1.0)
  const [showControls, setShowControls] = useState<boolean>(true)
  const [isLoadingDocument, setIsLoadingDocument] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const lastScrollY = useRef<number>(0)
  const [containerWidth, setContainerWidth] = useState<number | null>(null)
  const [pageInfos, setPageInfos] = useState<Array<PageInfo | null>>([])

  // Measure container width
  const measureContainer = useCallback(() => {
    if (contentRef.current) {
      const width = contentRef.current.clientWidth;
      setContainerWidth(width > 0 ? width : null);
    }
  }, []);

  useEffect(() => {
    measureContainer();
    window.addEventListener("resize", measureContainer);
    return () => window.removeEventListener("resize", measureContainer);
  }, [measureContainer]);

  // Zoom controls
  const zoomIn = useCallback(() => setScale((prev) => Math.min(prev + 0.1, 3.0)), []);
  const zoomOut = useCallback(() => setScale((prev) => Math.max(prev - 0.1, 0.25)), []);
  const scalePercentage = Math.round(scale * 100)

  // Scroll controls visibility
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return
      const currentScrollY = contentRef.current.scrollTop
      const isScrollingDown = currentScrollY > lastScrollY.current && currentScrollY > 5
      setShowControls(!isScrollingDown);
      lastScrollY.current = currentScrollY <= 0 ? 0 : currentScrollY;
    }
    const contentElement = contentRef.current
    if (contentElement) {
      contentElement.addEventListener("scroll", handleScroll, { passive: true })
      return () => contentElement.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // PDF Load Handlers
  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
    setPageInfos(Array(numPages).fill(null))
    setIsLoadingDocument(false)
    setError(null)
    setTimeout(measureContainer, 100);
  }

  function onDocumentLoadError(error: Error) {
    console.error("VerticalPDFViewer: Error loading PDF document:", error)
    setError(`Falha ao carregar o documento PDF. (${error.message || 'Erro desconhecido'})`)
    setIsLoadingDocument(false)
  }

  // --- CORREÇÃO: Usando tipo PDFPageProxy em vez de any ---
  const handlePageLoadSuccess = useCallback((page: PDFPageProxy) => {
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

  // PDF.js options
  const pdfOptions = useMemo(() => ({
    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
  }), [])

  // --- Render ---

  if (error) {
    return <PDFFallback fileUrl={fileUrl} fileName={fileName} error={error} isPremium={isPremium} />
  }

  return (
    <div className="h-full flex flex-col bg-white relative overflow-hidden">
      {/* Toolbar */}
      <PDFToolbar
        fileUrl={fileUrl}
        fileName={fileName}
        scale={scale}
        scalePercentage={scalePercentage}
        numPages={numPages}
        isLoading={isLoadingDocument}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        showControls={showControls}
      />

      {/* PDF Content Area */}
      <div
        ref={contentRef}
        className="flex-1 overflow-auto bg-gray-200 flex flex-col items-center py-8"
        aria-label="Visualizador de PDF"
      >
        {(isLoadingDocument || !containerWidth) && (
          <div className="flex items-center justify-center h-32 w-full text-gray-500" role="status">
             <Loader2 className="h-8 w-8 animate-spin mr-2" aria-hidden="true" /> Carregando documento...
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
            aria-label={`Documento ${fileName}`}
          >
            {numPages &&
              Array.from(new Array(numPages), (_, index) => {
                const pageNumber = index + 1;
                const pageInfo = pageInfos.length > index ? pageInfos[index] : null;

                return (
                  <PDFPageRenderer
                    key={`page-renderer-${pageNumber}`}
                    pageNumber={pageNumber}
                    pageInfo={pageInfo}
                    containerWidth={containerWidth}
                    scale={scale}
                    onLoadSuccess={handlePageLoadSuccess} // Passa o callback tipado
                  />
                );
              })}
          </Document>
        )}
      </div>

      {/* Watermark */}
      {!isPremium && (
        <div className="fixed bottom-4 right-4 z-10 opacity-70 pointer-events-none" aria-hidden="true">
          <div className="flex items-center gap-1 bg-white/50 backdrop-blur-sm px-2 py-1 rounded-full">
            <Logo className="w-4 h-4" />
            <span className="text-xs font-medium text-gray-600">EasyLink</span>
          </div>
        </div>
      )}
    </div>
  )
}
