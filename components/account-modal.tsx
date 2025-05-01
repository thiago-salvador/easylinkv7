// components/account-modal.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  // DialogTrigger, // Trigger está no UserNav
  DialogFooter,
  // DialogClose, // Não precisamos mais importar aqui
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { Info } from "lucide-react"; // Não precisamos mais do CloseIcon aqui

interface AccountModalProps {
  user: SupabaseUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountModal({ user, open, onOpenChange }: AccountModalProps) {
  if (!user) {
    return null;
  }

  // Placeholder para ações futuras
  const handleSetPassword = () => {
    alert("Funcionalidade 'Definir Palavra-passe' ainda não implementada.");
  };

  const handleUpgrade = () => {
     alert("Funcionalidade 'Upgrade' ainda não implementada.");
  };

  return (
    // O DialogContent já tem um botão de fechar padrão
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Conta</DialogTitle>
          {/* O botão <DialogClose> explícito foi REMOVIDO daqui */}
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Email */}
          <div className="grid grid-cols-[100px_1fr] items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground text-right">Email</span>
            <span className="text-sm truncate" title={user.email ?? undefined}>
              {user.email || 'N/A'}
            </span>
          </div>
          {/* Palavra-passe */}
          <div className="grid grid-cols-[100px_1fr] items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground text-right">Palavra-passe</span>
            <Button variant="link" size="sm" className="h-auto p-0 justify-start" onClick={handleSetPassword}>
              Definir palavra-passe
            </Button>
          </div>
          {/* Plano Atual */}
          <div className="grid grid-cols-[100px_1fr] items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground text-right">Plano Atual</span>
            <span className="text-sm font-semibold">Gratuito</span>
          </div>
          {/* Chave API */}
          <div className="grid grid-cols-[100px_1fr] items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground text-right flex items-center justify-end gap-1">
              API Key
              <Info className="h-3 w-3 text-gray-400" />
            </span>
            <span className="text-sm text-muted-foreground italic">Requer upgrade</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" className="w-full sm:w-auto" onClick={handleUpgrade}>
            Upgrade para mais
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
