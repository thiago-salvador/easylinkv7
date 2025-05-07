// components/delete-account-modal.tsx
"use client";

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  // AlertDialogTrigger, // Trigger estará no UserNav
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

interface DeleteAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => Promise<void>; // Função assíncrona para lidar com a deleção
}

export function DeleteAccountModal({ open, onOpenChange, onConfirmDelete }: DeleteAccountModalProps) {
  const { t } = useLanguage();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await onConfirmDelete();
      // Se onConfirmDelete for bem-sucedido, o UserNav deve lidar com o logout/redirecionamento
      // onOpenChange(false); // Fecha o modal (pode ser feito pelo componente pai)
    } catch (err: any) {
      console.error("Erro ao deletar conta:", err);
      setError(err.message || t('modals.deleteAccount.error'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {/* AlertDialogTrigger estará no UserNav */}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
             <AlertTriangle className="h-5 w-5 text-destructive" />
             {t('modals.deleteAccount.title')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('modals.deleteAccount.description')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>{t('modals.deleteAccount.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90" // Estilo destrutivo
          >
            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {t('modals.deleteAccount.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
