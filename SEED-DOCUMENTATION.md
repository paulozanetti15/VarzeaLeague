# 🌱 Documentação do Seed do Banco de Dados - VarzeaLeague

## 📋 Visão Geral

Este documento detalha todos os dados inseridos no banco de dados através do script de seed `seed-database.ts`. O objetivo é popular o banco com dados de exemplo para testes e desenvolvimento.

---

## 🚀 Como Executar o Seed

### Pré-requisitos
- Node.js instalado
- MySQL rodando
- Banco de dados configurado em `back-end/config/database.ts`

### Comandos

```bash
cd back-end
npx ts-node seeds/seed-database.ts
```

⚠️ **ATENÇÃO**: Este comando irá **APAGAR TODOS OS DADOS** existentes e recriar as tabelas do zero (`force: true`).

---

## 📊 Dados Inseridos

### 1️⃣ Tipos de Usuário (UserTypes)

| ID | Nome | Descrição |
|----|------|-----------|
| 1 | `admin_master` | Administrador com acesso total ao sistema |
| 2 | `admin_eventos` | Administrador de partidas e campeonatos |
| 3 | `admin_times` | Administrador de times |
| 4 | `usuario_comum` | Usuário comum com permissões básicas |

**Total**: 4 tipos de usuário

---

### 2️⃣ Usuários (Users)

Todos os usuários têm a senha padrão: **`senha123`**

| Nome | Email | CPF | Telefone | Gênero | Tipo | Responsabilidades |
|------|-------|-----|----------|--------|------|-------------------|
| Admin Master | admin@varzealeague.com | 11111111111 | 11999999999 | Masculino | admin_master | ❌ Não cria nenhum dado |
| João Silva | joao@email.com | 22222222222 | 11988888888 | Masculino | admin_eventos | ✅ Cria campeonatos e partidas amistosas |
| Maria Santos | maria@email.com | 33333333333 | 11977777777 | Feminino | admin_times | ✅ Cria Tigres FC |
| Carlos Mendes | carlos@email.com | 66666666666 | 11944444444 | Masculino | admin_times | ✅ Cria Leões United |
| Juliana Costa | juliana@email.com | 77777777777 | 11933333333 | Feminino | admin_times | ✅ Cria Águias FC |
| Roberto Silva | roberto@email.com | 88888888888 | 11922222222 | Masculino | admin_times | ✅ Cria Panteras FC |
| Pedro Oliveira | pedro@email.com | 44444444444 | 11966666666 | Masculino | usuario_comum | ❌ Não cria nenhum dado |
| Ana Costa | ana@email.com | 55555555555 | 11955555555 | Feminino | usuario_comum | ❌ Não cria nenhum dado |

**Total**: 8 usuários (1 admin master, 1 organizador de eventos, 4 gerenciadores de times, 2 usuários comuns)

#### 🔑 Credenciais de Login

```
Email: admin@varzealeague.com
Senha: senha123
Tipo: Administrador Master (não cria dados)

Email: joao@email.com
Senha: senha123
Tipo: Organizador de Eventos (cria campeonatos e partidas)

Email: maria@email.com
Senha: senha123
Tipo: Gerenciador de Times (cria apenas Tigres FC)

Email: carlos@email.com
Senha: senha123
Tipo: Gerenciador de Times (cria apenas Leões United)

Email: juliana@email.com
Senha: senha123
Tipo: Gerenciador de Times (cria apenas Águias FC)

Email: roberto@email.com
Senha: senha123
Tipo: Gerenciador de Times (cria apenas Panteras FC)

Email: pedro@email.com
Senha: senha123
Tipo: Usuário Comum (não cria dados)

Email: ana@email.com
Senha: senha123
Tipo: Usuário Comum (não cria dados)
```

---

### 3️⃣ Times (Teams)

