# Diagrama UML Básico - VarzeaLeague

Este diagrama mostra os principais models do sistema VarzeaLeague combinando partidas amistosas e campeonatos.

```mermaid
classDiagram
    %% ===== USUÁRIOS E PERMISSÕES =====
    class UserType {
        -id: int
        -name: String
        -description: String
        +getPermissions() Array
        +canManageTeams() boolean
        +canManageEvents() boolean
    }

    class User {
        -id: int
        -name: String
        -email: String
        -password: String
        -userTypeId: int
        +login() String
        +logout() void
        +index() Promise
        +store() Promise
        +update() Promise
    }

    %% ===== TIMES E JOGADORES =====
    class Team {
        -id: int
        -name: String
        -description: String
        -banner: String
        -userId: int
        +createTeam() Promise
        +listTeams() Promise
        +getTeam() Promise
        +updateTeam() Promise
        +deleteTeam() Promise
        +getStats() Object
        +uploadBanner() Promise
    }

    class Player {
        -id: int
        -name: String
        -gender: String
        -dateOfBirth: Date
        -position: String
        +create() Promise
        +addToTeam() Promise
        +removeFromTeam() Promise
        +update() Promise
        +getAge() int
        +isAvailable() boolean
    }

    class TeamPlayer {
        -teamId: int
        -playerId: int
        -joinDate: Date
        -isActive: boolean
        +activate() void
        +deactivate() void
    }

    %% ===== PARTIDAS AMISTOSAS =====
    class FriendlyMatch {
        -id: int
        -title: String
        -date: Date
        -location: String
        -status: String
        -organizerId: int
        +createMatch() Promise
        +listMatches() Promise
        +updateMatch() Promise
        +finalizeMatch() Promise
    }

    class FriendlyMatchRules {
        -matchId: int
        -minimumAge: int
        -maximumAge: int
        -gender: String
        +isRegistrationOpen() boolean
        +validatePlayer() boolean
    }

    class MatchTeams {
        -matchId: int
        -teamId: int
        -status: String
        +joinMatchByTeam() Promise
        +getMatchTeams() Promise
    }

    %% ===== CAMPEONATOS =====
    class Championship {
        -id: int
        -name: String
        -description: String
        -startDate: Date
        -endDate: Date
        -createdBy: int
        -status: String
        +createChampionship() Promise
        +listChampionships() Promise
        +updateChampionship() Promise
        +publishChampionship() Promise
    }

    class ChampionshipApplication {
        -championshipId: int
        -teamId: int
        -status: String
        +approve() void
        +reject() void
        +isPending() boolean
    }

    class TeamChampionship {
        -teamId: int
        -championshipId: int
        -points: int
        -wins: int
        -draws: int
        -losses: int
        +updateStats() void
        +getPosition() int
    }

    class MatchChampionship {
        -championshipId: int
        -date: Date
        -location: String
        -rodada: int
        +schedule() void
        +isCompleted() boolean
        +getResult() Object
    }

    %% ===== RELACIONAMENTOS =====
    
    UserType "1" --> "*" User : define tipo
    User "1" --> "*" Team : cria time
    Team "1" --> "*" TeamPlayer : tem elenco
    Player "1" --> "*" TeamPlayer : faz parte
    
    User "1" --> "*" FriendlyMatch : organiza
    FriendlyMatch "1" --> "0..1" FriendlyMatchRules : tem regras
    FriendlyMatch "1" --> "*" MatchTeams : possui times
    Team "1" --> "*" MatchTeams : participa
    
    User "1" --> "*" Championship : cria
    Team "1" --> "*" ChampionshipApplication : se inscreve
    Championship "1" --> "*" ChampionshipApplication : recebe
    Championship "1" --> "*" TeamChampionship : classifica
    Championship "1" --> "*" MatchChampionship : gera partidas
    Team "1" --> "*" TeamChampionship : participa
```

## 🎯 **VarzeaLeague - Principais Funcionalidades:**

### 👥 **Gestão de Usuários e Times:**
- **Usuários** com diferentes tipos de permissão
- **Times** com capitães e jogadores
- **Elencos** e vínculos de jogadores

### ⚽ **Partidas Amistosas:**
- **Criação** de partidas pelos usuários
- **Regras personalizáveis** (idade, gênero)
- **Participação** de múltiplos times
- **Gestão** completa do ciclo da partida

### 🏆 **Campeonatos:**
- **Criação** de torneios oficiais
- **Sistema de inscrições** com aprovação
- **Classificações** e pontuação
- **Partidas** organizadas por rodadas

### 📊 **Funcionalidades Transversais:**
- **Estatísticas** de times e jogadores
- **Histórico** de participações
- **Upload** de banners e logos
- **Sistema** de status e validações