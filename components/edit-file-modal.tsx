"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useToast } from "@/components/ui/use-toast";
import type { UserFile } from '@/app/dashboard/page';

interface EditFileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: UserFile | null;
  onFileUpdated?: (updatedFile: UserFile) => void;
}

export function EditFileModal({ open, onOpenChange, file, onFileUpdated }: EditFileModalProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [customSlug, setCustomSlug] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Atualizar o slug quando o arquivo muda
  useState(() => {
    if (file && open) {
      setCustomSlug(file.custom_slug || "");
      setError(null);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) return;
    
    // Validar o slug (apenas letras, números, hífens e underscores)
    const sanitizedSlug = customSlug.trim().replace(/[^a-zA-Z0-9-_]/g, '');
    if (customSlug && !sanitizedSlug) {
      setError(t('modals.editFile.invalidSlug'));
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/files/edit', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileId: file.id,
          customSlug: sanitizedSlug || null, // Enviar null se estiver vazio
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || t('modals.editFile.updateError'));
      }
      
      toast({
        title: t('modals.editFile.success'),
        description: t('modals.editFile.successDescription'),
      });
      
      // Notificar o componente pai sobre a atualização
      if (onFileUpdated && data.file) {
        onFileUpdated(data.file);
      }
      
      // Fechar o modal
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erro ao atualizar arquivo:', error);
      setError(error.message || t('modals.editFile.updateError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('modals.editFile.title')}</DialogTitle>
          <DialogDescription>
            {t('modals.editFile.description')}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="filename">{t('modals.editFile.filename')}</Label>
            <Input
              id="filename"
              value={file?.original_filename || ""}
              disabled
              className="bg-gray-100"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="custom-slug">{t('modals.editFile.customLink')}</Label>
            <div className="flex items-center">
              <span className="text-gray-500 text-sm mr-1 bg-gray-100 px-2 py-2 rounded-l-md border border-r-0 border-gray-300" aria-hidden="true">
                easylink.live/
              </span>
              <Input
                id="custom-slug"
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
                placeholder={t('modals.editFile.slugPlaceholder')}
                className="flex-1 rounded-l-none focus:ring-primary focus:border-primary"
                disabled={isLoading}
              />
            </div>
            <p className="text-xs text-gray-500">
              {t('modals.editFile.slugHelp')}
            </p>
          </div>
          
          {error && (
            <div className="p-3 bg-red-100 text-red-700 text-sm rounded-md border border-red-200" role="alert">
              {error}
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('common.saving')}
                </>
              ) : (
                t('common.save')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
