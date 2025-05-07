-- db/exec_sql_function.sql
-- Função para executar SQL diretamente

-- Criar a função
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Executa com os privilégios do criador da função
AS $$
BEGIN
  EXECUTE sql;
END;
$$;

-- Conceder permissões para o serviço anon e service_role
GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;
