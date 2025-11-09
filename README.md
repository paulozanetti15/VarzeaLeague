# ⚽ Várzea League

Sistema web para gestão de campeonatos de futebol amador.

---

## 📋 Sobre o Projeto

O **Várzea League** é uma aplicação full-stack que permite criar e gerenciar times, jogadores, campeonatos e partidas amistosas de futebol amador. O sistema possui controle de acesso baseado em roles (4 níveis), estatísticas completas, geração de súmulas e rankings automáticos.

---

## 🚀 Funcionalidades

### 🏆 Gestão de Campeonatos
- Criação de campeonatos (Liga, Mata-Mata ou Misto)
- Sistema de inscrição e aprovação de times
- Criação de grupos e chaveamento
- Controle de status (Aberto, Em andamento, Finalizado)
- Declaração de campeão e vice-campeão
- Ranking automático com pontos, vitórias, derrotas e saldo de gols

### ⚽ Gestão de Partidas
- Partidas de campeonato
- Partidas amistosas independentes
- Definição de local, data, horário e duração
- Sistema de inscrição para partidas amistosas
- Controle de status das partidas
- Registro de mandante e visitante

### 📝 Súmulas Digitais
- Registro de gols vinculados a jogadores
- Registro de cartões amarelos e vermelhos
- Sistema de punições e advertências
- Placar final automático
- Histórico completo de eventos da partida

### 👥 Gestão de Times
- Cadastro de times com perfil completo
- Banner customizável e cores personalizadas
- Definição de capitão e membros do time
- Gerenciamento de elenco de jogadores
- Histórico de participações
- Estatísticas do time
- Soft delete (reativação de times)

### 👤 Gestão de Jogadores
- Cadastro de jogadores (nome, posição, gênero, data de nascimento)
- Vinculação a múltiplos times
- Reutilização de jogadores sem vínculo
- Estatísticas individuais (gols, cartões, jogos)
- Soft delete

### 📊 Rankings e Estatísticas
- Ranking de artilharia geral
- Ranking de artilharia por campeonato
- Classificação de times por campeonato
- Histórico detalhado de times
- Estatísticas de jogadores filtradas por time
- Aproveitamento e média de gols

### 📄 Relatórios em PDF
- Súmulas de partidas
- Estatísticas de jogadores do time
- Classificação de campeonatos
- Histórico de times
- Ranking de artilharia

### 🔐 Sistema de Usuários
- Cadastro com validação de CPF
- Autenticação JWT
- 4 níveis hierárquicos de acesso
- Recuperação de senha via email
- Perfil editável
- Senhas criptografadas

### 📅 Calendário Integrado
- Visualização unificada de partidas e campeonatos
- Múltiplas visões (mês, semana, dia, lista)
- Filtros por tipo, status e time
- Cores customizadas por status
- Sincronização em tempo real

### 🎯 Dashboard e Overview
- Estatísticas gerais do sistema
- Total de times, jogadores e campeonatos
- Gols e cartões distribuídos
- Gráficos interativos com ECharts
- Média de gols por partida

---

## 👥 Níveis de Acesso (Roles)

### 1️⃣ Admin Master (ID: 1)
**Acesso total ao sistema**

✅ Gerenciamento completo de usuários (CRUD)  
✅ Gestão de todos os campeonatos  
✅ Gestão de todas as partidas amistosas  
✅ Gestão de todos os times  
✅ Visualização de dashboard e overview do sistema  
✅ Acesso ao calendário completo  
✅ Geração de todos os relatórios  

### 2️⃣ Admin de Eventos (ID: 2)
**Gerenciamento de competições**

✅ Criar, editar e excluir campeonatos  
✅ Criar, editar e excluir partidas amistosas  
✅ Aprovar inscrições de times em campeonatos  
✅ Criar e gerenciar grupos de campeonatos  
✅ Registrar súmulas e estatísticas  
✅ Aplicar punições e advertências  
✅ Visualizar rankings e classificações  
✅ Gerar relatórios de competições  
❌ Não pode gerenciar usuários  
❌ Não pode editar times de outros capitães  

### 3️⃣ Admin de Times (ID: 3)
**Gerenciamento do próprio time**

✅ Criar UM time (único)  
✅ Editar dados do próprio time (nome, cores, localização, banner)  
✅ Adicionar membros ao time  
✅ Gerenciar elenco (adicionar/remover jogadores)  
✅ Inscrever-se em campeonatos  
✅ Visualizar histórico do time  
✅ Gerar relatórios de estatísticas dos jogadores do time  
✅ Visualizar rankings e calendário  
✅ Confirmar presença em partidas amistosas  
❌ Não pode criar/editar campeonatos ou partidas  
❌ Não pode gerenciar outros times  

### 4️⃣ Usuário Comum (ID: 4)
**Apenas visualização**

✅ Visualizar lista de campeonatos públicos  
✅ Visualizar lista de partidas públicas  
✅ Ver rankings de times e jogadores  
✅ Acessar calendário de eventos  
✅ Ver detalhes de times e jogadores  
❌ Não pode criar times, campeonatos ou partidas  
❌ Não pode editar nada  

## ⚙ Instalação

### Pré-requisitos

- Node.js 18+
- MySQL 8.0+
- npm ou yarn

### 1. Clonar o Repositório

```bash
git clone https://github.com/paulozanetti15/VarzeaLeague.git
cd VarzeaLeague
```

### 2. Configurar Backend

```bash
cd back-end
npm install
```

Criar arquivo `.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=varzealeague
DB_PORT=3306

JWT_SECRET=sua_chave_secreta_super_segura

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_de_app

PORT=3001
NODE_ENV=development
```

Criar banco de dados:

```bash
mysql -u root -p
CREATE DATABASE varzealeague CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit
```

Executar migrations:

```bash
npm run migrate
```

Iniciar servidor:

```bash
npm run dev
```

Backend rodando em `http://localhost:3001`

### 3. Configurar Frontend

```bash
cd ../Front-end
npm install
```

Criar arquivo `.env`:

```env
VITE_API_URL=http://localhost:3001/api
```

Iniciar servidor:

```bash
npm run dev
```

Frontend rodando em `http://localhost:5173`

## 📄 Licença

Projeto educacional open source.

---

## 🔗 Links

- **Repositório**: [github.com/paulozanetti15/VarzeaLeague](https://github.com/paulozanetti15/VarzeaLeague)
- **Documentação API**: Swagger disponível em `/api-docs` quando servidor rodando

---

**Várzea League** - Sistema de gestão para futebol amador ⚽
