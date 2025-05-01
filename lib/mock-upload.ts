// Mock para upload local quando Supabase não estiver disponível
import { v4 as uuidv4 } from 'uuid';

interface MockFileData {
  id: string;
  fileName: string;
  fileType: string;
  url: string;
  customSlug: string | null;
}

// Uma função que simula o upload local e retorna dados semelhantes à API real
export async function mockUpload(file: File, userId: string, customSlug?: string): Promise<MockFileData> {
  // Simulamos uma operação assíncrona - 1 segundo para dar feedback visual ao usuário
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Criar um id único para o arquivo
  const id = uuidv4();
  
  // Determinar o tipo de arquivo baseado na extensão
  let fileType = 'unknown';
  if (file.name.endsWith('.pdf')) {
    fileType = 'pdf';
  } else if (file.name.endsWith('.ppt') || file.name.endsWith('.pptx')) {
    fileType = 'presentation';
  } else if (file.name.endsWith('.key')) {
    fileType = 'presentation';
  } else if (file.name.endsWith('.html') || file.name.endsWith('.htm')) {
    fileType = 'html';
  }
  
  // Gerar uma URL temporária local para o arquivo
  // Em um ambiente real, isso viria do Supabase
  // Usamos o URL.createObjectURL para criar uma referência local ao arquivo
  const url = URL.createObjectURL(file);
  
  // Armazenar dados localmente para permitir testes sem backend
  try {
    // Armazenar no localStorage para persistência entre recarregamentos
    const existingUploads = JSON.parse(localStorage.getItem('mockUploads') || '[]');
    existingUploads.push({
      id,
      fileName: file.name,
      fileType,
      url,
      customSlug: customSlug || null,
      userId,
      uploadedAt: new Date().toISOString()
    });
    localStorage.setItem('mockUploads', JSON.stringify(existingUploads));
  } catch (e) {
    console.warn('Não foi possível armazenar informações de upload no localStorage:', e);
  }
  
  // Retorna um objeto com a mesma estrutura da API real
  return {
    id,
    fileName: file.name,
    fileType,
    url,
    customSlug: customSlug || null
  };
}

// Função para recuperar um arquivo de mock por ID
export function getMockFileById(id: string): any {
  try {
    const uploads = JSON.parse(localStorage.getItem('mockUploads') || '[]');
    return uploads.find((upload: any) => upload.id === id) || null;
  } catch (e) {
    console.error('Erro ao buscar arquivo mock:', e);
    return null;
  }
}
