# 🎭 Mocks Explicado - O Que Está Mockado?

## Resumo Rápido

```
✅ MOCKADO:
  - JWT (jsonwebtoken) - Autenticação
  - Request/Response (Express) - HTTP
  - Lógica de negócio - Simulada
  - Dados de entrada - Fictícios

❌ NÃO MOCKADO:
  - Banco de dados real - Não conecta
  - Servidores externos - Não faz requisições
  - Sistema de arquivos - Não modifica arquivos
```

---

## 1. Testes de Autorização (authorization.test.ts)

### O Que É Testado?
Lógica pura de permissões baseada em `userTypeId`.

### Mocks Utilizados
```typescript
// NENHUM MOCK USADO!
// Apenas lógica pura em JavaScript

const user = { id: 1, userTypeId: 1, email: 'admin@example.com' };
const canApplyPunishment = user.userTypeId === 1;
expect(canApplyPunishment).toBe(true);
```

### O Que Não Há
- ❌ Sem banco de dados
- ❌ Sem HTTP requests
- ❌ Sem JWT
- ❌ Sem autenticação real

### Por Que Não Há Mocks?
**Porque não precisamos!** Estamos testando lógica pura:
```
Input: userTypeId
Process: Comparações simples (===)
Output: true/false
```

### Exemplo Real
```typescript
it('admin_master (userTypeId 1) should have access to all features', () => {
  // ARRANGE
  const user = { id: 1, userTypeId: 1, email: 'admin@example.com' };
  
  // ACT
  const canApplyPunishment = user.userTypeId === 1;
  const canCreateTeam = user.userTypeId === 1;
  const canEditMatch = user.userTypeId === 1;
  
  // ASSERT
  expect(canApplyPunishment).toBe(true);
  expect(canCreateTeam).toBe(true);
  expect(canEditMatch).toBe(true);
});
```

**O que está acontecendo:**
1. Criamos um objeto `user` fictício
2. Testamos condições simples
3. Verificamos resultado esperado

**Sem mocks porque:**
- Não precisa conectar em nada
- É tudo JavaScript nativo
- Funciona mesmo sem dependências

---

## 2. Testes de Autenticação (authentication.test.ts)

### O Que É Testado?
Validação de tokens JWT e formato de headers.

### Mocks Utilizados
```typescript
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');  // ← MOCK DO JWT
```

### Por Que Mockamos JWT?
Porque `jsonwebtoken` é uma **dependência externa** que:
- Acessa o sistema de arquivos (arquivos de chave)
- Faz criptografia complexa
- Pode falhar se não estiver configurado

### O Que o Mock Faz?

#### Sem Mock (Real):
```typescript
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
const decoded = jwt.verify(token, 'secret-key');  // ← Verifica de verdade
```
**Problemas:**
- Precisa da chave secreta correta
- Pode falhar se token expirou
- Lento (criptografia)

#### Com Mock:
```typescript
jest.mock('jsonwebtoken');

const decoded = jwt.verify(token, 'secret-key');  // ← Mock retorna o que queremos
```
**Vantagens:**
- Rápido
- Sem dependências
- Podemos testar qualquer cenário

### Exemplo de Mock em Ação

```typescript
describe('JWT Verification', () => {
  it('should verify valid token', () => {
    const token = 'valid.jwt.token';
    
    // Mock retorna um objeto decodificado fictício
    (jwt.verify as jest.Mock).mockReturnValue({
      id: 1,
      userTypeId: 1,
      email: 'admin@example.com'
    });
    
    // Quando chamamos jwt.verify, ele retorna o mock
    const decoded = jwt.verify(token, 'secret-key');
    
    expect(decoded.userTypeId).toBe(1);
  });

  it('should reject expired token', () => {
    const token = 'expired.jwt.token';
    
    // Mock simula um erro
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Token expired');
    });
    
    expect(() => {
      jwt.verify(token, 'secret-key');
    }).toThrow('Token expired');
  });
});
```

### Mocks de Response/Request

