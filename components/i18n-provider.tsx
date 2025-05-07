"use client";

import { useEffect } from "react";
import { initializeI18n } from "@/i18n";

// Este componente garante que o i18n seja inicializado apenas no cliente
export function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Inicializar i18n quando o componente for montado (apenas no cliente)
    initializeI18n();
  }, []);

  return <>{children}</>;
}