| Nome | Criado Por | Cidade | Estado | CEP | Bairro | Rua | Número |
|------|------------|--------|--------|-----|--------|-----|--------|
| Tigres FC | Maria Santos (admin_times) | São Paulo | SP | 01310100 | Centro | Rua Augusta | 1000 |
| Leões United | Carlos Mendes (admin_times) | São Paulo | SP | 04567890 | Vila Mariana | Rua Domingos de Morais | 2000 |
| Águias FC | Juliana Costa (admin_times) | São Paulo | SP | 05402000 | Pinheiros | Rua dos Pinheiros | 3000 |
| Panteras FC | Roberto Silva (admin_times) | São Paulo | SP | 01451000 | Jardins | Alameda Santos | 4000 |

**Total**: 4 times (cada gerenciador de times cria apenas 1 time)

---

### 4️⃣ Jogadores (Players)

#### Time: Tigres FC (5 jogadores)
| Nome | Gênero | Ano de Nascimento | Posição |
|------|--------|-------------------|---------|
| Carlos Alberto | Masculino | 1995 | Goleiro |
| Rafael Mendes | Masculino | 1998 | Zagueiro |
| Fernando Lima | Masculino | 1992 | Meio-campo |
| Gustavo Pereira | Masculino | 1997 | Atacante |
| Lucas Rodrigues | Masculino | 1999 | Lateral |

#### Time: Leões United (5 jogadores)
| Nome | Gênero | Ano de Nascimento | Posição |
|------|--------|-------------------|---------|
| Marcos Vinicius | Masculino | 1994 | Goleiro |
| Diego Santos | Masculino | 1996 | Zagueiro |
| Bruno Costa | Masculino | 1993 | Meio-campo |
| Thiago Silva | Masculino | 1991 | Atacante |
| André Oliveira | Masculino | 2000 | Lateral |

#### Time: Águias FC (5 jogadoras)
| Nome | Gênero | Ano de Nascimento | Posição |
|------|--------|-------------------|---------|
| Julia Martins | Feminino | 1997 | Goleira |
| Camila Ferreira | Feminino | 1999 | Zagueira |
| Beatriz Lima | Feminino | 1995 | Meio-campo |
| Larissa Santos | Feminino | 1998 | Atacante |
| Patricia Costa | Feminino | 1996 | Lateral |

#### Time: Panteras FC (5 jogadores)
| Nome | Gênero | Ano de Nascimento | Posição |
|------|--------|-------------------|---------|
| Roberto Firmino | Masculino | 1994 | Goleiro |
| Gabriel Jesus | Masculino | 1997 | Zagueiro |
| Felipe Anderson | Masculino | 1993 | Meio-campo |
| Matheus Cunha | Masculino | 1999 | Atacante |
| Richarlison | Masculino | 1997 | Lateral |

**Total**: 20 jogadores (20 vínculos time-jogador)

---

### 5️⃣ Campeonatos (Championships)

#### Copa VarzeaLeague 2025
- **Nome**: Copa VarzeaLeague 2025
- **Descrição**: Primeiro campeonato oficial da temporada 2025
- **Período**: 15/01/2025 a 30/03/2025
- **Criado por**: João Silva (admin_eventos)
- **Status**: Finalizado
- **Modalidade**: Society
- **Tipo**: Eliminatórias
- **Máximo de Times**: 8
- **Gênero**: Masculino
- **Times Inscritos**: Tigres FC, Leões United, Panteras FC

#### Campeonato Feminino SP
- **Nome**: Campeonato Feminino SP
- **Descrição**: Campeonato de futebol feminino de São Paulo
- **Período**: 01/02/2025 a 15/04/2025
- **Criado por**: João Silva (admin_eventos)
- **Status**: Finalizado
- **Modalidade**: Futsal
- **Tipo**: Liga com grupos
- **Máximo de Times**: 12
- **Gênero**: Feminino
- **Times Inscritos**: Águias FC

