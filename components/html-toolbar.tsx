// components/html-toolbar.tsx

import React from 'react';
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface HTMLToolbarProps {
  fileUrl: string;
  fileName: string;
  isLoading: boolean;
  onReload: () => void;
}

export function HTMLToolbar({
  fileUrl,
  fileName,
  isLoading,
  onReload,
}: HTMLToolbarProps) {
  return (
    <div className="flex items-center justify-between p-2 border-b bg-white flex-shrink-0">
      {/* File Name */}
      <div className="flex items-center space-x-2 min-w-0">
        <span className="text-sm font-medium truncate" title={fileName}>
          {fileName}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2 flex-shrink-0">
        <Button variant="ghost" size="icon" onClick={onReload} title="Recarregar" disabled={isLoading} aria-label="Recarregar Conteúdo">
          <RefreshCw className={cn("h-5 w-5", isLoading && "animate-spin")} />
        </Button>
        <Button variant="ghost" size="icon" asChild title="Download" aria-label="Fazer Download do Arquivo">
          <a href={fileUrl} download={fileName} target="_blank" rel="noopener noreferrer">
            <Download className="h-5 w-5" />
          </a>
        </Button>
        <Button variant="ghost" size="icon" asChild title="Abrir URL Direta" aria-label="Abrir URL Direta em Nova Aba">
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-5 w-5" />
          </a>
        </Button>
      </div>
    </div>
  );
}
