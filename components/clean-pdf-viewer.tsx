"use client"

import { useState, useEffect, useRef } from "react"
import { Document, Page } from "react-pdf"
import "react-pdf/dist/esm/Page/AnnotationLayer.css"
import "react-pdf/dist/esm/Page/TextLayer.css"
import { ZoomIn, ZoomOut, Download, Printer, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"
import { setupPdfWorker } from "@/lib/pdfWorker"

// Inicializar o worker do PDF.js
setupPdfWorker()

interface CleanPDFViewerProps {
  fileUrl: string
  fileName?: string
  isPremium?: boolean
  totalPages?: number
}

export function CleanPDFViewer({
  fileUrl,
  fileName = "document.pdf",
  isPremium = false,
  totalPages = 5,
}: CleanPDFViewerProps) {
  const [scale, setScale] = useState<number>(1.0)
  const [showControls, setShowControls] = useState<boolean>(true)
  const contentRef = useRef<HTMLDivElement>(null)
  const lastScrollY = useRef<number>(0)
  const [numPages, setNumPages] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Funções de zoom
  const zoomIn = () => setScale((prev) => Math.min(prev + 0.1, 2.0))
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.1, 0.5))

  const scalePercentage = Math.round(scale * 100)

  // Detectar scroll para mostrar/esconder controles
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return

      const currentScrollY = contentRef.current.scrollTop
      const isScrollingDown = currentScrollY > lastScrollY.current

      // Esconder a barra de ferramentas ao rolar para baixo
      if (isScrollingDown && currentScrollY > 50) {
        setShowControls(false)
      } else if (!isScrollingDown) {
        setShowControls(true)
      }

      lastScrollY.current = currentScrollY
    }

    const contentElement = contentRef.current
    if (contentElement) {
      contentElement.addEventListener("scroll", handleScroll)
      return () => contentElement.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Funções para carregar o documento PDF
  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
    setIsLoading(false)
    setLoadError(null)
  }

  function onDocumentLoadError(error: Error) {
    console.error("Error loading PDF:", error)
    setLoadError(`Não foi possível carregar o PDF: ${error.message}`)
    setIsLoading(false)
  }

  return (
    <div className="h-screen flex flex-col bg-white relative">
      {/* Barra de ferramentas minimalista */}
      <div
        className={cn(
          "flex items-center justify-between px-2 py-1 border-b bg-white transition-transform duration-300 z-10",
          !showControls && "-translate-y-full",
        )}
      >
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={zoomOut} disabled={scale <= 0.5}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <div className="flex items-center">
            <span className="px-2 text-sm">{scalePercentage}%</span>
          </div>
          <Button variant="ghost" size="icon" onClick={zoomIn} disabled={scale >= 2.0}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-1">
          <span className="text-sm">{numPages ? `${numPages} páginas` : ""}</span>
        </div>

        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon" asChild>
            <a href={fileUrl} download={fileName} target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4" />
            </a>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <a href={fileUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>

      {/* Área de conteúdo do PDF - todas as páginas em sequência vertical */}
      <div ref={contentRef} className="flex-1 overflow-auto bg-gray-200 flex flex-col items-center py-8">
        {isLoading && (
          <div className="flex items-center justify-center h-32 w-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}
        
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="flex items-center justify-center h-32 w-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          }
          className="flex flex-col items-center"
          options={{
            cMapUrl: "https://unpkg.com/pdfjs-dist@4.8.69/cmaps/",
            cMapPacked: true,
            standardFontDataUrl: "https://unpkg.com/pdfjs-dist@4.8.69/standard_fonts/",
          }}
        >
          {numPages &&
            Array.from(new Array(numPages), (_, index) => (
              <div key={`page_${index + 1}`} className="mb-8">
                <Page
                  pageNumber={index + 1}
                  scale={scale}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="shadow-lg bg-white"
                  loading={
                    <div className="flex items-center justify-center h-[600px] w-[400px] bg-white shadow-lg">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  }
                />
              </div>
            ))}
        </Document>
      </div>

      {/* Marca d'água no canto inferior direito da página (não do documento) */}
      {!isPremium && (
        <div className="fixed bottom-4 right-4 z-10 opacity-70">
          <div className="flex items-center gap-1">
            <Logo className="w-5 h-5" />
            <span className="text-xs font-medium text-gray-500">EasyLink</span>
          </div>
        </div>
      )}
    </div>
  )
}
