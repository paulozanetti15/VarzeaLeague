# 🎬 PASSO-A-PASSO: Como os Testes Funcionam

## Cenário Real: Criando um Teste do Zero

Vamos criar um teste para a regra: **"Admin times pode criar apenas 1 time"**

### Passo 1: Entender a Regra de Negócio

```
REGRA: Um usuário admin_times (tipo 3) pode criar apenas 1 time

Casos:
✅ admin_times com 0 times → pode criar 1º time
❌ admin_times com 1 time → NÃO pode criar 2º time
✅ admin_eventos → pode criar múltiplos times
✅ admin_master → pode criar múltiplos times
```

### Passo 2: Criar o Arquivo de Teste

Arquivo: `__tests__/authorization.test.ts`

```typescript
// 1️⃣ Importar dependências (se fosse com mocks)
import { jest } from '@jest/globals';

// 2️⃣ Descrever o grupo de testes
describe('One Team Per User Constraint', () => {
  // Aqui vão os testes individuais
});
```

### Passo 3: Escrever o Primeiro Teste

```typescript
describe('One Team Per User Constraint', () => {
  it('admin_times user can create first team', () => {
    // ✍️ ARRANGE - Preparar dados
    const userTeamCount = 0;        // Usuario não tem times ainda
    const userTypeId = 3;           // Tipo de usuário: admin_times
    
    // 🎬 ACT - Executar lógica
    // A lógica é: pode criar se NÃO for admin_times OU tiver 0 times
    const canCreate = userTypeId !== 3 || userTeamCount === 0;
    
    // ✔️ ASSERT - Verificar resultado
    expect(canCreate).toBe(true);   // Esperamos true
  });
});

// Execução:
// 1. userTypeId !== 3 → false (É admin_times)
// 2. userTeamCount === 0 → true (Tem 0 times)
// 3. false OR true → TRUE ✅
```

### Passo 4: Escrever o Segundo Teste (Caso Negativo)

```typescript
describe('One Team Per User Constraint', () => {
  // ... teste anterior ...
  
  it('admin_times user cannot create second team', () => {
    // ✍️ ARRANGE
    const userTeamCount = 1;        // Usuario já tem 1 time
    const userTypeId = 3;           // admin_times
    
    // 🎬 ACT
    const canCreate = userTypeId !== 3 || userTeamCount === 0;
    
    // ✔️ ASSERT
    expect(canCreate).toBe(false);  // Esperamos false
  });
});

// Execução:
// 1. userTypeId !== 3 → false (É admin_times)
// 2. userTeamCount === 0 → false (Tem 1 time)
// 3. false OR false → FALSE ✅
```

### Passo 5: Testar Outros Tipos de Usuário

```typescript
describe('One Team Per User Constraint', () => {
  // ... testes anteriores ...
  
  it('admin_eventos can create multiple teams', () => {
    // ✍️ ARRANGE
    const userTeamCount = 5;        // Já tem 5 times
    const userTypeId = 2;           // admin_eventos
    
    // 🎬 ACT
    const canCreate = userTypeId !== 3 || userTeamCount === 0;
    
    // ✔️ ASSERT
    expect(canCreate).toBe(true);   // Pode criar mesmo com 5 times!
  });
});

// Execução:
// 1. userTypeId !== 3 → true (NÃO é admin_times)
// 2. true OR anything → TRUE ✅
```

### Passo 6: Rodar os Testes

```bash
npm test authorization.test.ts
```

### Resultado Esperado

```
 PASS  __tests__/authorization.test.ts
  One Team Per User Constraint
    ✓ admin_times user can create first team (1 ms)
    ✓ admin_times user cannot create second team (1 ms)
    ✓ admin_eventos can create multiple teams (1 ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
```

## Exemplo Com Mock (Simulação)

Agora vamos para algo mais avançado: mockar funções.

### Cenário: Testar Autorização de Punição

