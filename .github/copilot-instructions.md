# Instruções para Copilot - VarzeaLeague

## Regras Gerais de Código

### ❌ NUNCA FAÇA:
- **NÃO adicione comentários explicativos no código** - O código deve ser autoexplicativo
- **NÃO crie documentação JSDoc** (/** ... */) - Exceção apenas para APIs públicas complexas
- **NÃO adicione console.log para debug** - Use apenas quando explicitamente solicitado
- **NÃO escreva comentários óbvios** como `// Buscar usuário`, `// Validar dados`, etc.
- **NÃO adicione comentários TODO, FIXME, HACK**
- **NÃO crie blocos de comentários de cabeçalho** em arquivos
- **NÃO documente cada parâmetro de função** - Tipos TypeScript são suficientes
- **NÃO adicione comentários inline** explicando o que uma linha faz

### ✅ PODE FAZER:
- Usar nomes de variáveis e funções descritivos que dispensem comentários
- Criar interfaces TypeScript bem definidas
- Usar tipos explícitos ao invés de documentação
- Escrever código limpo e legível que se explica sozinho

## Exemplos

### ❌ NÃO FAÇA ISSO:
```typescript
// Buscar o jogador no banco de dados
const player = await Player.findByPk(id);

// Verificar se o jogador existe
if (!player) {
  // Retornar erro 404
  res.status(404).json({ error: 'Jogador não encontrado' });
  return;
}

// Atualizar os dados do jogador
await player.update({
  nome: data.nome,
  // Atualizar sexo
  sexo: data.sexo,
  // Atualizar ano de nascimento
  ano: data.ano
});

// Log de sucesso
console.log('Jogador atualizado com sucesso:', player.id);
```

### ✅ FAÇA ISSO:
```typescript
const player = await Player.findByPk(id);

if (!player) {
  res.status(404).json({ error: 'Jogador não encontrado' });
  return;
}

await player.update({
  nome: data.nome,
  sexo: data.sexo,
  ano: data.ano
});
```

### ❌ NÃO FAÇA ISSO:
```typescript
/**
 * Valida se um nome de jogador está disponível
 * @param {string} nome - O nome do jogador a ser validado
 * @param {number} excludePlayerId - ID do jogador a excluir da verificação
 * @returns {Promise<{available: boolean, message?: string}>} Objeto com resultado
 */
static async isPlayerNameAvailable(nome: string, excludePlayerId?: number): Promise<{available: boolean, message?: string}> {
  // Normalizar o nome
  const normalizedName = nome.trim().toLowerCase();
  
  // Buscar jogador duplicado
  const existingPlayer = await Player.findOne({...});
  
  // Retornar resultado
  return { available: !existingPlayer };
}
```

### ✅ FAÇA ISSO:
```typescript
static async isPlayerNameAvailable(
  nome: string, 
  excludePlayerId?: number
): Promise<{available: boolean, message?: string}> {
  const normalizedName = nome.trim().toLowerCase();
  
  const existingPlayer = await Player.findOne({
    where: { 
      nome: normalizedName,
      ...(excludePlayerId && { id: { [Op.ne]: excludePlayerId } })
    }
  });
  
  return { available: !existingPlayer };
}
```

## Princípios de Código Limpo

1. **Nomes Descritivos**: Use nomes de variáveis/funções que expliquem sua intenção
   - ✅ `const normalizedPlayerName = nome.trim().toLowerCase()`
   - ❌ `const n = nome.trim().toLowerCase() // normalizar nome`

2. **Funções Pequenas**: Funções devem fazer apenas uma coisa
   - Se precisar de comentário para explicar seções, divida em funções menores

3. **Tipos ao Invés de Documentação**: Use TypeScript para documentar
   - ✅ `interface PlayerUpdateData { nome: string; sexo: 'Masculino' | 'Feminino' }`
   - ❌ `// sexo deve ser 'Masculino' ou 'Feminino'`

4. **Erros Explicativos**: Mensagens de erro devem ser claras
   - ✅ `{ error: 'Jogador com este nome já está vinculado a outro time' }`
   - ❌ `{ error: 'Duplicated' } // nome duplicado`

5. **Estrutura Clara**: Organize o código de forma que o fluxo seja óbvio
   - Use early returns para validações
   - Evite aninhamento profundo

## Contexto do Projeto VarzeaLeague

### Stack Tecnológico
- **Backend**: Node.js + Express + TypeScript + Sequelize + MySQL
- **Frontend**: React 18 + TypeScript + Vite + Material-UI + Bootstrap
- **Autenticação**: JWT com middleware `AuthRequest`

### Convenções Específicas

#### Backend
- Controllers são classes com métodos estáticos `async (req: AuthRequest, res: Response): Promise<void>`
- Sempre normalizar nomes: `nome.trim().toLowerCase()`
- Usar soft delete: `isDeleted: false` nas queries
- Mensagens de erro amigáveis, não códigos técnicos
- Reutilizar jogadores sem vínculo ao invés de criar duplicatas

#### Frontend
- Componentes em `components/features/{modulo}/{Componente}/`
- Export default para componentes, export const para utilities
- Named imports quando `export const`, default imports quando `export default`
- Usar `react-hot-toast` para notificações
- Usar `errorHandler.ts` para mapear erros de API

#### Modelos Sequelize
- Definir associações em `models/associations.ts`
- Usar `as: 'alias'` nas associações
- Sempre incluir `isDeleted: false` em queries

### Permissões (UserType)
1. `admin_master` - Sistema completo
2. `admin_eventos` - Partidas e Campeonatos
3. `admin_times` - Gestão de times
4. `usuario_comum` - Visualização

## Quando Comentários São Aceitáveis

Use comentários APENAS quando:

1. **Lógica de Negócio Complexa não-óbvia**:
   ```typescript
   const taxaDescontoFinal = calcularDesconto(valor, categoria);
   // Regra específica da diretoria: desconto máximo de 40% para categoria Premium
   if (categoria === 'Premium' && taxaDescontoFinal > 0.4) {
     taxaDescontoFinal = 0.4;
   }
   ```

2. **Workarounds Temporários** (com data de revisão):
   ```typescript
   // TEMP (2025-10-16): Sequelize bug com MySQL 8.0.33 - remover quando atualizar
   const result = await sequelize.query(rawSQL, { raw: true });
   ```

3. **Decisões Arquiteturais não-óbvias**:
   ```typescript
   // Utilizamos eager loading aqui para evitar N+1 queries em listas grandes (> 1000 items)
   include: [{ model: TeamPlayer, as: 'teamPlayers' }]
   ```

## Comandos de Desenvolvimento

```bash
# Backend
cd back-end; npm run dev

# Frontend  
cd Front-end; npm run dev

# Migrations
cd back-end; npm run migrate
```

## Checklist para Code Review

Antes de gerar código, verifique:
- [ ] Código está livre de comentários desnecessários?
- [ ] Nomes de variáveis/funções são autoexplicativos?
- [ ] Tipos TypeScript estão bem definidos?
- [ ] Sem console.log de debug?
- [ ] Mensagens de erro são amigáveis?
- [ ] Validações estão claras sem comentários?
- [ ] Código segue as convenções do projeto?

## Referência Rápida

- Modelos: `back-end/models/`
- Controllers: `back-end/controllers/`
- Rotas: `back-end/routes/`
- Componentes: `Front-end/src/components/`
- Páginas: `Front-end/src/pages/`
- Hooks: `Front-end/src/hooks/`
