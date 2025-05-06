// components/dashboard-client-content.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileListTable } from '@/components/file-list-table';
import { FileUploadModal } from '@/components/file-upload-modal';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import type { UserFile } from '@/app/dashboard/page';
import { ProfileManager } from '@/components/profile-manager';
import { useLanguage } from "@/lib/language-context";

interface DashboardClientContentProps {
  files: UserFile[];
}

export function DashboardClientContent({ files: initialFiles }: DashboardClientContentProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [files, setFiles] = useState<UserFile[]>(initialFiles);
  
  // Atualizar os arquivos quando as props mudarem
  useEffect(() => {
    setFiles(initialFiles);
  }, [initialFiles]);

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
                 {t('dashboard.files')}
               </h3>
               <p className="text-sm text-muted-foreground mt-1">
                 {files.length === 1 ? t('dashboard.filesCountSingular') : t('dashboard.filesCount').replace('{count}', files.length.toString())}
               </p>
             </div>
             {/* Botão que abre o modal */}
             <Button size="sm" onClick={() => setIsUploadModalOpen(true)}>
               <Upload className="mr-2 h-4 w-4" />
               {t('dashboard.upload')}
             </Button>
           </div>
        </div>
        <div className="p-6 pt-0">
           {/* A tabela já deve listar os arquivos corretamente */}
           <FileListTable 
             files={files} 
             onFileDeleted={(fileId) => {
               console.log('Arquivo excluído (ou simulado como excluído):', fileId);
               
               // Remover o arquivo da lista local (UI) mesmo se houver erro no servidor
               setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
               
               // Atualizar a página para buscar os dados mais recentes do servidor
               // Usamos setTimeout para dar tempo ao usuário de ver a notificação
               setTimeout(() => {
                 router.refresh();
               }, 1000);
             }} 
           />
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
