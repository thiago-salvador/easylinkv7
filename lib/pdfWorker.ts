// Este arquivo centraliza a configuração do worker do PDF.js
import { pdfjs } from 'react-pdf';

// Função que configura o worker com abordagem robusta seguindo as melhores práticas
export function setupPdfWorker() {
  // Evitar execução no lado do servidor
  if (typeof window === 'undefined') {
    return;
  }

  // Garantir que só configuramos o worker uma vez
  if (pdfjs.GlobalWorkerOptions.workerSrc) {
    return;
  }

  try {
    // Usar a abordagem recomendada com import.meta.url para maior compatibilidade
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url,
    ).toString();
  } catch (error) {
    // Fallback para CDN em caso de erro com import.meta.url
    const WORKER_CDN_URL = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
    pdfjs.GlobalWorkerOptions.workerSrc = WORKER_CDN_URL;
    console.warn('Usando CDN fallback para PDF.js worker devido a:', error);
  }

  // Log apenas em ambiente de desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.log(`PDF.js worker v${pdfjs.version} configurado com sucesso`);
  }
}
