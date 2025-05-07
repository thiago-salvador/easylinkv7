"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Upload, File, X, Loader2, Check, Copy, LinkIcon, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { v4 as uuidv4 } from "uuid"
import { useLanguage } from "@/lib/language-context"
// import { mockUpload } from "@/lib/mock-upload"; // Mantenha se precisar de fallback local

interface FileUploadProps {
  onUploadComplete?: (fileData: any) => void
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
  // Usar o hook de internacionalização
  const { t } = useLanguage();
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [customSlug, setCustomSlug] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [fileData, setFileData] = useState<any>(null) // Considere usar um tipo mais específico
  const [copySuccess, setCopySuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize anonymous user ID using localStorage
  useEffect(() => {
    const initUser = () => {
      try {
        let anonymousId = localStorage.getItem("anonymousUserId")
        if (!anonymousId) {
          anonymousId = uuidv4()
          localStorage.setItem("anonymousUserId", anonymousId)
        }
        setUserId(anonymousId)
      } catch (err) {
        console.error("FileUpload: Error initializing anonymous user ID:", err)
        // Fallback ID in case localStorage fails
        const fallbackId = "anonymous-" + uuidv4().substring(0, 8);
        setUserId(fallbackId)
      }
    }
    initUser()
  }, [])

  // --- Event Handlers ---

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    setError(null)
    if (e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0])
    }
  }

  const handleButtonClick = () => {
    if (fileInputRef.current) {
        fileInputRef.current.click();
    } else {
        console.error("FileUpload: File input reference not found!");
        setError(t('fileUpload.fileSelectionError'))
    }
  }

  // --- File Handling ---

  const handleFileSelection = (file: File) => {
    // Basic validation (can be enhanced)
    const allowedTypes = [
      "application/pdf",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.apple.keynote",
      "text/html",
      "application/zip",
    ]
    const allowedExtensions = [".pdf", ".ppt", ".pptx", ".key", ".html", ".htm", ".zip"];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    // Check if either MIME type is allowed or if it's an HTML/HTM file by extension
    const isValidType = allowedTypes.includes(file.type) || ['.html', '.htm'].includes(fileExtension) || ['.ppt', '.pptx', '.key', '.zip', '.pdf'].includes(fileExtension);


    if (!isValidType) {
      setError(t('fileUpload.unsupportedFileType'))
      return
    }

    // Check file size (e.g., 10MB limit)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      setError(t('fileUpload.fileTooLarge', { maxSize: MAX_FILE_SIZE / 1024 / 1024 }))
      return
    }

    setSelectedFile(file)
    setError(null); // Clear previous errors
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setCustomSlug("")
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "" // Reset file input value
    }
  }

  // --- Upload Logic ---

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Selecione um arquivo.")
      return
    }
    if (!userId) {
      setError("ID do usuário não inicializado. Recarregue a página.")
      return;
    }

    // Definir estados de forma agrupada para evitar renderizações parciais
    setIsUploading(true)
    setUploadProgress(0)
    setError(null)
    setUploadSuccess(false);

    let uploadTimer: NodeJS.Timeout | null = null;
    let isMounted = true; // Flag para verificar se o componente ainda está montado

    try {
      // Simulate progress visually
      uploadTimer = setInterval(() => {
        if (isMounted) {
          setUploadProgress(prev => Math.min(prev + 10, 90));
        }
      }, 300);

      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("userId", userId)
      if (customSlug) {
        // Basic slug sanitization (allow letters, numbers, hyphen, underscore)
        const sanitizedSlug = customSlug.trim().replace(/[^a-zA-Z0-9-_]/g, '');
        if (sanitizedSlug) {
             formData.append("customSlug", sanitizedSlug);
        }
      }

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(120000), // 120 seconds timeout for potential conversion
      })

      if (uploadTimer) {
        clearInterval(uploadTimer);
        uploadTimer = null;
      }

      // Verificar se o componente ainda está montado antes de atualizar o estado
      if (!isMounted) return;

      if (!response.ok) {
        let errorMessage = `Erro no servidor (${response.status})`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || `Erro desconhecido do servidor.`;
          console.error("API Error Details:", errorData.details || errorData);
        } catch (jsonError) {
           const textError = await response.text();
           errorMessage = `${errorMessage}: ${textError.substring(0, 150)}`; // Show part of the error text
           console.error("API Non-JSON Error:", textError);
        }
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      
      // Verificar novamente se o componente está montado antes de atualizar estados
      if (!isMounted) return;
      
      // Agrupar atualizações de estado para minimizar renderizações
      setUploadProgress(100);
      setFileData(responseData);
      
      // Pequeno atraso antes de definir o sucesso para garantir que a transição de estado seja suave
      setTimeout(() => {
        if (isMounted) {
          setUploadSuccess(true);
          setIsUploading(false);
          
          if (onUploadComplete) {
            onUploadComplete(responseData);
          }
        }
      }, 100);
    } catch (err: any) {
      if (uploadTimer) {
        clearInterval(uploadTimer);
        uploadTimer = null;
      }
      
      // Verificar se o componente ainda está montado antes de atualizar o estado
      if (!isMounted) return;
      
      console.error("FileUpload: Erro no handleUpload:", err);
      setError(err.name === 'TimeoutError' ? 'Tempo limite de upload excedido.' : (err.message || "Falha no upload. Tente novamente."));
      setUploadProgress(0);
      setIsUploading(false);
    }
    
    // Função de limpeza para quando o componente for desmontado durante o upload
    return () => {
      isMounted = false;
      if (uploadTimer) {
        clearInterval(uploadTimer);
      }
    };
  }

  // --- Success State Functions ---

  const handleCopyLink = () => {
    if (!fileData) return;
    const fileUrl = getFileUrl();
    navigator.clipboard.writeText(fileUrl).then(
      () => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      },
      (err) => {
        console.error("FileUpload: Falha ao copiar link:", err);
        setError("Falha ao copiar link.");
      },
    );
  }

  const getFileUrl = () => {
    if (!fileData) return "";
    const baseUrl = window.location.origin;
    return fileData.customSlug ? `${baseUrl}/${fileData.customSlug}` : `${baseUrl}/view/${fileData.id}`;
  }

  const resetForm = () => {
    // Usar setTimeout para garantir que a manipulação do DOM ocorra no próximo ciclo de renderização
    setTimeout(() => {
      // Agrupar atualizações de estado para minimizar renderizações e evitar problemas de DOM
      setSelectedFile(null);
      setCustomSlug("");
      setUploadSuccess(false);
      setFileData(null);
      setError(null);
      setUploadProgress(0);
      setIsDragging(false);
      setIsUploading(false);
      
      // Garantir que o fileInputRef ainda existe antes de tentar acessá-lo
      if (fileInputRef.current) {
        try {
          fileInputRef.current.value = "";
        } catch (error) {
          console.error("Erro ao resetar o input de arquivo:", error);
        }
      }
    }, 0);
  }

  // --- Render ---

  // Efeito para lidar com a limpeza quando o componente é desmontado
  useEffect(() => {
    return () => {
      // Função de limpeza para garantir que não haja manipulação do DOM após desmontagem
      // Não podemos atribuir null diretamente ao current pois é somente leitura
      // Apenas garantimos que qualquer manipulação pendente seja cancelada
      try {
        // Limpeza adicional se necessário
        console.log("Componente FileUpload desmontado");
      } catch (error) {
        console.error("Erro durante a limpeza do componente:", error);
      }
    };
  }, []);

  // Success Screen
  if (uploadSuccess && fileData) {
    try {
      const fileUrl = getFileUrl();
      return (
        <div className="bg-white p-6 rounded-xl text-center shadow-lg border border-gray-200">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" aria-hidden="true" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{t('fileUpload.uploadComplete')}</h3>
          <p className="text-gray-600 mb-6">{t('fileUpload.fileReady')}</p>
          <div className="flex items-center mb-6 relative bg-gray-50 rounded-lg border border-gray-200 p-2">
            <LinkIcon className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" aria-hidden="true" />
            <input
               type="text"
               readOnly
               value={fileUrl}
               className="truncate flex-1 text-sm text-gray-800 bg-transparent border-none focus:ring-0 p-0"
               aria-label={t('fileUpload.generatedFileLink')}
            />
            <Button variant="ghost" size="sm" className="ml-2 flex-shrink-0" onClick={handleCopyLink} aria-label={copySuccess ? t('fileUpload.linkCopied') : t('fileUpload.copyLink')}>
              {copySuccess ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              className="w-full sm:w-auto flex-1 bg-primary text-white hover:bg-primary/90"
              onClick={() => window.open(fileUrl, "_blank")}
              aria-label={t('fileUpload.openInNewTab')}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              {t('fileUpload.accessLink')}
            </Button>
            <Button variant="outline" className="w-full sm:w-auto flex-1" onClick={resetForm} aria-label={t('fileUpload.uploadNew')}>
              {t('fileUpload.uploadNew')}
            </Button>
          </div>
        </div>
      );
    } catch (error) {
      console.error("Erro ao renderizar tela de sucesso:", error);
      // Em caso de erro na renderização da tela de sucesso, resetar para o estado inicial
      setTimeout(() => resetForm(), 0);
      return null; // Retornar null para evitar erros de renderização
    }
  }

  // Main Upload Form
  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        className={cn(
          "border-2 border-dashed rounded-xl p-6 transition-all duration-300 relative text-center",
          isDragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-gray-300 hover:border-primary/50",
          isUploading && "border-primary bg-primary/5",
          error ? "border-red-500 bg-red-50" : ""
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button" // Make the whole area behave like a button for accessibility
        tabIndex={0} // Make it focusable
        onClick={!selectedFile && !isUploading ? handleButtonClick : undefined} // Click area only if no file selected
        onKeyDown={(e) => { if (!selectedFile && !isUploading && (e.key === 'Enter' || e.key === ' ')) handleButtonClick(); }} // Allow activation with Enter/Space
        aria-label={selectedFile ? "Área de upload de arquivo com arquivo selecionado" : "Área para selecionar ou arrastar arquivo"}
        aria-disabled={isUploading} // Indicate disabled state during upload
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          className="hidden"
          accept=".pdf,.ppt,.pptx,.key,.html,.htm,.zip,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.apple.keynote,text/html,application/zip"
          aria-hidden="true"
          disabled={isUploading} // Disable input during upload
        />

        {/* Initial State */}
        {!selectedFile && !isUploading && (
          <div className="flex flex-col items-center justify-center gap-4 pointer-events-none">
             <div className="flex items-center justify-center gap-4">
               <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center shadow-sm">
                 <Upload className={cn("w-6 h-6", isDragging ? "text-primary" : "text-gray-500")} aria-hidden="true" />
               </div>
               <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center shadow-sm">
                 <File className={cn("w-6 h-6", isDragging ? "text-primary" : "text-gray-500")} aria-hidden="true" />
               </div>
             </div>
             <div className="text-center">
               <p className="text-sm sm:text-base text-gray-600 mb-1 leading-relaxed">
                 <span className="font-medium text-primary">{t('home.clickHere')}</span> {t('home.dragAndDrop')}
               </p>
               <p className="text-xs text-gray-500">{t('home.supportedFormats')}</p>
             </div>
          </div>
        )}

        {/* File Selected State */}
        {selectedFile && !isUploading && (
          <div className="flex flex-col gap-4">
            {/* File Info */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                  <File className="w-5 h-5 text-primary" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate" title={selectedFile.name}>{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleRemoveFile} className="text-gray-500 hover:text-red-600 flex-shrink-0 ml-2" aria-label="Remover arquivo selecionado">
                <X className="w-5 h-5" />
              </Button>
            </div>
            {/* Custom Slug & Upload Button */}
            <div className="space-y-4">
              <div>
                <label htmlFor="custom-slug" className="block text-sm font-medium text-gray-700 mb-1 text-left">
                  {t('fileUpload.customLink')}
                </label>
                <div className="flex items-center">
                  <span className="text-gray-500 text-sm mr-1 bg-gray-100 px-2 py-2 rounded-l-md border border-r-0 border-gray-300" aria-hidden="true">{t('fileUpload.urlPrefix')}</span>
                  <Input
                    id="custom-slug"
                    aria-label="Insira o link personalizado desejado (opcional)"
                    placeholder={t('fileUpload.linkPlaceholder')}
                    value={customSlug}
                    onChange={(e) => setCustomSlug(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))} // Basic sanitization
                    className="flex-1 rounded-l-none focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
              <Button
                onClick={handleUpload}
                className="w-full relative overflow-hidden bg-gradient-to-r from-primary to-secondary hover:shadow-md transition-all duration-300"
                aria-label="Fazer upload do arquivo selecionado"
              >
                {t('fileUpload.uploadButton')}
              </Button>
            </div>
          </div>
        )}

         {/* Uploading State */}
         {isUploading && (
            <div className="flex flex-col items-center justify-center gap-4" aria-live="polite">
                 <Loader2 className="w-10 h-10 animate-spin text-primary" aria-hidden="true" />
                 <p className="text-sm text-gray-600">{t('fileUpload.uploading')} {uploadProgress}%</p>
                 <div className="w-full bg-gray-200 rounded-full h-2.5" role="progressbar" aria-valuenow={uploadProgress} aria-valuemin={0} aria-valuemax={100}>
                     <div
                         className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-out"
                         style={{ width: `${uploadProgress}%` }}
                     ></div>
                 </div>
            </div>
         )}

        {/* Error Message Area */}
        {error && !isUploading && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 text-sm rounded-md border border-red-200" role="alert">
                {error}
            </div>
        )}
      </div>
    </div>
  );
}
