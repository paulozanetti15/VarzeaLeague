# Diagrama UML do Backend VarzeaLeague

Este diagrama mostra todas as entidades do backend e seus relacionamentos com cardinalidades seguindo o padrão UML.

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
    FriendlyMatch ||--|| FriendlyMatchRules
    FriendlyMatch ||--o{ Goal
    FriendlyMatch ||--o{ Card
    Goal }o--o| User
    Goal }o--o| Player
    Goal }o--o| Team
    Card }o--o| User
    Card }o--o| Player
    Card }o--o| Team
    User ||--o{ Championship
    Championship ||--o{ ChampionshipApplication
    Championship ||--o{ TeamChampionship
    Championship ||--o{ MatchChampionship
    Team ||--o{ ChampionshipApplication
    ChampionshipApplication }o--|| Championship
    ChampionshipApplication }o--|| Team
    ChampionshipApplication }o--o| User
    Team ||--o{ TeamChampionship
    TeamChampionship }o--|| Championship
    TeamChampionship }o--|| Team
    MatchChampionship ||--o{ ChampionshipMatchGoal
    MatchChampionship ||--o{ ChampionshipMatchCard
    MatchChampionship }o--|| Championship
    ChampionshipMatchGoal }o--o| User
    ChampionshipMatchGoal }o--o| Player
    ChampionshipMatchGoal }o--o| Team
    ChampionshipMatchGoal }o--|| MatchChampionship
    ChampionshipMatchCard }o--o| User
    ChampionshipMatchCard }o--o| Player
    ChampionshipMatchCard }o--o| Team
    ChampionshipMatchCard }o--|| MatchChampionship
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

- `||--o{` : Um para muitos (1 para 0..*)
- `}o--||` : Muitos para um (0..* para 1)
- `}o--o{` : Muitos para muitos (0..* para 0..*)
- `||--||` : Um para um (1 para 1)
- `}o--o|` : Muitos para zero ou um (0..* para 0..1)
- `..>` : Dependência (controllers para modelos)

## Principais Relacionamentos

1. **UserType → User**: Um tipo de usuário pode ter vários usuários
2. **User → Team**: Um usuário pode criar várias equipes
3. **Team ↔ Player**: Relacionamento N:N através de TeamPlayer (elencos)
4. **Team ↔ User**: Relacionamento N:N através de TeamUser (administração)
5. **User → FriendlyMatch**: Um usuário organiza várias partidas amistosas
6. **User → Championship**: Um usuário cria vários campeonatos
7. **Championship → Teams**: Times se inscrevem via ChampionshipApplication
8. **Championship → Matches**: Campeonatos têm várias partidas
9. **Matches → Events**: Partidas têm gols e cartões registrados