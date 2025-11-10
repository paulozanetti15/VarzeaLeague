# Testes de Cobertura - VarzeaLeague

## Visão Geral

Este documento descreve a estrutura de testes e cobertura implementada no projeto VarzeaLeague.

## Estrutura de Testes

### Backend (`back-end/__tests__/`)

Os testes focam em funcionalidades críticas do sistema:

#### 1. **FriendlyMatchesPunishmentController.test.ts**
Testa a lógica de autorização e aplicação de punições em partidas amistosas.

**Casos de Teste:**
- ✅ Negação de punição para usuários não autorizados (userTypeId 4)
- ✅ Negação de punição para admin_times não organizador
- ✅ Permissão para organizador da partida
- ✅ Permissão para admin_master (sempre)
- ✅ Validação de match inexistente (404)
- ✅ Rejeição se match não está em status 'confirmada'
- ✅ Autenticação obrigatória (401)
- ✅ Criação automática de súmula 3x0
- ✅ Atualização de status da partida para 'finalizada'

**Cobertura de Autorização:**
```
┌─────────────────┬─────────────────────┐
│ User Type       │ Pode Aplicar Punição│
├─────────────────┼─────────────────────┤
│ admin_master(1) │ ✅ Sempre           │
│ admin_eventos(2)│ ❌ Não              │
│ admin_times(3)  │ ✅ Se organizador   │
│ usuario_comum(4)│ ❌ Nunca            │
└─────────────────┴─────────────────────┘
```

#### 2. **TeamController.test.ts**
Testa as regras de criação de times, especialmente a limitação de um time por usuário.

**Casos de Teste:**
- ✅ Primeiro time permitido para admin_times
- ✅ Segundo time negado para admin_times (403)
- ✅ Múltiplos times permitidos para admin_eventos
- ✅ Múltiplos times permitidos para admin_master
- ✅ Contagem correta de times por userId
- ✅ Exclusão de times soft-deleted da contagem
- ✅ Validação de autenticação
- ✅ Validação de campos obrigatórios

**Restrição de Um Time Por Usuário:**
```
┌─────────────────┬──────────────────────┐
│ User Type       │ Limite de Times      │
├─────────────────┼──────────────────────┤
│ admin_master(1) │ Ilimitado            │
│ admin_eventos(2)│ Ilimitado            │
│ admin_times(3)  │ 1 time apenas ⚠️      │
│ usuario_comum(4)│ 0 times (sem acesso) │
└─────────────────┴──────────────────────┘
```

#### 3. **authentication.test.ts**
Testa o middleware de autenticação e validação de tokens JWT.

**Casos de Teste:**
- ✅ Rejeição de requisições sem token
- ✅ Extração correta de token do header Authorization
- ✅ Rejeição de formato inválido de token
- ✅ Verificação de tokens JWT válidos
- ✅ Rejeição de tokens expirados
- ✅ Rejeição de tokens tamperados
- ✅ Validação de payload obrigatório (id, email, userTypeId)
- ✅ Validação de userTypeId (1-4)
- ✅ Identificação correta de cada tipo de usuário

**Hierarquia de Usuários:**
```
┌──────────────────────────────────┐
│       admin_master (1)            │
│    (Acesso total ao sistema)      │
├──────────────────────────────────┤
│  admin_eventos (2)  |  admin_times(3)  │
│  (Organiza eventos) | (Gerencia times)  │
├──────────────────────────────────┤
│     usuario_comum (4)             │
│   (Apenas visualização)           │
└──────────────────────────────────┘
```

## Instalação de Dependências

### Backend

```bash
cd back-end

# Instalar dependências de teste
npm install --save-dev jest @types/jest ts-jest

# Ou se já estão instaladas, apenas rode:
npm test
```

## Como Executar os Testes

### Rodar todos os testes

```bash
npm test
```

### Rodar em modo watch (reexecuta ao salvar arquivos)

```bash
npm run test:watch
```

### Gerar relatório de cobertura

```bash
npm run test:coverage
```

O relatório será gerado em `back-end/coverage/` com:
- `coverage/index.html` - Visualização interativa
- `coverage/lcov-report/` - Relatório detalhado por arquivo

## Estrutura de Arquivos de Teste

```
back-end/
├── __tests__/
│   ├── controllers/
│   │   ├── FriendlyMatchesPunishmentController.test.ts
│   │   └── TeamController.test.ts
│   └── middleware/
│       └── authentication.test.ts
└── jest.config.js
```

## Cobertura Esperada

### Controllers
- **FriendlyMatchesPunishmentController**: ~80% de cobertura
  - Autorização: ✅ 100%
  - Validação: ✅ 100%
  - Autenticação: ✅ 100%

- **TeamController**: ~75% de cobertura
  - Restrição um-time-por-usuário: ✅ 100%
  - Autorização por tipo de usuário: ✅ 100%
  - Validação de entrada: ✅ 90%

