/**
 * Configuração e utilitários do Supabase para o EasyLink
 * Este arquivo fornece integrações robustas com o Supabase tanto para o cliente quanto para o servidor.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js"
import { v4 as uuidv4 } from "uuid"
import { supabaseConfig } from "./config"

// Verificação de ambiente
const isBrowser = typeof window !== "undefined"

// Configurações do Supabase
const getSupabaseUrl = () => {
  // Usar window para acessar variáveis de ambiente no browser
  if (isBrowser) {
    // No browser, as variáveis NEXT_PUBLIC estão disponíveis no objeto window
    // @ts-ignore - Tipagem do Next.js não inclui isso diretamente
    const envValue = typeof window !== 'undefined' && window.__NEXT_DATA__?.env?.NEXT_PUBLIC_SUPABASE_URL;
    if (envValue) return envValue;
  }
  
  // No servidor, podemos usar process.env diretamente
  // @ts-ignore - processé garantido no ambiente Node.js
  const url = typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL
  if (!url) {
    console.warn('NEXT_PUBLIC_SUPABASE_URL is not defined')
    return 'https://tkriavugbgqbmetwkfya.supabase.co' // Fallback URL
  }
  return url
}

const getSupabaseAnonKey = () => {
  // Usar window para acessar variáveis de ambiente no browser
  if (isBrowser) {
    // @ts-ignore - Tipagem do Next.js não inclui isso diretamente
    const envValue = typeof window !== 'undefined' && window.__NEXT_DATA__?.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (envValue) return envValue;
  }
  
  // No servidor, podemos usar process.env diretamente
  // @ts-ignore - processé garantido no ambiente Node.js
  const key = typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!key) {
    console.warn('NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined')
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrcmlhdnVnYmdxYm1ldHdrZnlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4NDY5ODcsImV4cCI6MjA2MTQyMjk4N30.JcVFmOYYuaRIGaiXNWMhbf-D1eOzlznUC43BWhBCuvI' // Fallback key
  }
  return key
}

const getSupabaseServiceKey = () => {
  // No contexto do navegador, não é possível acessar variáveis de ambiente do servidor
  if (isBrowser) return null
  
  // @ts-ignore - processé garantido no ambiente Node.js
  const key = typeof process !== 'undefined' && process.env?.SUPABASE_SERVICE_ROLE_KEY
  if (!key) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY is not defined')
    // Não fornecemos fallback para a service role key por motivos de segurança
    return null
  }
  return key
}

// Singleton para o cliente do navegador
let browserClient: SupabaseClient | null = null

/**
 * Obtém um cliente Supabase para uso no navegador
 * Usa o anonymous key para autenticação
 */
export const getSupabaseBrowserClient = (): SupabaseClient => {
  if (browserClient) return browserClient
  
  try {
    browserClient = createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
      auth: {
        persistSession: true,
        storageKey: "easylink-auth-storage",
        autoRefreshToken: true,
      },
    })
    return browserClient
  } catch (error) {
    console.error('Failed to create Supabase browser client:', error)
    throw new Error('Failed to initialize Supabase client')
  }
}

/**
 * Cria um cliente Supabase para uso no servidor
 * Usa a service role key para operações administrativas
 */
