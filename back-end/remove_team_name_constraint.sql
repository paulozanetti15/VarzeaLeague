-- Script para remover a restrição de unicidade do campo name na tabela teams
-- Você precisará executar este script diretamente no seu banco de dados MySQL

-- Identifica o nome exato da restrição
SELECT CONSTRAINT_NAME
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
WHERE TABLE_NAME = 'teams'
AND CONSTRAINT_TYPE = 'UNIQUE'
AND COLUMN_NAME = 'name';

-- Remove a restrição (substitua 'nome_da_restricao' pelo nome real identificado acima)
ALTER TABLE teams DROP INDEX teams_name_key;

-- Alternativa, se o nome exato não for teams_name_key
-- MySQL pode nomear automaticamente como name ou teams_name
ALTER TABLE teams DROP INDEX name;
-- ou
ALTER TABLE teams DROP INDEX teams_name; 