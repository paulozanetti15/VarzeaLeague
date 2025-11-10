# Estrutura do Banco de Dados - Agendamento de Partidas de Campeonato

## Tabelas Necessárias

### 1. `match_championship`
Tabela principal para armazenar as partidas de campeonato.

**Campos:**
- `id` (INTEGER, PK, AUTO_INCREMENT)
- `championship_id` (INTEGER, FK -> championships.id, NOT NULL)
- `date` (DATE, NOT NULL)
- `location` (STRING, NOT NULL, 5-200 caracteres)
- `nomequadra` (STRING, NOT NULL)
- `Rodada` (INTEGER, NOT NULL)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**SQL de Criação:**
```sql
CREATE TABLE IF NOT EXISTS `match_championship` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `championship_id` INTEGER NOT NULL,
  `date` DATETIME NOT NULL,
  `location` VARCHAR(200) NOT NULL,
  `nomequadra` VARCHAR(255) NOT NULL,
  `Rodada` INTEGER NOT NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`championship_id`) REFERENCES `championships`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_championship_id` (`championship_id`),
  INDEX `idx_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2. `match_reports_championship`
Tabela para armazenar os times participantes e placares das partidas de campeonato.

**Campos:**
- `id` (INTEGER, PK, AUTO_INCREMENT)
- `match_id` (INTEGER, FK -> match_championship.id, NOT NULL)
- `team_home` (INTEGER, FK -> teams.id, NOT NULL)
- `team_away` (INTEGER, FK -> teams.id, NOT NULL)
- `teamHome_score` (INTEGER, NOT NULL, DEFAULT 0)
- `teamAway_score` (INTEGER, NOT NULL, DEFAULT 0)
- `created_by` (INTEGER, FK -> users.id, NOT NULL)
- `is_penalty` (BOOLEAN, NOT NULL, DEFAULT false)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**SQL de Criação:**
```sql
CREATE TABLE IF NOT EXISTS `match_reports_championship` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `match_id` INTEGER NOT NULL,
  `team_home` INTEGER NOT NULL,
  `team_away` INTEGER NOT NULL,
  `teamHome_score` INTEGER NOT NULL DEFAULT 0,
  `teamAway_score` INTEGER NOT NULL DEFAULT 0,
  `created_by` INTEGER NOT NULL,
  `is_penalty` BOOLEAN NOT NULL DEFAULT false,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`match_id`) REFERENCES `match_championship`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`team_home`) REFERENCES `teams`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`team_away`) REFERENCES `teams`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_match_id` (`match_id`),
  INDEX `idx_team_home` (`team_home`),
  INDEX `idx_team_away` (`team_away`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Relacionamentos

1. **match_championship** → **championships** (N:1)
   - Uma partida pertence a um campeonato
   - `championship_id` referencia `championships.id`

2. **match_reports_championship** → **match_championship** (N:1)
   - Um report pertence a uma partida
   - `match_id` referencia `match_championship.id`

3. **match_reports_championship** → **teams** (N:1 para team_home e team_away)
   - Um report tem dois times (mandante e visitante)
   - `team_home` e `team_away` referenciam `teams.id`

4. **match_reports_championship** → **users** (N:1)
   - Um report foi criado por um usuário
   - `created_by` referencia `users.id`

## Validações

- Os times (`team_home` e `team_away`) devem estar inscritos no campeonato (tabela `team_championships`)
- A data da partida deve ser futura
- Os times devem ser diferentes
- Todos os campos obrigatórios devem ser preenchidos

## Status

✅ **Estrutura já existe no código**
- Modelo `MatchChampionship` definido em `back-end/models/MatchChampionshipModel.ts`
- Modelo `MatchChampionshpReport` definido em `back-end/models/MatchReportChampionshipModel.ts`
- Controller `createChampionshipMatch` implementado em `back-end/controllers/championshipController.ts`
- Rota configurada em `back-end/routes/championshipRoutes.ts`

⚠️ **Verificar se as tabelas existem no banco de dados**
- Se as tabelas não existirem, executar os SQLs acima ou usar as migrations do Sequelize
- O Sequelize pode criar automaticamente se `sync()` estiver configurado

