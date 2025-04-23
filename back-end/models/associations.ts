import User from './UserModel';
import Match from './MatchModel';
import Team from './TeamModel';
import MatchPlayer from './MatchPlayersModel';
import TeamPlayer from './TeamPlayerModel';
import MatchReport from './MatchReportModel';
import MatchGoal from './MatchGoalModel';
import MatchCard from './MatchCardModel';
import MatchEvaluation from './MatchEvaluationModel';
import Championship from './ChampionshipModel';
import './TesteModel';


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

// MatchReport
MatchReport.belongsTo(User, { foreignKey: 'created_by' });
MatchReport.belongsTo(Match, { foreignKey: 'match_id' });
User.hasMany(MatchReport, { foreignKey: 'created_by' });
Match.hasOne(MatchReport, { foreignKey: 'match_id' });

// MatchGoal
MatchGoal.belongsTo(User, { foreignKey: 'user_id' });
MatchGoal.belongsTo(Match, { foreignKey: 'match_id' });
User.hasMany(MatchGoal, { foreignKey: 'user_id' });
Match.hasMany(MatchGoal, { foreignKey: 'match_id' });

// MatchCard
MatchCard.belongsTo(User, { foreignKey: 'user_id' });
MatchCard.belongsTo(Match, { foreignKey: 'match_id' });
User.hasMany(MatchCard, { foreignKey: 'user_id' });
Match.hasMany(MatchCard, { foreignKey: 'match_id' });

// MatchEvaluation
MatchEvaluation.belongsTo(User, { foreignKey: 'evaluator_id' });
MatchEvaluation.belongsTo(Match, { foreignKey: 'match_id' });
User.hasMany(MatchEvaluation, { foreignKey: 'evaluator_id' });
Match.hasMany(MatchEvaluation, { foreignKey: 'match_id' });

// Championship
Championship.belongsTo(User, { foreignKey: 'created_by' });
User.hasMany(Championship, { foreignKey: 'created_by' });
Match.belongsTo(Championship, { foreignKey: 'championship_id' });
Championship.hasMany(Match, { foreignKey: 'championship_id' });