export const createServerClient = (): SupabaseClient => {
  // Verificamos se estamos no navegador
  if (isBrowser) {
    console.warn('createServerClient should not be called from browser context')
    // Utilizamos o cliente do navegador como fallback
    return getSupabaseBrowserClient()
  }
  
  const supabaseUrl = getSupabaseUrl()
  const serviceKey = getSupabaseServiceKey()
  
  if (!serviceKey) {
    throw new Error('Service role key is required for server operations')
  }
  
  try {
    return createClient(supabaseUrl, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  } catch (error) {
    console.error('Failed to create Supabase server client:', error)
    throw new Error('Failed to initialize Supabase server client')
  }
}

/**
 * Verifica se o bucket de armazenamento existe e o cria se necessário
 * Esta função deve ser chamada durante a inicialização do servidor
 */
export const ensureStorageBucketExists = async (retries = 3): Promise<boolean> => {
  try {
    if (isBrowser) return false
    
    const supabase = createServerClient()
    
    // Verificar se existe a service role key primeiro
    const serviceKey = getSupabaseServiceKey()
    if (!serviceKey) {
      console.error('Erro: SUPABASE_SERVICE_ROLE_KEY não está definida. Necessária para criar buckets.')
      return false
    }
    
    try {
      // Tentar listar buckets com tratamento de erro específico para JWT
      const { data: buckets, error } = await supabase.storage.listBuckets()
      
      if (error) {
        const errorMessage = error.message?.toLowerCase() || ''
        // Verificar se é erro de JWT
        if (errorMessage.includes('jwt') || errorMessage.includes('token') || errorMessage.includes('invalid signature')) {
          console.error('Erro de autenticação JWT com o Supabase:', error)
          
          // Tentar renovar o cliente Supabase e tentar novamente se ainda temos retries
          if (retries > 0) {
            console.log(`Tentando novamente... (${retries} restantes)`)
            // Criar um novo cliente
            browserClient = null // Resetar o singleton  
            return ensureStorageBucketExists(retries - 1)
          }
        }
        throw error
      }
      
      const filesBucketExists = buckets?.some(bucket => 
        bucket.name === supabaseConfig.storage.buckets.files
      )
      
      if (!filesBucketExists) {
        console.log(`Criando bucket de armazenamento: ${supabaseConfig.storage.buckets.files}`)
        const { error: createError } = await supabase.storage.createBucket(
          supabaseConfig.storage.buckets.files,
          { public: true }
        )
        
        if (createError) {
          console.error('Falha ao criar bucket de armazenamento:', createError)
          return false
        }
        
        // Configurar políticas de acesso público para o bucket
        console.log('Configurando políticas de acesso do bucket...')
        try {
          // Tentativa de definir políticas de acesso público
          const { error: policyError } = await supabase.storage.from(supabaseConfig.storage.buckets.files)
            .createSignedUrl('policy-setup-dummy.txt', 60) // Isso falha, mas podemos ignorar
          
          // Ignoramos o erro específico, pois o arquivo não existe,
          // mas queremos apenas verificar a conexão
        } catch (innerError) {
          // Erros aqui são esperados e podem ser ignorados
        }
      }
      
      return true
    } catch (innerError) {
      console.error('Erro interno verificando bucket:', innerError)
      return false
    }
  } catch (error) {
    console.error('Erro geral em ensureStorageBucketExists:', error)
    return false
  }
}

/**
 * Obtém ou cria um usuário anônimo
 * Usado para rastrear uploads de arquivos de usuários não autenticados
 */
export const getOrCreateAnonymousUser = async (retries = 2): Promise<string | null> => {
  // Verificamos se estamos no navegador
  if (!isBrowser) return null
  
  try {
    // Verificamos se temos um usuário no localStorage
    let anonymousUserId = localStorage.getItem("anonymousUserId")
    if (anonymousUserId) return anonymousUserId
    
    // Cria um novo ID no localStorage - sem tentar criar no banco de dados
    // Isso permite que a interface funcione mesmo sem conexão com o backend
    const newUserId = uuidv4()
    localStorage.setItem("anonymousUserId", newUserId)
    
    // Tenta registrar o usuário no banco de dados, mas não bloqueia se falhar
    try {
      console.log("Tentando registrar usuário anônimo no Supabase...")
      const supabase = getSupabaseBrowserClient()
      
      // Verificar se o usuário já existe
      const { data: existingUser, error: checkError } = await supabase
        .from(supabaseConfig.tables.users)
        .select('id')
        .eq('id', newUserId)
        .single()
      
      if (checkError && !checkError.message.includes('No rows found')) {
        console.warn("Erro ao verificar usuário existente:", checkError)
      }
      
      // Só inserir se o usuário ainda não existe
      if (!existingUser) {
        const { data, error } = await supabase
          .from(supabaseConfig.tables.users)
          .insert({
            id: newUserId,
            email: `anonymous-${newUserId}@example.com`,
            is_anonymous: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
        
        if (error) {
          // Verificar se o erro é de JWT ou autenticação
          const errorMsg = error.message?.toLowerCase() || ''
          if ((errorMsg.includes('jwt') || errorMsg.includes('authentication') || errorMsg.includes('permission')) && retries > 0) {
            console.warn("Problema de autenticação ao criar usuário anônimo. Tentando novamente...")
            // Forçar nova instância do cliente Supabase
            browserClient = null
            // Tentar novamente
            return getOrCreateAnonymousUser(retries - 1)
          }
          
          console.error("Erro ao inserir usuário anônimo:", error)
        } else {
          console.log("Usuário anônimo registrado com sucesso:", data)
        }
      } else {
        console.log("Usuário anônimo já existe no banco de dados")
      }
    } catch (dbError) {
      // Apenas log, não impede o uso da aplicação
      console.error("Falha ao registrar usuário anônimo no banco de dados:", dbError)
    }
    
    return newUserId
  } catch (error) {
    console.error("Erro em getOrCreateAnonymousUser:", error)
    // Retorna um ID temporário se tudo falhar
    return "temp-" + Math.random().toString(36).substring(2, 15)
  }
}
