// Este arquivo centraliza a configuração do worker do PDF.js
import { pdfjs } from 'react-pdf';

// CDN definitivo para o worker do PDF.js - usamos v4.8.69 para compatibilidade
const WORKER_CDN_URL = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.8.69/build/pdf.worker.min.js';

// Função que configura o worker com abordagem robusta
export function setupPdfWorker() {
  // Evitar execução no lado do servidor
  if (typeof window === 'undefined') {
    return;
  }

  // Garantir que só configuramos o worker uma vez
  if (pdfjs.GlobalWorkerOptions.workerSrc) {
    return;
  }

  // Usar CDN mais confiável (jsdelivr) para evitar problemas de CORS
  pdfjs.GlobalWorkerOptions.workerSrc = WORKER_CDN_URL;

  // Console log para debug
  console.log('PDF.js worker configurado com sucesso');
}
