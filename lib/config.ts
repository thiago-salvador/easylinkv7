// /lib/config.ts

/**
 * Configuração centralizada
 */

// Configuração do Supabase
export const supabaseConfig = {
  tables: {
    files: "files",
    fileAccessLogs: "file_access_logs",
    users: "users",
  },
  storage: {
    buckets: {
      files: "files", // Nome do seu bucket de arquivos
    },
  },
  get projectUrlBase(): string | null {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!url) {
        if (typeof window === 'undefined') { // Log apenas no servidor
            console.warn("[Config] Aviso: NEXT_PUBLIC_SUPABASE_URL não está definida. CSP pode ficar incompleta.");
        }
        return null;
    }
    try {
        const parsedUrl = new URL(url);
        return parsedUrl.origin; // Retorna apenas https://dominio.com
    } catch (e) {
        console.error("[Config] Erro ao parsear NEXT_PUBLIC_SUPABASE_URL:", e);
        return null; // Retorna null em caso de erro de parsing
    }
  }
};

// Limites da aplicação
export const appLimits = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFileTypes: [
    "application/pdf",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.apple.keynote",
    "text/html",
    "application/zip",
  ],
  allowedExtensions: [".pdf", ".ppt", ".pptx", ".key", ".html", ".htm", ".zip"]
};

// URLs da aplicação
export const appUrls = {
  getBaseUrl: (): string => {
    if (typeof window !== "undefined") return window.location.origin;
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  },
};

// Configuração de segurança
export const securityConfig = {
  iframeSandbox: "allow-scripts allow-same-origin allow-forms allow-popups allow-modals",
  contentSecurityPolicy: {
    // --- CSP REFINADA ---
    'default-src': ["'self'", "blob:", "data:", "https:"],
    'script-src': [
      "'self'",
      "'unsafe-inline'", // RISCO: Tentar remover
      "'unsafe-eval'",   // RISCO: Tentar remover
      "https://unpkg.com",
      "https://cdn.jsdelivr.net",
      "https://js.stripe.com", // <-- GARANTIR QUE ESTÁ AQUI
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'", // RISCO: Tentar remover
      "https://fonts.googleapis.com",
      "https://fonts.gstatic.com",
    ],
    'img-src': ["'self'", "data:", "blob:", "https:"],
    'font-src': ["'self'", "https://fonts.gstatic.com", "data:"],
    'connect-src': [
      "'self'",
      "https://unpkg.com",
      "https://cdn.jsdelivr.net",
      "https://api.stripe.com", // <-- GARANTIR QUE ESTÁ AQUI
      "https:", // Permite outras conexões HTTPS (Supabase, etc.)
    ].filter(Boolean),
    'frame-src': [
        "'self'",
        "blob:",
        "data:",
        "https://js.stripe.com", // <-- GARANTIR QUE ESTÁ AQUI
        supabaseConfig.projectUrlBase || '',
    ].filter(Boolean),
    'worker-src': ["'self'", "blob:", "https://cdn.jsdelivr.net"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    // 'frame-ancestors': ["'none'"], // Descomente para produção
    // 'upgrade-insecure-requests': [], // Descomente se for apenas HTTPS
  },
};

// Scripts SQL (mantidos)
export const sqlScripts = {
  createTables: `
    -- Habilitar a extensão UUID se não existir
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- Tabela de usuários (Exemplo)
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email TEXT UNIQUE,
      is_anonymous BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Tabela de arquivos (Verifique se corresponde à sua tabela real)
    CREATE TABLE IF NOT EXISTS files (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      filename TEXT NOT NULL,
      original_filename TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_size BIGINT NOT NULL,
      file_path TEXT NOT NULL UNIQUE,
      content_type TEXT NOT NULL,
      custom_slug TEXT UNIQUE,
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      view_count INTEGER DEFAULT 0,
      is_premium BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT filename_not_empty CHECK (filename <> ''),
      CONSTRAINT original_filename_not_empty CHECK (original_filename <> ''),
      CONSTRAINT file_path_not_empty CHECK (file_path <> '')
    );

    -- Tabela de logs de acesso (Exemplo)
    CREATE TABLE IF NOT EXISTS file_access_logs (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      file_id UUID REFERENCES files(id) ON DELETE CASCADE,
      ip_address TEXT,
      user_agent TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Índices (Exemplo)
    CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
    CREATE INDEX IF NOT EXISTS idx_files_custom_slug ON files(custom_slug);
    CREATE INDEX IF NOT EXISTS idx_file_access_logs_file_id ON file_access_logs(file_id);
  `,

  securityPolicies: `
    -- Habilitar RLS (Exemplo)
    ALTER TABLE files ENABLE ROW LEVEL SECURITY;
    ALTER TABLE file_access_logs ENABLE ROW LEVEL SECURITY;
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;

    -- Arquivos: Leitura pública (Exemplo - ajuste se precisar de restrições)
    DROP POLICY IF EXISTS "Allow public read access to files" ON files;
    CREATE POLICY "Allow public read access to files"
    ON files FOR SELECT USING (true);

    -- Arquivos: Criação autenticada
    DROP POLICY IF EXISTS "Allow authenticated insert for own files" ON files;
    CREATE POLICY "Allow authenticated insert for own files"
    ON files FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid());

    -- Arquivos: Atualização pelo dono
    DROP POLICY IF EXISTS "Allow authenticated update for own files" ON files;
    CREATE POLICY "Allow authenticated update for own files"
    ON files FOR UPDATE USING (auth.role() = 'authenticated' AND user_id = auth.uid());

    -- Arquivos: Deleção pelo dono
    DROP POLICY IF EXISTS "Allow authenticated delete for own files" ON files;
    CREATE POLICY "Allow authenticated delete for own files"
    ON files FOR DELETE USING (auth.role() = 'authenticated' AND user_id = auth.uid());

    -- Logs: Inserção permitida (simplificado - restrinja se necessário)
    DROP POLICY IF EXISTS "Allow insert access logs" ON file_access_logs;
    CREATE POLICY "Allow insert access logs"
    ON file_access_logs FOR INSERT WITH CHECK (true);

    -- Usuários: Acesso próprio
    DROP POLICY IF EXISTS "Allow individual user access" ON users;
    CREATE POLICY "Allow individual user access"
    ON users FOR ALL USING (auth.uid() = id);
  `,
};
