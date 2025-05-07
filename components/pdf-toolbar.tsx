import React from 'react';
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Download, Printer, ExternalLink, Maximize } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";

interface PDFToolbarProps {
  fileUrl: string;
  fileName: string;
  scale: number;
  scalePercentage: number;
  numPages: number | null;
  isLoading: boolean; // Para desabilitar botões durante o carregamento inicial
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void; // Novo: função para resetar o zoom para 100%
  showControls: boolean; // Para aplicar a transição de visibilidade
}

export function PDFToolbar({
  fileUrl,
  fileName,
  scale,
  scalePercentage,
  numPages,
  isLoading,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  showControls,
}: PDFToolbarProps) {
  // Usar o hook de internacionalização
  const { t } = useLanguage();
  return (
    <div
      className={cn(
        "flex items-center justify-between px-2 py-1 border-b bg-white transition-transform duration-300 z-10 sticky top-0", // Use sticky top-0
        !showControls && "-translate-y-full",
      )}
      aria-hidden={!showControls}
    >
      {/* Zoom Controls com internacionalização */}
      <div className="flex items-center space-x-1">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onZoomOut} 
          disabled={isLoading || scale <= 0.25} 
          title={t('pdfViewer.zoomOut')} 
          aria-label={t('pdfViewer.zoomOut')}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="px-2 text-sm w-12 text-center" aria-live="polite">{scalePercentage}%</span>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onZoomIn} 
          disabled={isLoading || scale >= 3.0} 
          title={t('pdfViewer.zoomIn')} 
          aria-label={t('pdfViewer.zoomIn')}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onResetZoom} 
          disabled={isLoading || Math.abs(scale - 1.0) < 0.01} 
          title={t('pdfViewer.resetZoom')} 
          aria-label={t('pdfViewer.resetZoom')}
        >
          <Maximize className="h-4 w-4" />
        </Button>
      </div>

      {/* Page Count com internacionalização */}
      <div className="flex items-center space-x-1">
        <span className="text-sm" aria-live="polite">
          {numPages 
            ? t('pdfViewer.pageCount', { count: numPages }) 
            : (isLoading ? t('pdfViewer.loading') : "")}
        </span>
      </div>

      {/* Actions com internacionalização */}
      <div className="flex items-center space-x-1">
        {/* Search button can be implemented later */}
        {/* <Button variant="ghost" size="icon" title={t('pdfViewer.search')} aria-label={t('pdfViewer.search')}><Search className="h-4 w-4" /></Button> */}
        <Button 
          variant="ghost" 
          size="icon" 
          asChild 
          title={t('pdfViewer.download')} 
          aria-label={t('pdfViewer.downloadFile', { name: fileName })} 
          disabled={isLoading}
        >
          <a href={fileUrl} download={fileName} target="_blank" rel="noopener noreferrer">
            <Download className="h-4 w-4" />
          </a>
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => window.print()} 
          title={t('pdfViewer.print')} 
          aria-label={t('pdfViewer.printDocument')} 
          disabled={isLoading}
        >
          <Printer className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          asChild 
          title={t('pdfViewer.openInNewTab')} 
          aria-label={t('pdfViewer.openInNewTab')} 
          disabled={isLoading}
        >
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}