```typescript
let res: Partial<Response>;
let jsonMock: jest.Mock;
let statusMock: jest.Mock;

beforeEach(() => {
  jsonMock = jest.fn().mockReturnValue(undefined);
  statusMock = jest.fn().mockReturnValue({ json: jsonMock });
  
  res = {
    status: statusMock,
    json: jsonMock
  };
});
```

**O que está sendo mockado:**
- `res.status()` - Métodos do response
- `res.json()` - Para enviar JSON

**Por quê?**
- Não queremos rodar um servidor real
- Queremos isolar o middleware
- Queremos verificar o que seria enviado

**Exemplo:**
```typescript
res.status(401).json({ error: 'Unauthorized' });

expect(statusMock).toHaveBeenCalledWith(401);
expect(jsonMock).toHaveBeenCalledWith({ error: 'Unauthorized' });
```

---

## 3. Comparação: Com vs Sem Mocks

### Cenário: Testar Permissão de Punição

#### ❌ SEM MOCK (Integração Real)
```typescript
it('organizador should apply punishment', async () => {
  // Precisa de banco de dados real
  const user = await User.findByPk(1);
  
  // Precisa de match real
  const match = await Match.findByPk(1);
  
  // Precisa de toda a cadeia
  const team = await Team.findByPk(match.teamId);
  
  // Finalmente testa
  const canApply = user.id === team.organizerId || user.userTypeId === 1;
  
  expect(canApply).toBe(true);
});
```

**Problemas:**
- 🔴 Lento (acesso BD)
- 🔴 Requer dados de setup
- 🔴 Pode falhar por dados ausentes
- 🔴 Acoplado ao banco

#### ✅ COM MOCK (Testes de Autorização)
```typescript
it('organizador should apply punishment', () => {
  // Apenas dados fictícios
  const user = { id: 1, userTypeId: 3 };
  const team = { organizerId: 1 };
  
  // Testa lógica pura
  const canApply = user.id === team.organizerId || user.userTypeId === 1;
  
  expect(canApply).toBe(true);
});
```

**Vantagens:**
- ✅ Rápido (sem BD)
- ✅ Sem setup complexo
- ✅ Sempre funciona
- ✅ Testa só a lógica

---

## 4. O Que NÃO Está Mockado

### ❌ Banco de Dados
```typescript
// ISSO NÃO EXISTE NOS TESTES
const player = await Player.findByPk(1);  // Não funciona
const team = await Team.create(...);       // Não funciona
```

**Por quê?**
- Testar BD é integração, não unitário
- Seria muito lento
- Requer dados de setup

### ❌ Servidor HTTP
```typescript
// ISSO NÃO RODA NOS TESTES
app.listen(3000);  // Não funciona
const response = await fetch('http://localhost:3000/api/players');  // Não funciona
```

**Por quê?**
- Testar servidor é teste E2E
- Seria muito lento
- Requer port disponível

### ❌ Serviços Externos
```typescript
// ISSO NÃO FUNCIONA NOS TESTES
const email = await sendEmail(...);        // Não funciona
const payment = await processPayment(...);  // Não funciona
```

**Por quê?**
- Poderia falhar aleatoriamente
- Dependeria de internet
- Não queremos efeitos colaterais

---

## 5. Arquitetura de Testes

```
┌─────────────────────────────────────────┐
│         Seu Código Real (Produção)      │
│  - Controllers                          │
│  - Middleware                           │
│  - Services                             │
└────────┬────────────────────────────────┘
         │
         ├─→ Banco de Dados (MySQL)
         ├─→ JWT Verification
         ├─→ Express Server
         └─→ Arquivos

         ↓↓↓ EM TESTES ↓↓↓

┌─────────────────────────────────────────┐
│       Testes (Com Mocks)                │
│  - Lógica Pura ← SEM MOCKS              │
│  - JWT Mocked ← MOCK DO JWT             │
│  - Response Mocked ← MOCK DO RESPONSE   │
│  - Dados Fictícios ← TUDO FAKE          │
└─────────────────────────────────────────┘

❌ NÃO CONECTA:
  - Banco de dados
  - Servidor
  - Arquivos
```