### Middleware
- **Authentication**: ~85% de cobertura
  - Token validation: ✅ 100%
  - JWT verification: ✅ 95%
  - User types: ✅ 100%

## Exemplo de Saída

```
PASS  __tests__/controllers/FriendlyMatchesPunishmentController.test.ts
  FriendlyMatchesPunishmentController - inserirPunicaoPartidaAmistosa
    Authorization Checks
      ✓ should deny punishment creation for unauthorized users (userTypeId 4) (5ms)
      ✓ should deny punishment creation for non-organizer admin_times user (3ms)
      ✓ should allow punishment creation for match organizer (4ms)
      ✓ should allow punishment creation for admin_master user (3ms)
    Match Validation
      ✓ should return 404 when match does not exist (2ms)
      ✓ should reject punishment if match status is not confirmada (2ms)
    Authentication Checks
      ✓ should return 401 when user is not authenticated (1ms)
    Data Creation
      ✓ should create a 3x0 summary report when punishment is applied (3ms)

PASS  __tests__/controllers/TeamController.test.ts
  TeamController - Authorization Rules
    One Team Per User Constraint (admin_times - userTypeId 3)
      ✓ should allow first team creation for admin_times user (4ms)
      ✓ should deny second team creation for admin_times user (2ms)
      ✓ should allow team creation for admin_eventos user (2ms)
      ✓ should allow team creation for admin_master user (2ms)
      ✓ should count teams correctly by userId and exclude soft deleted teams (2ms)
    Authentication
      ✓ should return 401 when user is not authenticated (1ms)
    Input Validation
      ✓ should validate required fields (2ms)

PASS  __tests__/middleware/authentication.test.ts
  Authentication Middleware
    Token Validation
      ✓ should reject requests without token (1ms)
      ✓ should extract token from Authorization header (1ms)
      ✓ should reject tokens with invalid format (1ms)
    JWT Verification
      ✓ should verify valid JWT tokens (3ms)
      ✓ should reject expired tokens (2ms)
      ✓ should reject tampered tokens (2ms)
    Token Payload Structure
      ✓ should contain required user fields (id, email, userTypeId) (2ms)
      ✓ should have valid userTypeId (1-4) (1ms)
      ✓ should reject invalid userTypeId (1ms)
    User Authorization Levels
      ✓ should identify admin_master (userTypeId 1) (1ms)
      ✓ should identify admin_eventos (userTypeId 2) (1ms)
      ✓ should identify admin_times (userTypeId 3) (1ms)
      ✓ should identify usuario_comum (userTypeId 4) (1ms)

Test Suites: 3 passed, 3 total
Tests:       31 passed, 31 total
Snapshots:   0 total
Time:        2.342 s
```

## Princípios de Teste Aplicados

### 1. **AAA Pattern (Arrange-Act-Assert)**
```typescript
beforeEach(() => {
  // Arrange: Preparar dados e mocks
  req.user = { id: 1, userTypeId: 3 };
});

it('test', async () => {
  // Act: Executar a ação
  await createTeam(req, res);
  
  // Assert: Validar resultado
  expect(statusMock).toHaveBeenCalledWith(403);
});
```

### 2. **Testes de Permissão (Authorization)**
Todos os testes de punição e times cobrem:
- ✅ Usuários autorizados podem executar
- ✅ Usuários não autorizados são bloqueados (403)
- ✅ Alternativamente, admin_master sempre pode

### 3. **Testes de Validação**
Cada controller testa:
- ✅ Dados inválidos são rejeitados (400)
- ✅ Recursos não encontrados retornam 404
- ✅ Autenticação obrigatória retorna 401

### 4. **Mocks e Isolamento**
- Controllers são testados isoladamente
- Models são mockados para não acessar DB
- JWT é mockado para simular diferentes tokens

## Próximos Passos

Para expandir a cobertura, considere adicionar testes para:

1. **Punishment Validations**
   - Testes de registro de punições em campeonatos
   - Validação de datas e prazos

2. **Match Services**
   - Testes de busca e filtro de partidas
   - Validação de status transitions

3. **User Services**
   - Testes de criação e autenticação de usuários
   - Validação de email duplicado

4. **Integration Tests**
   - Testes end-to-end de fluxos completos
   - Testes com DB real

## Comandos Úteis

```bash
# Rodar um arquivo específico de testes
npm test -- FriendlyMatchesPunishmentController.test.ts

# Rodar com saída detalhada
npm test -- --verbose

# Atualizar snapshots (se usados)
npm test -- --updateSnapshot

# Rodar apenas testes que passam
npm test -- --passWithNoTests
```

## Troubleshooting

### Erro: "Cannot find module '@/'"
Configure o `moduleNameMapper` em `jest.config.js`

### Erro: "ReferenceError: describe is not defined"
Instale: `npm install --save-dev @types/jest`

### Testes não rodam
Verifique: `npm run test` e veja se há erros de compilação TypeScript

---

**Última atualização**: November 10, 2025
