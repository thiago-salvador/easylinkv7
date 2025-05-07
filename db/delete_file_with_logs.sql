-- db/delete_file_with_logs.sql
-- Função para excluir um arquivo e seus registros de acesso de forma atômica

-- Criar a função
CREATE OR REPLACE FUNCTION delete_file_with_logs(file_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Executa com os privilégios do criador da função
AS $$
BEGIN
  -- Primeiro excluir os registros de acesso
  DELETE FROM file_access_logs WHERE file_id = file_id_param;
  
  -- Depois excluir o arquivo
  DELETE FROM files WHERE id = file_id_param;
END;
$$;

-- Conceder permissões para o serviço anon e service_role
GRANT EXECUTE ON FUNCTION delete_file_with_logs(UUID) TO anon, authenticated, service_role;
