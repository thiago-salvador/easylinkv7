// /lib/file-conversion.ts

// ***** ATENÇÃO: LEIA OS AVISOS NO TOPO DESTE ARQUIVO *****
// Requer LibreOffice instalado no ambiente de execução.
// Pode não funcionar em serverless padrão (Vercel/Netlify).
// **********************************************************

import { createAdminClient } from "@/utils/supabase/admin"; // Cliente admin para storage
import { supabaseConfig } from "@/lib/config";
import libreofficeConvert from 'libreoffice-convert';
import fs from 'fs/promises'; // File System (async)
import path from 'path';     // Manipulação de caminhos
import os from 'os';         // Diretório temporário
import { promisify } from 'util'; // Converter callback para Promise
import { v4 as uuidv4 } from 'uuid'; // Nomes únicos

// Converte a função de callback do libreoffice para uma Promise
const convertAsync = promisify(libreofficeConvert.convert);

// --- Funções Auxiliares de Storage (Adapte se necessário) ---

async function downloadFromStorage(storagePath: string, destinationLocalPath: string): Promise<void> {
  console.log(`[LibreOffice Helper] Baixando: ${storagePath} -> ${destinationLocalPath}`);
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(supabaseConfig.storage.buckets.files)
    .download(storagePath);

  if (error) {
    console.error(`[LibreOffice Helper] Erro ao baixar ${storagePath}:`, error);
    throw new Error(`Falha ao baixar ficheiro do storage: ${error.message}`);
  }
  if (!data) {
    throw new Error(`Blob vazio recebido para ${storagePath}.`);
  }

  try {
    const buffer = Buffer.from(await data.arrayBuffer());
    await fs.writeFile(destinationLocalPath, buffer);
    console.log(`[LibreOffice Helper] Download concluído para ${destinationLocalPath}`);
  } catch (writeError) {
    console.error(`[LibreOffice Helper] Erro ao salvar ficheiro local ${destinationLocalPath}:`, writeError);
    throw new Error(`Falha ao salvar ficheiro baixado: ${(writeError as Error).message}`);
  }
}

async function uploadFileToStorage(newStoragePath: string, sourceLocalPath: string, contentType: string): Promise<string> {
  console.log(`[LibreOffice Helper] Fazendo upload: ${sourceLocalPath} -> ${newStoragePath}`);
  const supabase = createAdminClient();
  let fileBuffer;
  try {
     fileBuffer = await fs.readFile(sourceLocalPath);
     console.log(`[LibreOffice Helper] Ficheiro local ${sourceLocalPath} lido (${fileBuffer.length} bytes).`);
  } catch(readError) {
     console.error(`[LibreOffice Helper] Erro ao ler ficheiro local ${sourceLocalPath}:`, readError);
     throw new Error(`Falha ao ler ficheiro local convertido: ${(readError as Error).message}`);
  }

  const { data, error } = await supabase.storage
    .from(supabaseConfig.storage.buckets.files)
    .upload(newStoragePath, fileBuffer, {
      contentType: contentType,
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error(`[LibreOffice Helper] Erro ao fazer upload para ${newStoragePath}:`, error);
    throw new Error(`Falha ao fazer upload do PDF convertido: ${error.message}`);
  }

  console.log(`[LibreOffice Helper] Upload para ${newStoragePath} concluído.`);
  return newStoragePath;
}

/**
 * Converte uma apresentação (PPT, PPTX, Keynote) para PDF usando LibreOffice.
 * **AVISO:** Requer LibreOffice instalado no ambiente de execução.
 *
 * @param originalStoragePath Caminho do ficheiro original no Supabase Storage (ex: 'uploads/userid/file.pptx')
 * @param originalFilename Nome original do ficheiro (para gerar nome do PDF)
 * @returns O caminho do ficheiro PDF convertido no Supabase Storage em caso de sucesso, ou null em caso de falha.
 */
export async function convertPresentationToPDF(originalStoragePath: string, originalFilename: string): Promise<string | null> {
  console.log(`[LibreOffice Convert] Iniciando conversão para: ${originalStoragePath}`);
  const tempDir = path.join(os.tmpdir(), `easylink-convert-${uuidv4()}`); // Pasta temporária única
  const tempInputFilename = path.basename(originalStoragePath); // ex: file.pptx
  const tempInputPath = path.join(tempDir, tempInputFilename); // Caminho completo temporário de entrada
  // Gera nome para o ficheiro PDF de saída, mantendo a base do nome original
  const pdfOutputFilename = `${path.basename(originalFilename, path.extname(originalFilename))}.pdf`;
  const tempOutputPath = path.join(tempDir, pdfOutputFilename); // Caminho completo temporário de saída

  try {
    // 1. Criar diretório temporário
    await fs.mkdir(tempDir, { recursive: true });
    console.log(`[LibreOffice Convert] Diretório temporário criado: ${tempDir}`);

    // 2. Baixar o ficheiro original do Storage para o diretório temporário
    await downloadFromStorage(originalStoragePath, tempInputPath);

    // 3. Ler o ficheiro baixado para a memória (necessário para libreoffice-convert)
    const inputFileBuffer = await fs.readFile(tempInputPath);
    console.log(`[LibreOffice Convert] Ficheiro de entrada lido (${inputFileBuffer.length} bytes).`);

    // 4. Executar a conversão para PDF
    console.log(`[LibreOffice Convert] Iniciando conversão para PDF...`);
    // O segundo argumento 'undefined' é para o filtro, deixamos a biblioteca escolher
    const pdfBuffer = await convertAsync(inputFileBuffer, '.pdf', undefined);
    console.log(`[LibreOffice Convert] Conversão concluída (${pdfBuffer.length} bytes).`);

    // 5. Salvar o buffer PDF resultante no ficheiro temporário de saída
    await fs.writeFile(tempOutputPath, pdfBuffer);
    console.log(`[LibreOffice Convert] PDF convertido salvo em: ${tempOutputPath}`);

    // 6. Gerar o novo caminho no Supabase Storage para o PDF
    // Ex: uploads/userid/original-base-uuid.pdf
    const pdfStorageFilename = `${path.basename(originalFilename, path.extname(originalFilename))}-${uuidv4().substring(0,8)}.pdf`;
    const newPdfStoragePath = path.join(path.dirname(originalStoragePath), pdfStorageFilename);

    // 7. Fazer upload do ficheiro PDF temporário para o Supabase Storage
    await uploadFileToStorage(newPdfStoragePath, tempOutputPath, 'application/pdf');

    // 8. Retornar o novo caminho do PDF no Storage
    console.log(`[LibreOffice Convert] Conversão bem-sucedida! Novo path no Storage: ${newPdfStoragePath}`);
    return newPdfStoragePath;

  } catch (error: any) {
    console.error(`[LibreOffice Convert] ERRO durante a conversão:`, error);
    // Retorna null para indicar falha
    return null;
  } finally {
    // 9. Limpar o diretório temporário (importante!)
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
      console.log(`[LibreOffice Convert] Diretório temporário removido: ${tempDir}`);
    } catch (cleanupError) {
      console.error(`[LibreOffice Convert] Falha ao remover diretório temporário ${tempDir}:`, cleanupError);
      // Não lançar erro aqui, apenas logar
    }
  }
}

// --- Placeholder para ZIP (manter como está por enquanto) ---
export async function processZipFile(filePath: string): Promise<string | null> {
  console.warn(`[Processamento ZIP] Processamento para ${filePath} não implementado.`);
  return null;
}

