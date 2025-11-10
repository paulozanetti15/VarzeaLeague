#!/bin/bash

set -e  # Parar em caso de erro

echo "🚀 Iniciando deploy do Varzea League..."

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erro: Execute este script no diretório back-end${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Instalando dependências...${NC}"
npm install

echo -e "${YELLOW}📝 Verificando arquivo .env...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Arquivo .env não encontrado!${NC}"
    echo -e "${YELLOW}📋 Copie o arquivo .env.example para .env e configure as variáveis${NC}"
    exit 1
fi

echo -e "${YELLOW}🗄️ Executando migrações do banco de dados...${NC}"
npm run migrate

echo -e "${YELLOW}📁 Criando diretórios de upload...${NC}"
mkdir -p uploads/teams uploads/championships logs

echo -e "${YELLOW}🔄 Reiniciando aplicação com PM2...${NC}"
pm2 restart varzea-backend || pm2 start ecosystem.config.js

echo -e "${GREEN}✅ Deploy concluído com sucesso!${NC}"
echo -e "${YELLOW}📊 Verifique o status com: pm2 status${NC}"
echo -e "${YELLOW}📋 Veja os logs com: pm2 logs varzea-backend${NC}"

