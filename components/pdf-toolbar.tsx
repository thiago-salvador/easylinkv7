import React from 'react';
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Download, Printer, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface PDFToolbarProps {
  fileUrl: string;
  fileName: string;
  scale: number;
  scalePercentage: number;
  numPages: number | null;
  isLoading: boolean; // Para desabilitar botões durante o carregamento inicial
  onZoomIn: () => void;
  onZoomOut: () => void;
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
  showControls,
}: PDFToolbarProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-2 py-1 border-b bg-white transition-transform duration-300 z-10 sticky top-0", // Use sticky top-0
        !showControls && "-translate-y-full",
      )}
      aria-hidden={!showControls}
    >
      {/* Zoom Controls */}
      <div className="flex items-center space-x-1">
        <Button variant="ghost" size="icon" onClick={onZoomOut} disabled={isLoading || scale <= 0.25} title="Diminuir Zoom" aria-label="Diminuir Zoom">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="px-2 text-sm w-12 text-center" aria-live="polite">{scalePercentage}%</span>
        <Button variant="ghost" size="icon" onClick={onZoomIn} disabled={isLoading || scale >= 3.0} title="Aumentar Zoom" aria-label="Aumentar Zoom">
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>

      {/* Page Count */}
      <div className="flex items-center space-x-1">
        <span className="text-sm" aria-live="polite">
          {numPages ? `${numPages} páginas` : (isLoading ? "Carregando..." : "")}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-1">
        {/* Search button can be implemented later */}
        {/* <Button variant="ghost" size="icon" title="Buscar" aria-label="Buscar no Documento"><Search className="h-4 w-4" /></Button> */}
        <Button variant="ghost" size="icon" asChild title="Download" aria-label="Fazer Download do Arquivo" disabled={isLoading}>
          <a href={fileUrl} download={fileName} target="_blank" rel="noopener noreferrer">
            <Download className="h-4 w-4" />
          </a>
        </Button>
        <Button variant="ghost" size="icon" onClick={() => window.print()} title="Imprimir" aria-label="Imprimir Documento" disabled={isLoading}>
          <Printer className="h-4 w-4" />
        </Button>
         <Button variant="ghost" size="icon" asChild title="Abrir em nova aba" aria-label="Abrir PDF em Nova Aba" disabled={isLoading}>
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}