```typescript
// ❌ Sem mock (problema: chama banco de dados)
it('should apply punishment', async () => {
  const punishment = await applyPunishment(matchId, teamId);
  expect(punishment).toBeDefined();  // ❌ Lento e testa banco
});

// ✅ Com mock (rápido e isolado)
it('should apply punishment', async () => {
  // 1️⃣ ARRANGE - Preparar mocks
  const mockUser = {
    id: 1,
    userTypeId: 1  // admin_master
  };
  
  const mockMatch = {
    id: 1,
    organizerId: 999,
    status: 'confirmada'
  };
  
  // Simular que a busca de usuário funciona
  (UserModel.findByPk as jest.Mock).mockResolvedValue(mockUser);
  
  // Simular que a busca de partida funciona
  (FriendlyMatch.findByPk as jest.Mock).mockResolvedValue(mockMatch);
  
  // 2️⃣ ACT - Chamar função
  const result = await applyPunishment({
    userId: 1,
    matchId: 1,
    teamId: 2
  });
  
  // 3️⃣ ASSERT - Verificar resultado
  expect(result.success).toBe(true);
  expect(UserModel.findByPk).toHaveBeenCalledWith(1);
  expect(FriendlyMatch.findByPk).toHaveBeenCalledWith(1);
});
```

## Fluxograma de Execução

```
┌──────────────────────────────────────┐
│  npm test authorization.test.ts      │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  Jest carrega arquivo de teste       │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  Encontra describe() e it()          │
└──────────────┬───────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│  Executa beforeEach() (se existir)              │
└──────────────┬────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  Teste 1: ARRANGE                    │
│    const userTeamCount = 0           │
│    const userTypeId = 3              │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  Teste 1: ACT                        │
│    const canCreate = ...             │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  Teste 1: ASSERT                     │
│    expect(canCreate).toBe(true)      │
└──────────────┬───────────────────────┘
               │
           ✅ PASS
               │
               ▼
┌──────────────────────────────────────┐
│  Teste 2: ARRANGE                    │
│    const userTeamCount = 1           │
│    const userTypeId = 3              │
└──────────────┬───────────────────────┘
               │
               ▼
         ... ACT + ASSERT ...
               │
           ✅ PASS
               │
               ▼
┌──────────────────────────────────────┐
│  Teste 3: ARRANGE                    │
│  Teste 3: ACT                        │
│  Teste 3: ASSERT                     │
└──────────────┬───────────────────────┘
               │
           ✅ PASS
               │
               ▼
┌──────────────────────────────────────┐
│  Resultado Final:                    │
│  ✓ 3 testes passaram                 │
│  Test Suites: 1 passed               │
│  Tests: 3 passed                     │
│  Time: 1.234 s                       │
└──────────────────────────────────────┘
```

## O que Cada `expect()` Verifica

```typescript
// Igualdade exata
expect(5).toBe(5);                    // ✅ Pass
expect(5).toBe('5');                  // ❌ Fail (type mismatch)

// Booleano
expect(true).toBe(true);              // ✅ Pass
expect(true).toBe(false);             // ❌ Fail

// Undefined/Null
expect(undefined).toBeUndefined();    // ✅ Pass
expect(null).toBeNull();              // ✅ Pass

// Objetos
expect({a: 1}).toEqual({a: 1});      // ✅ Pass (valor igual)
expect({a: 1}).toBe({a: 1});         // ❌ Fail (não mesma referência)

// Arrays
expect([1,2,3]).toContain(2);         // ✅ Pass
expect([1,2,3]).toHaveLength(3);      // ✅ Pass

// String
expect('hello').toMatch(/hell/);      // ✅ Pass
expect('hello').toContain('ell');     // ✅ Pass

// Funções
const fn = jest.fn();
fn(1, 2);
expect(fn).toHaveBeenCalled();        // ✅ Pass
expect(fn).toHaveBeenCalledWith(1,2); // ✅ Pass

// Exceções
expect(() => {
  throw new Error('oops');
}).toThrow();                          // ✅ Pass
```