#### Torneio Verão 2025
- **Nome**: Torneio Verão 2025
- **Descrição**: Torneio de futebol amador - Verão 2025
- **Período**: 01/09/2025 a 30/10/2025
- **Criado por**: João Silva (admin_eventos)
- **Status**: Em Andamento
- **Modalidade**: Society
- **Tipo**: Eliminatórias
- **Máximo de Times**: 16
- **Gênero**: Misto
- **Times Inscritos**: Tigres FC, Leões United, Águias FC, Panteras FC

#### Campeonato Misto Regional
- **Nome**: Campeonato Misto Regional
- **Descrição**: Campeonato misto regional com inscrições abertas
- **Período**: 15/11/2025 a 20/12/2025
- **Criado por**: João Silva (admin_eventos)
- **Status**: Inscrições Abertas
- **Modalidade**: Futsal
- **Tipo**: Liga com grupos
- **Máximo de Times**: 10
- **Gênero**: Misto
- **Times Inscritos**: Tigres FC, Leões United, Águias FC, Panteras FC

**Total**: 4 campeonatos com variados status para testar o dashboard

---

### 6️⃣ Partidas Amistosas (Friendly Matches)

**Total**: 10 partidas amistosas com variados status para testes do dashboard

| # | Título | Data | Status | Criada por |
|---|--------|------|--------|-----------|
| 1 | Partida Amistosa - Campo da Juventude | 15/09/2025 | Finalizada | João Silva |
| 2 | Partida Amistosa - Arena Central | 20/09/2025 | Finalizada | João Silva |
| 3 | Amistoso - Estádio do Morumbi | 05/10/2025 | Confirmada | João Silva |
| 4 | Amistoso - Pacaembu | 12/10/2025 | Aberta | João Silva |
| 5 | Partida Amistosa - Arena Central 2 | 18/10/2025 | Cancelada | João Silva |
| 6 | Amistoso - Campo da Juventude 2 | 25/10/2025 | Finalizada | João Silva |
| 7 | Amistoso - Ginásio Municipal | 05/11/2025 | Confirmada | João Silva |
| 8 | Partida Amistosa - Arena Central 3 | 15/11/2025 | Aberta | João Silva |
| 9 | Amistoso - Estádio do Morumbi 2 | 20/11/2025 | Finalizada | João Silva |
| 10 | Partida Amistosa - Pacaembu 2 | 25/11/2025 | Confirmada | João Silva |

**Status Distribuição**:
- ✅ Finalizadas: 3
- 🔄 Confirmadas: 3
- 📋 Abertas: 2
- ❌ Canceladas: 1
- **Total**: 10 partidas

---

### 7️⃣ Partidas de Campeonato (Championship Matches)

#### Partida Copa VarzeaLeague #1
- **Campeonato**: Copa VarzeaLeague 2025
- **Data**: 20/01/2025
- **Horário**: 15:00
- **Local**: Arena Paulista
- **Status**: Agendada
- **Rodada**: 1
- **Fase**: Oitavas de Final

#### Partida Copa VarzeaLeague #2
- **Campeonato**: Copa VarzeaLeague 2025
- **Data**: 22/01/2025
- **Horário**: 16:00
- **Local**: Arena Paulista
- **Status**: Agendada
- **Rodada**: 1
- **Fase**: Oitavas de Final

**Total**: 2 partidas de campeonato

---

## 📈 Resumo Estatístico

| Entidade | Quantidade |
|----------|------------|
| Tipos de Usuário | 4 |
| Usuários | 8 |
| Gerenciadores de Times | 4 |
| Times | 4 |
| Jogadores | 20 |
| Vínculos Time-Jogador | 20 |
| Campeonatos | 4 |
| Inscrições em Campeonatos | 12 |
| Partidas Amistosas | 10 |
| Regras de Partidas Amistosas | 10 |
| Vinculações Time-Partida | 12 |
| Partidas de Campeonato | 7 |

**Total de Registros**: ~150+ registros

---

## 🎯 Casos de Uso Cobertos

### ✅ Autenticação e Autorização
- Login com diferentes níveis de permissão
- Administrador Master (sem permissão de criação)
- Organizador de Eventos (cria campeonatos e partidas amistosas)
- Gerenciadores de Times (cada um cria apenas 1 time - limitado por userTypeId 3)
- Usuários comuns (sem permissão de criação)

