import User from './UserModel';
import Match from './MatchModel';
import Team from './TeamModel';
import MatchPlayer from './MatchTeamsModel';
import TeamPlayer from './TeamPlayerModel';
import MatchReport from './MatchReportModel';
import MatchGoal from './MatchGoalModel';
import MatchCard from './MatchCardModel';
import MatchEvaluation from './MatchEvaluationModel';
import Championship from './ChampionshipModel';

// User <-> Match associations
export function associateModels() {
  User.hasMany(Match, {
    foreignKey: 'organizerId',
    as: 'organizedMatches'
  });

  Match.belongsTo(User, {
    foreignKey: 'organizerId',
    as: 'organizer'
  });
 

  Team.belongsTo(User, {
    foreignKey: 'captainId',
    as: 'captain'
  });

  User.hasMany(Team, {
    foreignKey: 'captainId',
    as: 'captainedTeams'
  });

  // Team Players associations
  Team.belongsToMany(User, {
    through: TeamPlayer,
    as: 'players',
    foreignKey: 'teamId',
    otherKey: 'userId'
  });

  User.belongsToMany(Team, {
    through: TeamPlayer,
    as: 'teams',
    foreignKey: 'userId',
    otherKey: 'teamId'
  });

  // Match Reports
  MatchReport.belongsTo(User, { foreignKey: 'createdBy' });
  MatchReport.belongsTo(Match, { foreignKey: 'matchId' });
  User.hasMany(MatchReport, { foreignKey: 'createdBy' });
  Match.hasOne(MatchReport, { foreignKey: 'matchId' });

  // Match Goals
  MatchGoal.belongsTo(User, { foreignKey: 'userId' });
  MatchGoal.belongsTo(Match, { foreignKey: 'matchId' });
  User.hasMany(MatchGoal, { foreignKey: 'userId' });
  Match.hasMany(MatchGoal, { foreignKey: 'matchId' });

  // Match Cards
  MatchCard.belongsTo(User, { foreignKey: 'userId' });
  MatchCard.belongsTo(Match, { foreignKey: 'matchId' });
  User.hasMany(MatchCard, { foreignKey: 'userId' });
  Match.hasMany(MatchCard, { foreignKey: 'matchId' });

  // Match Evaluations
  MatchEvaluation.belongsTo(User, { foreignKey: 'evaluatorId' });
  MatchEvaluation.belongsTo(Match, { foreignKey: 'matchId' });
  User.hasMany(MatchEvaluation, { foreignKey: 'evaluatorId' });
  Match.hasMany(MatchEvaluation, { foreignKey: 'matchId' });

  // Championship
  Championship.belongsTo(User, { foreignKey: 'createdBy' });
  User.hasMany(Championship, { foreignKey: 'createdBy' });
}
