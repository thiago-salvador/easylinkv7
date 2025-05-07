// components/file-list-table.tsx
"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Edit, Share2, Trash2, LinkIcon, Loader2 } from "lucide-react";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { UserFile } from '@/app/dashboard/page'; // Verifique o caminho se necessário
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/lib/language-context"; // Usando seu hook de idioma
import { EditFileModal } from "@/components/edit-file-modal"; // Certifique-se que este componente existe e está correto
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface FileListTableProps {
  files: UserFile[];
  onFileDeleted?: (fileId: string) => void;
}

export function FileListTable({ files, onFileDeleted }: FileListTableProps) {
  const { t, language } = useLanguage(); // Usando seu hook de idioma
  const { toast } = useToast();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [fileToEdit, setFileToEdit] = useState<UserFile | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isClient, setIsClient] = useState(false);

  console.log(`[FileListTable RENDER] Lang: ${language}, Status Header: "${t('dashboard.status')}"`);

  useEffect(() => { setIsClient(true); }, []);

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    try {
      return new Intl.DateTimeFormat(language, { // Usa o idioma do contexto
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(dateString));
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return dateString;
    }
  };

  const getFileLink = (file: UserFile): string => {
    const slug = file.custom_slug || file.id;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || '';
    return `${baseUrl}/view/${slug}`;
  };

  const handleAction = (action: string, fileId: string) => {
    if (action === 'delete') {
      setFileToDelete(fileId);
      setShowDeleteConfirm(true);
    } else if (action === 'edit') {
      const currentFileToEdit = files.find(f => f.id === fileId);
      if (currentFileToEdit) {
        setFileToEdit(currentFileToEdit);
        setShowEditModal(true);
      } else {
        // Usando chaves do seu pt/translation.json
        toast({ title: t('dashboard.error'), description: t('dashboard.fileNotFound'), variant: "destructive" });
      }
    }
  };

  const handleDeleteFile = async () => {
    if (!fileToDelete) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/files/${fileToDelete}`, { method: 'DELETE' });
      if (!response.ok && response.status !== 204) {
        const errorData = await response.json().catch(() => ({error: t('common.unknownError')}));
        throw new Error(errorData.error || t('dashboard.errorDeletingFile') );
      }
      toast({ title: t('dashboard.fileDeleted'), description: t('dashboard.fileDeletedSuccess') });
      if (onFileDeleted) { onFileDeleted(fileToDelete); }
      else { router.refresh(); }
    } catch (error: any) {
      console.error('Erro ao excluir arquivo:', error);
      toast({ title: t('dashboard.error'), description: error.message || t('dashboard.errorDeletingFile'), variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setFileToDelete(null);
    }
  };

  const copyLink = (file: UserFile) => {
    const link = getFileLink(file);
    navigator.clipboard.writeText(link)
      .then(() => {
        toast({ title: t('dashboard.linkCopiedTitle'), description: t('dashboard.linkCopiedDesc') });
      })
      .catch(err => {
        console.error('Erro ao copiar link:', err);
        toast({ title: t('dashboard.error'), description: t('dashboard.errorCopyingLink'), variant: "destructive"});
      });
  };
  
  const handleFileUpdated = () => {
    router.refresh(); 
    setShowEditModal(false);
  };

  if (!isClient) { return ( <div className="p-6 text-center text-gray-500">{t('common.loading')}</div> ); }

  if (!files || files.length === 0) {
    return <p className="text-center text-gray-500 py-6">{t('dashboard.noFilesFound')}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('dashboard.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>{t('dashboard.deleteWarning')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFile} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
              {isDeleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('common.deleting')}</> : t('dashboard.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Certifique-se que EditFileModal existe e está sendo importado corretamente */}
      {EditFileModal && <EditFileModal open={showEditModal} onOpenChange={setShowEditModal} file={fileToEdit} onFileUpdated={handleFileUpdated} />}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">{t('dashboard.status')}</TableHead>
            <TableHead>{t('dashboard.projectLink')}</TableHead>
            <TableHead className="hidden sm:table-cell">{t('dashboard.type')}</TableHead>
            <TableHead className="text-right">{t('dashboard.modified')}</TableHead>
            <TableHead className="w-[100px] text-right">{t('dashboard.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => (
            <TableRow key={file.id}>
              <TableCell><Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">{t('dashboard.active')}</Badge></TableCell>
              <TableCell className="font-medium">
                <Link href={getFileLink(file)} target="_blank" className="hover:underline text-primary flex items-center gap-1.5 group">
                  <span className="truncate max-w-[200px] sm:max-w-[300px]">{file.custom_slug || file.original_filename}</span>
                  <LinkIcon className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </Link>
                <span className="text-xs text-gray-400 block truncate max-w-[200px] sm:max-w-[300px]">{getFileLink(file)}</span>
              </TableCell>
              <TableCell className="hidden sm:table-cell text-gray-600 text-sm">{file.file_type}</TableCell>
              <TableCell className="text-right text-gray-600 text-sm">{formatDate(file.created_at)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={t('dashboard.actionsForFile', {filename: file.original_filename})}><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => copyLink(file)}><Share2 className="mr-2 h-4 w-4" />{t('dashboard.copyLink')}</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAction('edit', file.id)}><Edit className="mr-2 h-4 w-4" />{t('dashboard.edit')}</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAction('delete', file.id)} className="text-red-600"><Trash2 className="mr-2 h-4 w-4" />{t('dashboard.delete')}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}