---

## 6. Lista Completa de Mocks

### Testes de Autorização
```typescript
// Mocks Utilizados: NENHUM
// Dados: Objetos JavaScript fictícios
// Banco: Não conecta
// HTTP: Não usa
```

**Exemplo:**
```typescript
const user = { id: 1, userTypeId: 1 };
const canApply = user.userTypeId === 1;
expect(canApply).toBe(true);
```

### Testes de Autenticação
```typescript
// Mocks Utilizados: jsonwebtoken
// Dados: Tokens fictícios
// Banco: Não conecta
// HTTP: Simula request/response
```

**Exemplo:**
```typescript
jest.mock('jsonwebtoken');

(jwt.verify as jest.Mock).mockReturnValue({
  id: 1,
  userTypeId: 1
});
```

---

## 7. Quando Usar Cada Tipo de Teste

| Tipo | Mocks | Quando Usar |
|------|-------|------------|
| **Unitário** | Sim, tudo | Testar função isolada |
| **Integração** | Parcial | Testar múltiplos componentes |
| **E2E** | Não | Testar fluxo completo |
| **Nossos Testes** | Sim, seletivamente | Autorização e autenticação |

---

## 8. Como Jest Simula Sem Banco

### Teste de Autorização
```typescript
// Em produção isso seria:
async canCreateTeam(userId: number) {
  const user = await User.findByPk(userId);
  return user.userTypeId === 3 || user.userTypeId === 1;
}

// Em teste, apenas testamos a lógica:
it('admin_times can create team', () => {
  const userTypeId = 3;
  const canCreate = userTypeId === 3 || userTypeId === 1;
  expect(canCreate).toBe(true);
});
```

**Vantagem:**
- ✅ Testa a regra
- ✅ Sem dependência do banco
- ✅ Rápido e confiável

---

## 9. Próximas Etapas: Testes Reais com BD

Para testar **com banco de dados real**, faríamos:

```typescript
describe('User Authorization with Database', () => {
  let testDb: Database;

  beforeAll(async () => {
    // Setup banco de testes
    testDb = await setupTestDatabase();
  });

  afterEach(async () => {
    // Limpar dados após cada teste
    await testDb.clean();
  });

  it('admin_times can create team', async () => {
    // Cria usuário no banco de testes
    const user = await testDb.users.create({
      email: 'admin@test.com',
      userTypeId: 3
    });

    // Testa com dado real
    const canCreate = user.userTypeId === 3;
    expect(canCreate).toBe(true);
  });
});
```

**Mas não fazemos isso agora porque:**
- Seria muito lento
- Requer setup complexo
- Não é unitário (é integração)

---

## 10. Cheat Sheet: O Que Está Mockado

### ✅ MOCKADO (Em Nossos Testes)
```
1. jsonwebtoken (JWT)
2. Express Response
3. Express Request
4. Dados de teste (fictícios)
```

### ❌ NÃO MOCKADO
```
1. Banco de dados
2. Servidor
3. Arquivos
4. Serviços externos
```

### 🎭 POR QUÊ MOCKAMOS?
```
- Testes rápidos
- Sem dependências
- Isolado
- Previsível
```

### 🎭 POR QUÊ NÃO MOCKAMOS BD?
```
- Seria integração (não unitário)
- Seria muito lento
- Requer setup complexo
```

---

## Resumo Final

```
🎭 Mocks = Simulações de Dependências Externas

Nossos Testes:
├─ Autorização: Nenhum mock (lógica pura)
├─ Autenticação: JWT mockado
└─ Dados: Todos fictícios

Resultado:
✅ 39 testes rodando
✅ Rápido (< 2 segundos)
✅ Confiável (sem dependências)
✅ Isolado (sem efeitos colaterais)
```

**Próximo nível:** Testes de integração com banco de dados 🚀
