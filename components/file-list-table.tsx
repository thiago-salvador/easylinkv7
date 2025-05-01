// components/file-list-table.tsx
"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Edit, Share2, Trash2, LinkIcon } from "lucide-react";
import Link from 'next/link';
import type { UserFile } from '@/app/dashboard/page';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FileListTableProps {
  files: UserFile[];
}

export function FileListTable({ files }: FileListTableProps) {

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'short', year: 'numeric',
      });
    } catch (e) { return 'Data inválida'; }
  };

  // --- CORREÇÃO: Gerar links relativos ---
  const getFileLink = (file: UserFile): string => {
    // Se tiver slug personalizado, usa /slug
    if (file.custom_slug) {
      return `/${file.custom_slug}`;
    }
    // Senão, usa /view/id
    return `/view/${file.id}`;
  }

  const handleAction = (action: string, fileId: string) => {
    alert(`Ação "${action}" clicada para o ficheiro ID: ${fileId}`);
    // Implementar lógica real aqui
  };

  const copyLink = (file: UserFile) => {
    // Precisa construir a URL completa para a área de transferência
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const relativePath = getFileLink(file); // Pega o caminho relativo
    const fullUrl = `${baseUrl}${relativePath}`; // Monta a URL completa

    navigator.clipboard.writeText(fullUrl)
      .then(() => alert(`Link copiado: ${fullUrl}`))
      .catch(err => alert('Falha ao copiar link.'));
  }

  if (!files || files.length === 0) { // Adicionada verificação !files
    return <p className="text-center text-gray-500 py-6">Nenhum arquivo encontrado.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Status</TableHead>
            <TableHead>Projeto / Link</TableHead>
            <TableHead className="hidden sm:table-cell">Tipo</TableHead>
            <TableHead className="text-right">Modificado</TableHead>
            <TableHead className="w-[100px] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => (
            <TableRow key={file.id}>
              <TableCell>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Ativo</Badge>
              </TableCell>
              <TableCell className="font-medium">
                 {/* Link usa o caminho relativo gerado por getFileLink */}
                 <Link href={getFileLink(file)} target="_blank" className="hover:underline text-primary flex items-center gap-1.5 group">
                   <span className="truncate max-w-[200px] sm:max-w-[300px]">{file.custom_slug || file.original_filename}</span>
                   <LinkIcon className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                 </Link>
                 <span className="text-xs text-gray-400 block truncate max-w-[200px] sm:max-w-[300px]">
                    {/* Mostra o caminho relativo */}
                    {getFileLink(file)}
                 </span>
              </TableCell>
              <TableCell className="hidden sm:table-cell text-gray-600 text-sm">{file.file_type}</TableCell>
              <TableCell className="text-right text-gray-600 text-sm">{formatDate(file.created_at)}</TableCell>
              <TableCell className="text-right">
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                       <Button variant="ghost" size="icon" aria-label={`Ações para ${file.original_filename}`}>
                         <MoreHorizontal className="h-4 w-4" />
                       </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                       <DropdownMenuItem onClick={() => copyLink(file)}>
                          <Share2 className="mr-2 h-4 w-4" /> Copiar Link
                       </DropdownMenuItem>
                       <DropdownMenuItem onClick={() => handleAction('edit', file.id)} disabled>
                          <Edit className="mr-2 h-4 w-4" /> Editar
                       </DropdownMenuItem>
                       <DropdownMenuItem onClick={() => handleAction('delete', file.id)} className="text-red-600" disabled>
                          <Trash2 className="mr-2 h-4 w-4" /> Deletar
                       </DropdownMenuItem>
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
