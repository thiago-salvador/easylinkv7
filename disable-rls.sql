-- Desativar RLS para a tabela files para desenvolvimento
ALTER TABLE files DISABLE ROW LEVEL SECURITY;

-- Desativar RLS para a tabela storage.objects para desenvolvimento
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
