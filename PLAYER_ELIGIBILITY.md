# Sistema de Verificação de Elegibilidade de Jogadores

## Visão Geral

Este sistema verifica automaticamente se os jogadores estão aptos a participar das partidas, considerando cartões acumulados e suspensões ativas.

## Funcionalidades

### 1. Rastreamento Automático de Cartões

- **Cartões Amarelos**: Sistema conta acumulação por jogador
- **Cartões Vermelhos**: Gera suspensão imediata
- **Contexto**: Cartões são contados separadamente para campeonatos e partidas amistosas

### 2. Regras de Suspensão (Padrão)

- **3 Cartões Amarelos** → 1 jogo de suspensão
- **1 Cartão Vermelho** → 2 jogos de suspensão
- **Suspensão Manual** → Configurável por administradores

### 3. Verificação de Elegibilidade

Antes de escalar um jogador, o sistema verifica:
- ✅ Suspensões ativas
- ✅ Cartões amarelos acumulados
- ✅ Contexto (campeonato vs amistoso)

## Backend

### Modelos

#### PlayerSuspension
```typescript
{
  id: number;
  player_id: number;
  championship_id: number | null;  // null = partidas amistosas
  reason: 'yellow_cards' | 'red_card' | 'manual';
  yellow_cards_accumulated: number;
  games_to_suspend: number;
  games_suspended: number;
  is_active: boolean;
  start_date: Date;
  end_date: Date | null;
  notes: string | null;
}
```

### Serviço: PlayerEligibilityService

**Métodos principais:**

```typescript
// Verifica se jogador pode participar
checkPlayerEligibility(playerId, matchId, isChampionship): Promise<EligibilityResult>

// Processa cartão e cria suspensão se necessário
processCardAndCheckSuspension(playerId, matchId, cardType, isChampionship): Promise<Suspension | null>

// Atualiza suspensão após partida
processSuspensionAfterMatch(playerId, matchId, isChampionship): Promise<void>

// Busca suspensão ativa
getActiveSuspension(playerId, championshipId): Promise<Suspension | null>

// Conta cartões amarelos
getYellowCardsCount(playerId, championshipId): Promise<number>
```

### API Endpoints

#### Verificar Elegibilidade
```http
GET /api/players/:playerId/eligibility/:matchId?isChampionship=true
```

**Resposta:**
```json
{
  "eligible": false,
  "reason": "Jogador suspenso",
  "details": "Suspenso por 1 jogo(s) restante(s)",
  "activeSuspension": { ... }
}
```

#### Histórico de Suspensões
```http
GET /api/players/:playerId/suspension-history?championshipId=1
```

#### Suspensão Ativa
```http
GET /api/players/:playerId/active-suspension?championshipId=1
```

#### Criar Suspensão Manual (Admin)
```http
POST /api/players/suspension/manual
Content-Type: application/json

{
  "playerId": 123,
  "championshipId": 1,  // opcional
  "gamesToSuspend": 2,
  "notes": "Comportamento antidesportivo"
}
```

#### Listar Todas Suspensões (Admin)
```http
GET /api/players/suspensions/all
```

## Frontend

### Componentes

#### PlayerEligibilityBadge
Mostra badge visual indicando status do jogador:

```tsx
import PlayerEligibilityBadge from '@/components/features/players/PlayerEligibilityBadge';

<PlayerEligibilityBadge
  playerId={123}
  matchId={456}
  isChampionship={false}
  showDetails={true}
/>
```

**Badges:**
- 🔴 **Suspenso** - Jogador não pode jogar
- ⚠️ **2+ Amarelos** - Alerta de próxima suspensão
- ℹ️ **1 Amarelo** - Informativo

#### PlayerListWithEligibility
Lista de jogadores com badges de elegibilidade:

```tsx
import PlayerListWithEligibility from '@/components/features/players/PlayerListWithEligibility';

<PlayerListWithEligibility
  players={teamPlayers}
  matchId={matchId}
  isChampionship={false}
  onPlayerSelect={(player) => handleSelect(player)}
  selectedPlayers={[1, 2, 3]}
/>
```

