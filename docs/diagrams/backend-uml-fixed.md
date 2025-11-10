# Diagrama UML Completo - VarzeaLeague Backend

Diagrama de classes completo com todas as entidades e relacionamentos do sistema.

```mermaid
classDiagram
    class User {
        -id: int
        -name: String
        -cpf: String
        -phone: String
        -email: String
        -password: String
        -gender: String
        -userTypeId: int
        -resetPasswordToken: String
        -resetPasswordExpires: Date
        -isDeleted: boolean
        -createdAt: Date
        -updatedAt: Date
        +login() String
        +logout() void
        +updateProfile() void
        +resetPassword() void
        +validateCredentials() boolean
    }
    class UserType {
        -id: int
        -name: String
        -description: String
        +getPermissions() Array
        +canManageTeams() boolean
        +canManageEvents() boolean
        +canManageChampionships() boolean
    }
    class Team {
        -id: int
        -name: String
        -description: String
        -banner: String
        -primaryColor: String
        -secondaryColor: String
        -foundationDate: Date
        -userId: int
        -isDeleted: boolean
        -createdAt: Date
        -updatedAt: Date
        +addPlayer() void
        +removePlayer() void
        +updateInfo() void
        +uploadBanner() String
        +getStats() Object
        +getHistory() Array
    }
    class Player {
        -id: int
        -name: String
        -gender: String
        -dateOfBirth: Date
        -position: String
        -isDeleted: boolean
        -createdAt: Date
        -updatedAt: Date
        +getAge() int
        +getStats() Object
        +isAvailable() boolean
        +updatePosition() void
    }
    class TeamPlayer {
        -id: int
        -teamId: int
        -playerId: int
        -joinDate: Date
        -isActive: boolean
        -createdAt: Date
        -updatedAt: Date
        +activate() void
        +deactivate() void
        +isCurrentlyActive() boolean
    }
    class TeamUser {
        -id: int
        -teamId: int
        -userId: int
        -createdAt: Date
        -updatedAt: Date
        +isActive() boolean
    }
    class MatchTeams {
        -id: int
        -matchId: int
        -teamId: int
        -status: String
        -joinedAt: Date
        -createdAt: Date
        -updatedAt: Date
        +getTeamStatus() String
    }
    class MatchChampionshipTeams {
        -id: int
        -matchChampionshipId: int
        -teamId: int
        -isHome: boolean
        -createdAt: Date
        -updatedAt: Date
        +setAsHome() void
        +setAsAway() void
        +isHomeTeam() boolean
    }
    class FriendlyMatchPenalty {
        -id: int
        -idMatch: int
        -idTeam: int
        -idPlayer: int
        -penaltyType: String
        -description: String
        -appliedAt: Date
        -isActive: boolean
        -createdAt: Date
        -updatedAt: Date
        +apply() void
        +revoke() void
        +isExpired() boolean
    }
    class ChampionshipPenalty {
        -id: int
        -championshipId: int
        -teamId: int
        -matchChampionshipId: int
        -reason: String
        -appliedAt: Date
        -isActive: boolean
        -createdAt: Date
        -updatedAt: Date
        +apply() void
        +revoke() void
        +isExpired() boolean
    }
    class ChampionshipGroup {
        -id: int
        -championshipId: int
        -name: String
        -description: String
        -createdAt: Date
        -updatedAt: Date
        +addTeam(teamId: int) void
        +removeTeam(teamId: int) void
        +getTeams() Array
        +getStandings() Array
    }
    class FriendlyMatch {
        -id: int
        -title: String
        -date: Date
        -location: String
        -status: String
        -organizerId: int
        -price: decimal
        -duration: String
        -square: String
        -matchType: String
        -cep: String
        -uf: String
        -isDeleted: boolean
        -createdAt: Date
        -updatedAt: Date
        +confirmMatch() void
        +cancelMatch() void
        +updateStatus() void
        +isRegistrationOpen() boolean
        +getParticipants() Array
    }
    class FriendlyMatchRules {
        -id: int
        -matchId: int
        -registrationDeadline: Date
        -registrationDeadlineTime: Time
        -minimumAge: int
        -maximumAge: int
        -gender: String
        +isRegistrationOpen() boolean
        +validatePlayer() boolean
        +updateDeadline() void
    }
    class FriendlyMatchReport {
        -id: int
        -matchId: int
        -homeTeamId: int
        -awayTeamId: int
        -homeTeamScore: int
        -awayTeamScore: int
        -status: String
        -observations: String
        -createdAt: Date
        -updatedAt: Date
        +addGoal() void
        +addCard() void
        +finalizeMatch() void
        +exportPDF() File
        +calculateResult() String
    }
    class Goal {
        -id: int
        -matchId: int
        -userId: int
        -playerId: int
        -teamId: int
        -minute: int
        -createdAt: Date
        -updatedAt: Date
        +validate() boolean
        +save() void
    }
    class Card {
        -id: int
        -matchId: int
        -userId: int
        -playerId: int
        -teamId: int
        -cardType: String
        -minute: int
        -createdAt: Date
        -updatedAt: Date
        +isYellow() boolean
        +isRed() boolean
        +validate() boolean
        +save() void
    }
    class Attendance {
        -id: int
        -matchId: int
        -playerId: int
        -teamId: int
        -status: String
        -confirmedAt: Date
        -createdAt: Date
        -updatedAt: Date
        +confirm() void
        +decline() void
        +isConfirmed() boolean
    }
    class Championship {
        -id: int
        -name: String
        -description: String
        -startDate: Date
        -endDate: Date
        -createdBy: int
        -modalidade: String
        -nomeQuadra: String
        -tipo: String
        -faseGrupos: boolean
        -maxTeams: int
        -genero: String
        -status: String
        -isDeleted: boolean
        -createdAt: Date
        -updatedAt: Date
        +openRegistration() void
        +closeRegistration() void
        +publish() void
        +generateMatches() void
        +getStandings() Array
        +isRegistrationOpen() boolean
    }
    class ChampionshipApplication {
        -id: int
        -championshipId: int
        -teamId: int
        -applicationDate: Date
        -status: String
        -rejectionReason: String
        -approvedBy: int
        -approvedAt: Date
        -createdAt: Date
        -updatedAt: Date
        +approve() void
        +reject() void
        +isPending() boolean
        +isApproved() boolean
    }
    class TeamChampionship {
        -id: int
        -teamId: int
        -championshipId: int
        -groupId: int
        -points: int
        -wins: int
        -draws: int
        -losses: int
        -goalsFor: int
        -goalsAgainst: int
        -goalDifference: int
        -isActive: boolean
        -joinedAt: Date
        -createdAt: Date
        -updatedAt: Date
        +updateStats() void
        +calculateGoalDifference() int
        +getPosition() int
    }
    class MatchChampionship {
        -id: int
        -championshipId: int
        -date: Date
        -location: String
        -quadra: String
        -rodada: int
        -createdAt: Date
        -updatedAt: Date
        +schedule() void
        +reschedule() void
        +isCompleted() boolean
        +getResult() Object
    }
    class MatchReportChampionship {
        -id: int
        -matchId: int
        -homeTeamScore: int
        -awayTeamScore: int
        -status: String
        -observations: String
        -reportedBy: int
        -reportedAt: Date
        -createdAt: Date
        -updatedAt: Date
        +finalize() void
        +finalizeWO() void
        +updateScore() void
        +getWinner() Team
    }
    class ChampionshipMatchGoal {
        -id: int
        -matchId: int
        -userId: int
        -playerId: int
        -teamId: int
        -minute: int
        -createdAt: Date
        -updatedAt: Date
        +validate() boolean
        +save() void
    }
    class ChampionshipMatchCard {
        -id: int
        -matchId: int
        -userId: int
        -playerId: int
        -teamId: int
        -cardType: String
        -minute: int
        -createdAt: Date
        -updatedAt: Date
        +isYellow() boolean
        +isRed() boolean
        +validate() boolean
        +save() void
    }
    class Notification {
        -id: int
        -userId: int
        -type: String
        -title: String
        -message: String
        -isRead: boolean
        -relatedMatchId: int
        -relatedTeamId: int
        -relatedChampionshipId: int
        -createdAt: Date
        -updatedAt: Date
        +markAsRead() void
        +markAsUnread() void
        +send() void
    }
    class UserController {
        <<controller>>
        +index() Promise
        +store() Promise
        +update() Promise
        +remove() Promise
        +getById() Promise
    }
    class TeamController {
        <<controller>>
        +create() Promise
        +index() Promise
        +show() Promise
        +update() Promise
        +delete() Promise
        +uploadBanner() Promise
    }
    class PlayerController {
        <<controller>>
        +create() Promise
        +addToTeam() Promise
        +getPlayersFromTeam() Promise
        +removeFromTeam() Promise
        +update() Promise
        +delete() Promise
    }
    class FriendlyMatchController {
        <<controller>>
        +createMatch() Promise
        +listMatches() Promise
        +getMatch() Promise
        +updateMatch() Promise
        +cancelMatch() Promise
        +deleteMatch() Promise
    }
    class ChampionshipController {
        <<controller>>
        +createChampionship() Promise
        +listChampionships() Promise
        +getChampionship() Promise
        +updateChampionship() Promise
        +deleteChampionship() Promise
        +publishChampionship() Promise
    }
    UserType ||--o{ User
    User ||--o{ Team
    Team }o--o{ User
    TeamUser }o--|| Team
    TeamUser }o--|| User
    Team }o--o{ Player
    TeamPlayer }o--|| Team
    TeamPlayer }o--|| Player
    User ||--o{ FriendlyMatch
    FriendlyMatch ||--o| FriendlyMatchRules
    FriendlyMatch ||--o| FriendlyMatchReport
    FriendlyMatch ||--o{ Goal
    FriendlyMatch ||--o{ Card
    FriendlyMatch ||--o{ Attendance
    FriendlyMatch ||--o{ FriendlyMatchPenalty
    FriendlyMatch }o--o{ Team
    MatchTeams }o--|| FriendlyMatch
    MatchTeams }o--|| Team
    Goal }o--o| User
    Goal }o--o| Player
    Goal }o--o| Team
    Card }o--o| User
    Card }o--o| Player
    Card }o--o| Team
    Attendance }o--|| Player
    Attendance }o--|| Team
    FriendlyMatchPenalty }o--|| Team
    FriendlyMatchPenalty }o--o| Player
    FriendlyMatchReport }o--o| Team
    User ||--o{ Championship
    Championship ||--o{ ChampionshipApplication
    Championship ||--o{ TeamChampionship
    Championship ||--o{ MatchChampionship
    Championship ||--o{ ChampionshipGroup
    Championship ||--o{ ChampionshipPenalty
    Team ||--o{ ChampionshipApplication
    ChampionshipApplication }o--|| Championship
    ChampionshipApplication }o--|| Team
    ChampionshipApplication }o--o| User
    Team ||--o{ TeamChampionship
    TeamChampionship }o--|| Championship
    TeamChampionship }o--|| Team
    TeamChampionship }o--o| ChampionshipGroup
    ChampionshipGroup ||--o{ TeamChampionship
    MatchChampionship ||--o| MatchReportChampionship
    MatchChampionship ||--o{ ChampionshipMatchGoal
    MatchChampionship ||--o{ ChampionshipMatchCard
    MatchChampionship }o--o{ Team
    MatchChampionshipTeams }o--|| MatchChampionship
    MatchChampionshipTeams }o--|| Team
    ChampionshipMatchGoal }o--o| User
    ChampionshipMatchGoal }o--o| Player
    ChampionshipMatchGoal }o--o| Team
    ChampionshipMatchCard }o--o| User
    ChampionshipMatchCard }o--o| Player
    ChampionshipMatchCard }o--o| Team
    ChampionshipPenalty }o--|| Team
    ChampionshipPenalty }o--o| MatchChampionship
    MatchReportChampionship }o--o| User
    User ||--o{ Notification
    Notification }o--o| FriendlyMatch
    Notification }o--o| Team
    Notification }o--o| Championship
    UserController ..> User
    TeamController ..> Team
    PlayerController ..> Player
    FriendlyMatchController ..> FriendlyMatch
    ChampionshipController ..> Championship
```

