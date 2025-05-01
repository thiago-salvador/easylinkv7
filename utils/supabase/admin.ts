import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Cria um cliente administrativo do Supabase usando a chave de serviço
// Esse cliente tem permissões administrativas e deve ser usado APENAS no servidor
export const createAdminClient = (): SupabaseClient => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl) {
    throw new Error('Variável de ambiente NEXT_PUBLIC_SUPABASE_URL não está configurada')
  }
  
  if (!supabaseServiceKey) {
    throw new Error('Variável de ambiente SUPABASE_SERVICE_ROLE_KEY não está configurada - é necessário obter essa chave no painel do Supabase em Project Settings > API')
  }

  try {
    return createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  } catch (error) {
    console.error('Erro ao criar cliente Supabase administrativo:', error)
    throw new Error(`Falha ao inicializar cliente Supabase: ${error instanceof Error ? error.message : String(error)}`)
  }
}