### Hook: usePlayerEligibility

```tsx
import { usePlayerEligibility } from '@/hooks/usePlayerEligibility';

const { eligibility, loading, error, refetch } = usePlayerEligibility(
  playerId,
  matchId,
  isChampionship
);

if (eligibility?.eligible) {
  // Jogador pode jogar
}
```

### Página de Gerenciamento

Acesso em: `/suspensions`

**Funcionalidades:**
- Visualizar todas as suspensões
- Criar suspensões manuais
- Filtrar por status (ativa/inativa)
- Ver histórico completo

## Fluxo de Uso

### 1. Durante uma Partida

Quando um cartão é adicionado via `MatchEventsController.addCard()`:

1. Cartão é registrado em `match_cards`
2. Sistema verifica acúmulo de cartões
3. Se atingir limite → cria suspensão automática
4. Jogador fica impedido de jogar próxima(s) partida(s)

### 2. Ao Escalar Jogadores

Quando tentar adicionar jogador à escalação:

1. Frontend chama `GET /api/players/:id/eligibility/:matchId`
2. Sistema verifica suspensões ativas
3. Exibe badge visual com status
4. Bloqueia seleção se suspenso (opcional)

### 3. Pós-Partida

Após partida finalizada, para cada jogador que jogou:

```typescript
await PlayerEligibilityService.processSuspensionAfterMatch(
  playerId,
  matchId,
  isChampionship
);
```

Isso:
- Incrementa `games_suspended`
- Se cumpriu suspensão completa → desativa (`is_active = false`)

## Migrations

Para aplicar o sistema:

```bash
cd back-end
npm run migrate
```

Migration criada: `20251028_create_player_suspensions_table.ts`

## Configurações Futuras

Para customizar regras de suspensão, edite em `PlayerEligibilityService.ts`:

```typescript
private defaultRules: SuspensionRules = {
  yellowCardsForSuspension: 3,     // Quantos amarelos = suspensão
  gamesForYellowSuspension: 1,     // Jogos suspenso por amarelos
  gamesForRedSuspension: 2,        // Jogos suspenso por vermelho
};
```

## Exemplos de Uso

### Verificar elegibilidade antes de escalar

```typescript
const eligibility = await PlayerEligibilityService.checkPlayerEligibility(
  playerId,
  matchId,
  false // partida amistosa
);

if (!eligibility.eligible) {
  toast.error(`Jogador não pode jogar: ${eligibility.details}`);
  return;
}

// Prosseguir com escalação
```

### Criar suspensão manual

```typescript
const suspension = await PlayerEligibilityService.createSuspension(
  playerId,
  championshipId,
  'manual',
  0,
  3, // 3 jogos de suspensão
  'Agressão ao árbitro'
);
```

## Permissões

- **Admin (userTypeId = 1)**: Total
- **Admin Eventos (userTypeId = 2)**: Criar suspensões manuais, visualizar histórico
- **Admin Times (userTypeId = 3)**: Visualizar elegibilidade dos próprios jogadores
- **Usuário Comum (userTypeId = 4)**: Visualizar própria elegibilidade

## Troubleshooting

### Jogador não está sendo suspenso automaticamente

1. Verificar se cartão foi registrado com `player_id` (não apenas `user_id`)
2. Confirmar que `isChampionship` está correto
3. Checar logs do servidor após adicionar cartão

### Suspensão não está expirando

Certifique-se de chamar `processSuspensionAfterMatch()` após cada partida finalizada onde jogador suspenso participou.

### Frontend não mostra badges

1. Verificar se token JWT está válido
2. Confirmar que endpoint `/api/players/:id/eligibility/:matchId` responde
3. Checar console do navegador para erros

## Próximos Passos

- [ ] Interface de configuração de regras de suspensão
- [ ] Notificações push quando jogador for suspenso
- [ ] Relatório de disciplina por time/campeonato
- [ ] Exportar histórico de suspensões em PDF
- [ ] Recurso de apelação de suspensões
