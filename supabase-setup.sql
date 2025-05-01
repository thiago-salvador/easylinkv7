-- Script de configuração completa para o EasyLink v4
-- Execute este script no SQL Editor do Supabase para configurar seu novo projeto

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários (incluindo usuários anônimos)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_anonymous BOOLEAN DEFAULT FALSE
);

-- Tabela de arquivos
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_path TEXT NOT NULL,
  content_type TEXT NOT NULL,
  custom_slug TEXT UNIQUE,
  user_id UUID REFERENCES users(id),
  view_count INTEGER DEFAULT 0,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de logs de acesso aos arquivos
CREATE TABLE IF NOT EXISTS file_access_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_id UUID REFERENCES files(id),
  ip_address TEXT,
  user_agent TEXT,
  referer TEXT,
  country TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para otimização de performance
CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_custom_slug ON files(custom_slug);
CREATE INDEX IF NOT EXISTS idx_file_access_logs_file_id ON file_access_logs(file_id);
CREATE INDEX IF NOT EXISTS idx_files_file_type ON files(file_type);
CREATE INDEX IF NOT EXISTS idx_files_created_at ON files(created_at);

-- Criar bucket de armazenamento
-- Nota: Esta parte deve ser executada usando o cliente administrativo do Supabase
-- ou criada manualmente através da interface, pois o SQL não pode criar buckets.

-- Configurar RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_access_logs ENABLE ROW LEVEL SECURITY;

-- Políticas PERMISSIVAS para desenvolvimento (remova ou altere em produção)
-- Esta política permite acesso total para facilitar o desenvolvimento inicial
CREATE POLICY "Allow full access during development" 
ON users FOR ALL 
USING (true);

CREATE POLICY "Allow full access during development" 
ON files FOR ALL 
USING (true);

CREATE POLICY "Allow full access during development" 
ON file_access_logs FOR ALL 
USING (true);

-- NOTA: Para produção, você deve remover as políticas acima e usar as mais restritivas abaixo

-- POLÍTICAS DE PRODUÇÃO (COMENTADAS PARA DESENVOLVIMENTO)
/*
-- Políticas para tabela "files"
CREATE POLICY "Users can view their own files" 
ON files FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own files" 
ON files FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own files" 
ON files FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own files" 
ON files FOR DELETE 
USING (user_id = auth.uid());

-- Política para permitir acesso anônimo a arquivos com slug personalizado
CREATE POLICY "Anyone can view files with custom slug" 
ON files FOR SELECT 
USING (custom_slug IS NOT NULL);

-- Políticas para tabela "file_access_logs"
CREATE POLICY "Users can insert access logs for their files" 
ON file_access_logs FOR INSERT 
WITH CHECK (
  file_id IN (SELECT id FROM files WHERE user_id = auth.uid())
);

CREATE POLICY "Users can view access logs for their files" 
ON file_access_logs FOR SELECT 
USING (
  file_id IN (SELECT id FROM files WHERE user_id = auth.uid())
);
*/

-- Inserir um usuário anônimo de sistema para uploads administrativos
INSERT INTO users (id, email, is_anonymous)
VALUES ('00000000-0000-0000-0000-000000000000', 'system@easylinkv4.local', true)
ON CONFLICT (email) DO NOTHING;

-- Configurar função para atualizar o timestamp "updated_at"
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Adicionar triggers para atualizar automaticamente o campo "updated_at"
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_files_updated_at
BEFORE UPDATE ON files
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Função para incrementar automaticamente a contagem de visualizações
CREATE OR REPLACE FUNCTION increment_view_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE files
    SET view_count = view_count + 1
    WHERE id = NEW.file_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para incrementar a contagem de visualizações quando um log de acesso é inserido
CREATE TRIGGER increment_file_view_count
AFTER INSERT ON file_access_logs
FOR EACH ROW
EXECUTE FUNCTION increment_view_count();

-- Concluir com mensagem de confirmação
DO $$
BEGIN
    RAISE NOTICE 'Configuração do banco de dados EasyLink concluída com sucesso!';
END $$;
