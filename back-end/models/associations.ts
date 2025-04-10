import User from './UserModel';
import Match from './MatchModel';
import Team from './TeamModel';
import MatchPlayer from './MatchPlayersModel';
import TeamPlayer from './TeamPlayerModel';

// Associações do modelo User
User.hasMany(Match, {
  foreignKey: 'organizerId',
  as: 'organizedMatches'
});
User.hasMany(MatchPlayer, { foreignKey: 'user_id' });
// Add this to your MatchPlayer model file where associations are defined
MatchPlayer.belongsTo(User, { foreignKey: 'user_id' });

User.belongsToMany(Match, {
  through: MatchPlayer,
  as: 'matches',
  foreignKey: 'userId',
  otherKey: 'matchId'
});

User.hasMany(Team, {
  foreignKey: 'captainId',
  as: 'captainedTeams'
});

User.belongsToMany(Team, {
  through: TeamPlayer,
  as: 'teams',
  foreignKey: 'userId',
  otherKey: 'teamId'
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
  otherKey: 'userId'
});

// Associações do modelo Team
Team.belongsTo(User, {
  foreignKey: 'captainId',
  as: 'captain'
});

Team.belongsToMany(User, {
  through: TeamPlayer,
  as: 'players',
  foreignKey: 'teamId',
  otherKey: 'userId'
}); 