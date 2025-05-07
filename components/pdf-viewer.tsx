"use client"

/**
 * @deprecated Este componente está sendo substituído pelo VerticalPDFViewer, que oferece mais recursos
 * e melhor desempenho. Use VerticalPDFViewer para novas implementações.
 */

import { useState } from "react"
import { Document, Page } from "react-pdf"
import "react-pdf/dist/esm/Page/AnnotationLayer.css"
import "react-pdf/dist/esm/Page/TextLayer.css"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Download, ExternalLink } from "lucide-react"
import { setupPdfWorker } from "@/lib/pdfWorker"
import { useLanguage } from "@/lib/language-context"

// Inicializar o worker do PDF.js usando a configuração centralizada
setupPdfWorker()

interface PDFViewerProps {
  fileUrl: string
  fileName?: string
}

export function PDFViewer({ fileUrl, fileName = "document.pdf" }: PDFViewerProps) {
  const { t } = useLanguage();
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
  }

  const goToPrevPage = () => setPageNumber(pageNumber - 1 <= 1 ? 1 : pageNumber - 1)

  const goToNextPage = () => setPageNumber(pageNumber + 1 >= numPages! ? numPages! : pageNumber + 1)

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b bg-white">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">{fileName}</span>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={goToPrevPage} disabled={pageNumber <= 1} aria-label={t('pdfViewer.previousPage')}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={goToNextPage} disabled={pageNumber >= numPages!} aria-label={t('pdfViewer.nextPage')}>
            <ChevronRight className="h-5 w-5" />
          </Button>
          <span className="text-sm">
            {pageNumber || (numPages ? 1 : "--")} {t('pdfViewer.of')} {numPages || "--"}
          </span>
          <Button variant="ghost" size="icon" asChild>
            <a href={fileUrl} download={fileName} target="_blank" rel="noopener noreferrer" aria-label={t('pdfViewer.download')}>
              <Download className="h-5 w-5" />
            </a>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <a href={fileUrl} target="_blank" rel="noopener noreferrer" aria-label={t('pdfViewer.openInNewTab')}>
              <ExternalLink className="h-5 w-5" />
            </a>
          </Button>
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-auto">
        <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess} className="flex justify-center">
          <Page pageNumber={pageNumber} renderAnnotationLayer={false} renderTextLayer={false} />
        </Document>
      </div>
    </div>
  )
}