## Legenda das Cardinalidades

- `||--o{` : Um para muitos (1:N)
- `}o--||` : Muitos para um (N:1)
- `}o--o{` : Muitos para muitos (N:N)
- `||--o|` : Um para zero ou um (1:0..1)
- `}o--o|` : Muitos para zero ou um (N:0..1)
- `..>` : Dependência (Controllers)

## Entidades Principais

### 🔐 **Sistema de Usuários**
- **UserType**: Tipos de usuário (admin_master, admin_eventos, etc.)
- **User**: Usuários do sistema

### ⚽ **Times e Jogadores**
- **Team**: Times do sistema
- **Player**: Jogadores
- **TeamPlayer**: Relacionamento N:N entre times e jogadores
- **TeamUser**: Relacionamento N:N entre times e usuários (membros)

### 🤝 **Partidas Amistosas**
- **FriendlyMatch**: Partidas amistosas
- **FriendlyMatchRules**: Regras das partidas
- **FriendlyMatchReport**: Súmulas das partidas
- **MatchTeams**: Times participantes (N:N)
- **FriendlyMatchPenalty**: Penalidades aplicadas
- **Attendance**: Controle de presença

### 🏆 **Sistema de Campeonatos**
- **Championship**: Campeonatos
- **ChampionshipApplication**: Inscrições de times
- **TeamChampionship**: Participação dos times
- **MatchChampionship**: Partidas do campeonato
- **MatchChampionshipTeams**: Times nas partidas (N:N)
- **ChampionshipGroup**: Grupos dos campeonatos
- **ChampionshipPenalty**: Penalidades do campeonato
- **MatchReportChampionship**: Súmulas das partidas

### 📊 **Eventos das Partidas**
- **Goal**: Gols marcados
- **Card**: Cartões aplicados
- **ChampionshipMatchGoal**: Gols em campeonatos
- **ChampionshipMatchCard**: Cartões em campeonatos

### 📱 **Notificações**
- **Notification**: Sistema de notificações

### 🎮 **Controllers**
- Camada de controle seguindo padrão MVC