### ✅ Gestão de Times
- Times criados exclusivamente pelos Gerenciadores de Times
- **Cada gerenciador de times (tipo 3) pode criar apenas 1 time**
- Sistema valida e retorna erro se tentar criar segundo time
- Jogadores vinculados a times pelos Gerenciadores
- Diferentes posições e gêneros

### ✅ Campeonatos
- Campeonatos criados exclusivamente pelo Organizador de Eventos
- Campeonato masculino por eliminatórias
- Campeonato feminino com fase de grupos
- Times inscritos em campeonatos

### ✅ Partidas Amistosas
- Partidas criadas exclusivamente pelo Organizador de Eventos
- Partidas abertas aguardando times
- Partidas confirmadas com times definidos
- Regras de idade e gênero
- Datas limite para inscrição

### ✅ Partidas de Campeonato
- Partidas agendadas
- Diferentes fases (oitavas)
- Rodadas organizadas

---

## 🔧 Estrutura do Código

```typescript
// Imports dos modelos
import UserType from '../models/UserTypeModel';
import User from '../models/UserModel';
import Team from '../models/TeamModel';
// ... outros modelos

async function seedDatabase() {
  // 1. Sincroniza banco (APAGA TUDO)
  await sequelize.sync({ force: true });
  
  // 2. Cria tipos de usuário
  const userTypes = await UserType.bulkCreate([...]);
  
  // 3. Cria usuários (senha hasheada)
  const hashedPassword = await bcrypt.hash('senha123', 10);
  const users = await User.bulkCreate([...]);
  
  // 4. Cria times, jogadores, campeonatos, etc.
  // ... em ordem de dependência
  
  // 5. Exibe resumo
  console.log('Resumo...');
}
```

---

## ⚠️ Avisos Importantes

1. **PERDA DE DADOS**: O comando `sync({ force: true })` **apaga todos os dados** existentes
2. **Senha Padrão**: Todos os usuários usam `senha123` - **altere em produção**
3. **Dados Fictícios**: CPFs, telefones e endereços são exemplos - não usar em produção
4. **IDs Fixos**: UserTypes têm IDs fixos (1-4) para consistência com o sistema
5. **Ordem de Execução**: Respeita dependências entre tabelas (FK constraints)
6. **Limite de Times**: Usuários do tipo `admin_times` (tipo 3) **só podem criar 1 time**
   - O sistema valida na criação e retorna erro se tentar criar um segundo time
   - Cada gerenciador de times tem seu próprio time na seed

---

## 🔒 Regras de Negócio Implementadas

### Validação no Backend
O controller `TeamController.createTeam()` verifica se o usuário é do tipo 3 (`admin_times`):
- Se sim, conta times ativos do usuário
- Se já existe 1 time, retorna erro `403 Forbidden`
- Mensagem: "Gerenciadores de times podem criar apenas um time. Você já possui um time registrado."

**Código de Validação**:
```typescript
if (userTypeId === 3) {
  const existingTeamsForUser = await Team.count({
    where: { captainId: userId, isDeleted: false }
  });

  if (existingTeamsForUser > 0) {
    res.status(403).json({ 
      error: 'Gerenciadores de times podem criar apenas um time. Você já possui um time registrado.' 
    });
    return;
  }
}
```

---

## 🔄 Atualizações Futuras

Para adicionar mais dados ao seed:

1. Adicione novos registros nos arrays `bulkCreate`
2. Mantenha a ordem de dependências (ex: criar usuários antes de times)
3. Atualize a seção de resumo no código
4. Atualize este documento com os novos dados

---

## 📞 Suporte

Para dúvidas ou problemas:
- Verifique os logs do console durante a execução
- Confira a conexão com o banco de dados
- Valide as configurações em `config/database.ts`

---

**Última atualização**: 10 de Novembro de 2025  
**Versão do Seed**: 1.0.0
