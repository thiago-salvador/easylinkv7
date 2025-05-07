// components/dashboard-client-content.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// ATENÇÃO: Verifique CUIDADOSAMENTE cada um destes imports e os arquivos de origem correspondentes
import { FileListTable } from '@/components/file-list-table';
import { FileUploadModal } from '@/components/file-upload-modal';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react'; // Ícone
import { ProfileManager } from '@/components/profile-manager';
import { useLanguage } from "@/lib/language-context";
import type { UserFile } from '@/app/dashboard/page';

// Função auxiliar para verificar se um componente é válido antes de tentar renderizá-lo
const isValidComponent = (Component: any, componentName: string): boolean => {
  if (Component === undefined) {
    console.error(
      `ERRO DE CARREGAMENTO DE COMPONENTE: O componente '${componentName}' está 'undefined'. ` +
      `Verifique o seguinte:
      1. O caminho da importação para '${componentName}' está correto no arquivo 'dashboard-client-content.tsx'?
      2. O arquivo do componente (ex: '${componentName}.tsx') está exportando o componente corretamente (usando 'export function ${componentName}' ou 'export default ${componentName}')?
      3. Não há erros de digitação no nome do arquivo ou do componente?
      4. O arquivo do componente existe no local esperado?`
    );
    return false;
  }
  return true;
};

interface DashboardClientContentProps {
  files: UserFile[];
}

export function DashboardClientContent({ files: initialFiles }: DashboardClientContentProps) {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [files, setFiles] = useState<UserFile[]>(initialFiles);

  console.log(`[DashboardClientContent RENDER] Lang: ${language}, Title: "${t('dashboard.myFiles')}"`);

  useEffect(() => {
    setFiles(initialFiles);
  }, [initialFiles]);

  const filesUploadedText = files.length === 1
    ? t('dashboard.filesCountSingular')
    : t('dashboard.filesCount', { count: files.length });

  // Verificações de componentes
  const isProfileManagerValid = isValidComponent(ProfileManager, "ProfileManager");
  const isFileListTableValid = isValidComponent(FileListTable, "FileListTable");
  const isFileUploadModalValid = isValidComponent(FileUploadModal, "FileUploadModal");
  const isButtonValid = isValidComponent(Button, "Button (de @/components/ui/button)");
  const isUploadIconValid = isValidComponent(Upload, "Upload (ícone de lucide-react)");

  // Se componentes críticos como Button ou o ícone não carregarem, mostre um erro geral.
  if (!isButtonValid || !isUploadIconValid) {
    return (
      <div style={{ padding: '20px', color: 'red', border: '1px solid red', margin: '20px' }}>
        <p><strong>Erro Crítico:</strong> Componentes básicos da interface (Botão ou Ícone de Upload) não puderam ser carregados.</p>
        <p>Por favor, verifique o console do navegador para mensagens de erro detalhadas sobre 'Button' ou 'Upload (ícone de lucide-react)' e confira as importações e instalações das bibliotecas (@/components/ui/button, lucide-react).</p>
      </div>
    );
  }

  return (
    <>
      {isProfileManagerValid ? (
        <ProfileManager />
      ) : (
        <p style={{ color: 'red', fontWeight: 'bold', margin: '10px 0' }}>
          Falha ao carregar o componente ProfileManager. Verifique o console para detalhes.
        </p>
      )}
      
      <div className="mb-10 rounded-xl border bg-card text-card-foreground shadow">
        <div className="flex flex-col space-y-1.5 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-xl font-semibold leading-none tracking-tight">
                  {t('dashboard.myFiles')}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {filesUploadedText}
                </p>
              </div>
              <Button size="sm" onClick={() => setIsUploadModalOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                {t('dashboard.upload')}
              </Button>
            </div>
        </div>
        <div className="p-6 pt-0">
          {isFileListTableValid ? (
            <FileListTable
              files={files}
              onFileDeleted={(fileId) => {
                console.log('Arquivo excluído no cliente (simulado ou real):', fileId);
                setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
                setTimeout(() => { router.refresh(); }, 1000);
              }}
            />
          ) : (
            <p style={{ color: 'red', fontWeight: 'bold', margin: '10px 0' }}>
              Falha ao carregar o componente FileListTable. Verifique o console para detalhes.
            </p>
          )}
        </div>
      </div>

      {isFileUploadModalValid ? (
        <FileUploadModal
          open={isUploadModalOpen}
          onOpenChange={setIsUploadModalOpen}
        />
      ) : (
        <p style={{ color: 'red', fontWeight: 'bold', margin: '10px 0' }}>
          Falha ao carregar o componente FileUploadModal. Verifique o console para detalhes.
        </p>
      )}
    </>
  );
}