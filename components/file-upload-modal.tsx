// components/file-upload-modal.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  // DialogClose, // Não precisamos mais importar para o botão explícito
} from "@/components/ui/dialog";
// Button não é mais necessário aqui, a menos que adicione um footer
// import { Button } from "@/components/ui/button";
// import { X as CloseIcon } from "lucide-react"; // Não precisamos mais do ícone aqui
import { FileUpload } from "@/components/file-upload";
import { useRouter } from 'next/navigation';

interface FileUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FileUploadModal({ open, onOpenChange }: FileUploadModalProps) {
  const router = useRouter();

  const handleUploadComplete = () => {
    // Não fecha o modal automaticamente
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* DialogContent já inclui um botão de fechar padrão */}
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Carregar Novo Arquivo</DialogTitle>
          <DialogDescription>
            Arraste um ficheiro ou clique para selecionar. Tipos suportados: PDF, PPT, Keynote, HTML, ZIP. Máx 10MB.
          </DialogDescription>
          {/* Botão de fechar explícito REMOVIDO */}
        </DialogHeader>
        <div className="py-4">
          <FileUpload onUploadComplete={handleUploadComplete} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