## Exemplo Completo: Um Arquivo de Teste Real

```typescript
// File: __tests__/authorization.test.ts

import { Response } from 'express';

describe('System Authorization Rules', () => {
  
  describe('User Types and Permissions', () => {
    
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

    it('admin_eventos (userTypeId 2) should manage events and championships', () => {
      // ARRANGE
      const user = { id: 1, userTypeId: 2, email: 'admin@example.com' };
      
      // ACT
      const canOrganizeEvent = user.userTypeId === 2;
      const canCreateTeam = true;
      const canApplyPunishment = user.userTypeId === 1;
      
      // ASSERT
      expect(canOrganizeEvent).toBe(true);
      expect(canCreateTeam).toBe(true);
      expect(canApplyPunishment).toBe(false);
    });

    it('admin_times (userTypeId 3) should manage teams only', () => {
      // ARRANGE
      const user = { id: 1, userTypeId: 3, email: 'admin@example.com' };
      
      // ACT
      const canCreateTeam = user.userTypeId === 3;
      const canApplyPunishment = user.userTypeId === 1;
      const canManageTeams = user.userTypeId === 3;
      
      // ASSERT
      expect(canCreateTeam).toBe(true);
      expect(canApplyPunishment).toBe(false);
      expect(canManageTeams).toBe(true);
    });

    it('usuario_comum (userTypeId 4) should only view content', () => {
      // ARRANGE
      const user = { id: 1, userTypeId: 4, email: 'user@example.com' };
      
      // ACT
      const canCreateTeam = user.userTypeId === 3;
      const canApplyPunishment = user.userTypeId === 1;
      const canViewMatches = true;
      
      // ASSERT
      expect(canCreateTeam).toBe(false);
      expect(canApplyPunishment).toBe(false);
      expect(canViewMatches).toBe(true);
    });
  });

  describe('One Team Per User Constraint', () => {
    
    it('admin_times user can create first team', () => {
      const userTeamCount = 0;
      const userTypeId = 3;
      const canCreate = userTypeId !== 3 || userTeamCount === 0;
      expect(canCreate).toBe(true);
    });

    it('admin_times user cannot create second team', () => {
      const userTeamCount = 1;
      const userTypeId = 3;
      const canCreate = userTypeId !== 3 || userTeamCount === 0;
      expect(canCreate).toBe(false);
    });
  });
});

// Para rodar:
// npm test authorization.test.ts

// Resultado:
// ✓ admin_master (userTypeId 1) should have access to all features
// ✓ admin_eventos (userTypeId 2) should manage events and championships
// ✓ admin_times (userTypeId 3) should manage teams only
// ✓ usuario_comum (userTypeId 4) should only view content
// ✓ admin_times user can create first team
// ✓ admin_times user cannot create second team
//
// Tests: 6 passed, 6 total
```

## Checklist: Você Entendeu?

Marque ✅ conforme você entender:

- [ ] O que é um teste unitário
- [ ] Por que testes são importantes
- [ ] Qual é a diferença entre AAA Pattern
- [ ] Como usar expect()
- [ ] O que é um mock
- [ ] Como rodar testes (npm test)
- [ ] Como ler a saída do Jest
- [ ] Qual é o propósito do beforeEach()
- [ ] Como testar uma regra de negócio
- [ ] Como mockar uma função

Se marcou tudo ✅ → Você entendeu tudo! 🎉

## Próximo Desafio

**Escreva seu próprio teste:**

```typescript
// Desafio: Testar que apenas admin_master pode deletar usuários

it('only admin_master can delete users', () => {
  // ARRANGE - prepare dados
  // ACT - execute lógica
  // ASSERT - verifique resultado
});
```

Dica: use a estrutura AAA que aprendeu!

---

**Parabéns! Você agora entende como os testes funcionam! 🚀**
