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

| Nome | Email | CPF | Telefone | Gênero | Tipo |
|------|-------|-----|----------|--------|------|
| Admin Master | admin@varzealeague.com | 11111111111 | 11999999999 | Masculino | admin_master |
| João Silva | joao@email.com | 22222222222 | 11988888888 | Masculino | admin_eventos |
| Maria Santos | maria@email.com | 33333333333 | 11977777777 | Feminino | admin_times |
| Pedro Oliveira | pedro@email.com | 44444444444 | 11966666666 | Masculino | usuario_comum |
| Ana Costa | ana@email.com | 55555555555 | 11955555555 | Feminino | usuario_comum |

**Total**: 5 usuários

#### 🔑 Credenciais de Login

```
Email: admin@varzealeague.com
Senha: senha123
Tipo: Administrador Master (acesso total)

Email: joao@email.com
Senha: senha123
Tipo: Admin de Eventos

Email: maria@email.com
Senha: senha123
Tipo: Admin de Times

Email: pedro@email.com
Senha: senha123
Tipo: Usuário Comum

Email: ana@email.com
Senha: senha123
Tipo: Usuário Comum
```

---

### 3️⃣ Times (Teams)

| Nome | Criado Por | Cidade | Estado | CEP | Bairro | Rua | Número |
|------|------------|--------|--------|-----|--------|-----|--------|
| Tigres FC | João Silva | São Paulo | SP | 01310100 | Centro | Rua Augusta | 1000 |
| Leões United | Maria Santos | São Paulo | SP | 04567890 | Vila Mariana | Rua Domingos de Morais | 2000 |
| Águias FC | Pedro Oliveira | São Paulo | SP | 05402000 | Pinheiros | Rua dos Pinheiros | 3000 |
| Panteras FC | Ana Costa | São Paulo | SP | 01451000 | Jardins | Alameda Santos | 4000 |

**Total**: 4 times

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
- **Criado por**: João Silva
- **Modalidade**: Society
- **Local**: Arena Paulista
- **Tipo**: Eliminatórias
- **Fase de Grupos**: Não
- **Máximo de Times**: 8
- **Gênero**: Masculino
- **Times Inscritos**: 
  - Tigres FC
  - Leões United
  - Panteras FC

#### Campeonato Feminino SP
- **Nome**: Campeonato Feminino SP
- **Descrição**: Campeonato de futebol feminino de São Paulo
- **Período**: 01/02/2025 a 15/04/2025
- **Criado por**: Maria Santos
- **Modalidade**: Futsal
- **Local**: Ginásio Municipal
- **Tipo**: Grupos
- **Fase de Grupos**: Sim
- **Número de Grupos**: 3
- **Times por Grupo**: 4
- **Máximo de Times**: 12
- **Gênero**: Feminino
- **Times Inscritos**: 
  - Águias FC (Grupo A)

**Total**: 2 campeonatos (4 inscrições de times)

---

### 6️⃣ Partidas Amistosas (Friendly Matches)

#### Partida #1
- **Data**: 20/11/2025
- **Horário**: 19:00
- **Duração**: 90 minutos
- **Local**: Campo da Juventude
- **Endereço**: Rua da Mooca, 500 - Mooca, São Paulo/SP - CEP: 03164000
- **Status**: Aberta (aguardando times)
- **Criada por**: João Silva
- **Regras**:
  - Data limite para inscrição: 19/11/2025 às 18:00
  - Idade mínima: 18 anos
  - Idade máxima: 45 anos
  - Gênero: Masculino

#### Partida #2
- **Data**: 25/11/2025
- **Horário**: 20:00
- **Duração**: 90 minutos
- **Local**: Arena Central
- **Endereço**: Rua Tuiuti, 1000 - Tatuapé, São Paulo/SP - CEP: 03081000
- **Status**: Confirmada
- **Criada por**: Maria Santos
- **Times Participantes**:
  - Tigres FC
  - Leões United
- **Regras**:
  - Data limite para inscrição: 24/11/2025 às 18:00
  - Idade mínima: 16 anos
  - Idade máxima: 50 anos
  - Gênero: Misto

**Total**: 2 partidas amistosas (2 regras, 2 vínculos de times)

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
| Usuários | 5 |
| Times | 4 |
| Jogadores | 20 |
| Vínculos Time-Jogador | 20 |
| Campeonatos | 2 |
| Inscrições em Campeonatos | 4 |
| Partidas Amistosas | 2 |
| Regras de Partidas | 2 |
| Times em Partidas Amistosas | 2 |
| Partidas de Campeonato | 2 |

**Total de Registros**: ~67 registros

---

## 🎯 Casos de Uso Cobertos

### ✅ Autenticação e Autorização
- Login com diferentes níveis de permissão
- Administradores com poderes específicos
- Usuários comuns

### ✅ Gestão de Times
- Times criados por diferentes usuários
- Jogadores vinculados a times
- Diferentes posições e gêneros

### ✅ Campeonatos
- Campeonato masculino por eliminatórias
- Campeonato feminino com fase de grupos
- Times inscritos em campeonatos

### ✅ Partidas Amistosas
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
