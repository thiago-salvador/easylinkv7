"use client"

import { useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/esm/Page/AnnotationLayer.css"
import "react-pdf/dist/esm/Page/TextLayer.css"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Download, ExternalLink } from "lucide-react"

// Fixar a versão para 4.8.69 para evitar incompatibilidade entre API e Worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@4.8.69/build/pdf.worker.min.js`

interface PDFViewerProps {
  fileUrl: string
  fileName?: string
}

export function PDFViewer({ fileUrl, fileName = "document.pdf" }: PDFViewerProps) {
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
          <Button variant="ghost" size="icon" onClick={goToPrevPage} disabled={pageNumber <= 1}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={goToNextPage} disabled={pageNumber >= numPages!}>
            <ChevronRight className="h-5 w-5" />
          </Button>
          <span className="text-sm">
            {pageNumber || (numPages ? 1 : "--")} of {numPages || "--"}
          </span>
          <Button variant="ghost" size="icon" asChild>
            <a href={fileUrl} download={fileName} target="_blank" rel="noopener noreferrer">
              <Download className="h-5 w-5" />
            </a>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <a href={fileUrl} target="_blank" rel="noopener noreferrer">
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
