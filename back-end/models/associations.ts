import User from './User';
import Match from './Match';
import Team from './Team';
import MatchPlayer from './match_players';

// Associações do modelo User
User.hasMany(Match, {
  foreignKey: 'organizerId',
  as: 'organizedMatches'
});

User.belongsToMany(Match, {
  through: MatchPlayer,
  as: 'matches',
  foreignKey: 'userId',
  otherKey: 'matchId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

User.hasMany(Team, {
  foreignKey: 'captainId',
  as: 'captainedTeams'
});

User.belongsToMany(Team, {
  through: 'team_players',
  as: 'teams',
  foreignKey: 'userId',
  otherKey: 'teamId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// Associações do modelo Match
Match.belongsTo(User, {
  foreignKey: 'organizerId',
  as: 'organizer'
});

Match.belongsToMany(User, {
  through: MatchPlayer,
  as: 'players',
  foreignKey: 'matchId',
  otherKey: 'userId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// Associações do modelo Team
Team.belongsTo(User, {
  foreignKey: 'captainId',
  as: 'captain',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Team.belongsToMany(User, {
  through: 'team_players',
  as: 'players',
  foreignKey: 'teamId',
  otherKey: 'userId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
}); 