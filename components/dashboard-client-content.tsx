// components/dashboard-client-content.tsx
"use client";

import { useState } from 'react';
import { FileListTable } from '@/components/file-list-table';
import { FileUploadModal } from '@/components/file-upload-modal';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import type { UserFile } from '@/app/dashboard/page';
import { ProfileManager } from '@/components/profile-manager';

interface DashboardClientContentProps {
  files: UserFile[];
}

export function DashboardClientContent({ files }: DashboardClientContentProps) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  return (
    <>
      {/* Componente invisível que garante a criação do perfil do usuário */}
      <ProfileManager />
      
      {/* Secção de Arquivos */}
      <div className="mb-10 rounded-xl border bg-card text-card-foreground shadow">
        <div className="flex flex-col space-y-1.5 p-6">
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
             <div>
               {/* --- TEXTO ATUALIZADO --- */}
               <h3 className="text-xl font-semibold leading-none tracking-tight">
                 Meus Arquivos
               </h3>
               <p className="text-sm text-muted-foreground mt-1">
                 {files.length} arquivo(s) carregado(s)
               </p>
             </div>
             {/* Botão que abre o modal */}
             <Button size="sm" onClick={() => setIsUploadModalOpen(true)}>
               <Upload className="mr-2 h-4 w-4" />
               Carregar Arquivo
             </Button>
           </div>
        </div>
        <div className="p-6 pt-0">
           {/* A tabela já deve listar os arquivos corretamente */}
           <FileListTable files={files} />
        </div>
      </div>

      {/* Renderiza o Modal de Upload */}
      <FileUploadModal
        open={isUploadModalOpen}
        onOpenChange={setIsUploadModalOpen}
      />
    </>
  );
}
