import { AlertCircle, Download, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CleanPDFViewer } from "@/components/clean-pdf-viewer"

interface PDFFallbackProps {
  fileUrl: string
  fileName: string
  error: string
  isPremium?: boolean
}

export function PDFFallback({ fileUrl, fileName, error, isPremium = false }: PDFFallbackProps) {
  return (
    <div className="h-screen flex flex-col bg-white">
      {/* 
        Barra superior com botões escondida com 'hidden' 
        mas mantida no DOM para preservar a funcionalidade 
      */}
      <div className="hidden p-2 border-b bg-white flex justify-end">
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" asChild className="text-xs h-8">
            <a href={fileUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5 mr-1" />
              Abrir PDF
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild className="text-xs h-8">
            <a href={fileUrl} download={fileName}>
              <Download className="h-3.5 w-3.5 mr-1" />
              Download
            </a>
          </Button>
        </div>
      </div>

      <div className="flex-1">
        <CleanPDFViewer fileUrl={fileUrl} fileName={fileName} isPremium={isPremium} totalPages={5} />
      </div>
    </div>
  )
}
