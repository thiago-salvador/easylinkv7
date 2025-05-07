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
import { useLanguage } from "@/lib/language-context";

interface AccountModalProps {
  user: SupabaseUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountModal({ user, open, onOpenChange }: AccountModalProps) {
  const { t } = useLanguage();
  
  if (!user) {
    return null;
  }

  // Placeholder para ações futuras
  const handleSetPassword = () => {
    alert(t('modals.account.setPasswordNotImplemented'));
  };

  const handleUpgrade = () => {
     alert(t('modals.account.upgradeNotImplemented'));
  };

  return (
    // O DialogContent já tem um botão de fechar padrão
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{t('modals.account.title')}</DialogTitle>
          {/* O botão <DialogClose> explícito foi REMOVIDO daqui */}
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Email */}
          <div className="grid grid-cols-[100px_1fr] items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground text-right">{t('modals.account.email')}</span>
            <span className="text-sm truncate" title={user.email ?? undefined}>
              {user.email || 'N/A'}
            </span>
          </div>
          {/* Palavra-passe */}
          <div className="grid grid-cols-[100px_1fr] items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground text-right">{t('modals.account.password')}</span>
            <Button variant="link" size="sm" className="h-auto p-0 justify-start" onClick={handleSetPassword}>
              {t('modals.account.setPassword')}
            </Button>
          </div>
          {/* Plano Atual */}
          <div className="grid grid-cols-[100px_1fr] items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground text-right">{t('modals.account.currentPlan')}</span>
            <span className="text-sm font-semibold">{t('modals.account.free')}</span>
          </div>
          {/* Chave API */}
          <div className="grid grid-cols-[100px_1fr] items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground text-right flex items-center justify-end gap-1">
              API Key
              <Info className="h-3 w-3 text-gray-400" />
            </span>
            <span className="text-sm text-muted-foreground italic">{t('modals.account.requiresUpgrade')}</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" className="w-full sm:w-auto" onClick={handleUpgrade}>
            {t('modals.account.upgradeForMore')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
