import User from './UserModel';
import UserType from './UserTypeModel';
import Match from './MatchModel';
import Team from './TeamModel';
import MatchPlayer from './MatchTeamsModel';
import TeamPlayer from './TeamPlayerModel';
import TeamUser from './TeamUserModel';
import MatchReport from './MatchReportModel';
import MatchGoal from './MatchGoalModel';
import MatchCard from './MatchCardModel';
import MatchEvaluation from './MatchEvaluationModel';
import Championship from './ChampionshipModel';
import Player from './PlayerModel';
import MatchTeams from './MatchTeamsModel';
import MatchChampionship from './MatchChampionshipModel';
import MatchChampionshpReport from './MatchReportChampionshipModel';
import Rules from './RulesModel';
import FriendlyMatchPenalty from './FriendlyMatchPenaltyModel';
import ChampionshipPenalty from './ChampionshipPenaltyModel';


// User <-> Match associations
export function associateModels() {
  // Associação correta entre User e UserType
  User.belongsTo(UserType, { foreignKey: 'userTypeId', as: 'usertype' });
  UserType.hasMany(User, { foreignKey: 'userTypeId', as: 'users' });

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
    through: TeamUser,
    as: 'users',
    foreignKey: 'teamId',
    otherKey: 'userId'
  });

  User.belongsToMany(Team, {
    through: TeamUser,
    as: 'teams',
    foreignKey: 'userId',
    otherKey: 'teamId'
  });

  // Team <-> Player associations
  Team.belongsToMany(Player, {
    through: TeamPlayer,
    as: 'players',
    foreignKey: 'teamId',
    otherKey: 'playerId'
  });

  Player.belongsToMany(Team, {
    through: TeamPlayer,
    as: 'teams',
    foreignKey: 'playerId',
    otherKey: 'teamId'
  });

  Player.hasMany(TeamPlayer, {
    foreignKey: 'playerId',
    as: 'teamPlayers'
  });

  TeamPlayer.belongsTo(Player, {
    foreignKey: 'playerId',
    as: 'player'
  });

  Team.hasMany(TeamPlayer, {
    foreignKey: 'teamId',
    as: 'teamPlayers'
  });

  TeamPlayer.belongsTo(Team, {
    foreignKey: 'teamId',
    as: 'team'
  });

  // Match Reports
  MatchReport.belongsTo(User, { foreignKey: 'createdBy' });
  MatchReport.belongsTo(Match, { foreignKey: 'matchId' });
  User.hasMany(MatchReport, { foreignKey: 'createdBy' });
  Match.hasOne(MatchReport, { foreignKey: 'matchId' });

  // Match Goals
  // Goals (usar alias para permitir include: { as: 'user' })
  MatchGoal.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  MatchGoal.belongsTo(Player, { foreignKey: 'player_id', as: 'player' });
  MatchGoal.belongsTo(Match, { foreignKey: 'match_id', as: 'match' });
  User.hasMany(MatchGoal, { foreignKey: 'user_id', as: 'goals' });
  Player.hasMany(MatchGoal, { foreignKey: 'player_id', as: 'goals' });
  Match.hasMany(MatchGoal, { foreignKey: 'match_id', as: 'goals' });

  // Match Cards
  // Cards
  MatchCard.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  MatchCard.belongsTo(Player, { foreignKey: 'player_id', as: 'player' });
  MatchCard.belongsTo(Match, { foreignKey: 'match_id', as: 'match' });
  User.hasMany(MatchCard, { foreignKey: 'user_id', as: 'cards' });
  Player.hasMany(MatchCard, { foreignKey: 'player_id', as: 'cards' });
  Match.hasMany(MatchCard, { foreignKey: 'match_id', as: 'cards' });

  // Match Evaluations
  MatchEvaluation.belongsTo(User, { foreignKey: 'evaluator_id', as: 'evaluator' });
  MatchEvaluation.belongsTo(Match, { foreignKey: 'match_id', as: 'match' });
  User.hasMany(MatchEvaluation, { foreignKey: 'evaluator_id', as: 'evaluations' });
  Match.hasMany(MatchEvaluation, { foreignKey: 'match_id', as: 'evaluations' });

  // Championship
  Championship.belongsTo(User, { foreignKey: 'createdBy' });
  User.hasMany(Championship, { foreignKey: 'createdBy' });
  
  MatchTeams.belongsTo(Match,{foreignKey:"matchId",as:"match"});
  MatchTeams.belongsTo(Team,{foreignKey:"teamId",as:"team"});
  
  MatchReport.belongsTo(Match,{foreignKey:"match_id",as:"match"});
  MatchReport.belongsTo(Team,{foreignKey:"team_home",as:"teamHome"});
  MatchReport.belongsTo(Team,{foreignKey:"team_away",as:"teamAway"});
  
  MatchChampionship.belongsTo(Championship,{foreignKey:"championship_id",as:"championship"});
  
  MatchChampionshpReport.belongsTo(MatchChampionship,{foreignKey:"match_id",as:"match"});
  MatchChampionshpReport.belongsTo(Team,{foreignKey:"team_home",as:"teamHome"});
  MatchChampionshpReport.belongsTo(Team,{foreignKey:"team_away",as:"teamAway"});

  Match.hasOne(Rules, { foreignKey: 'partidaId', as: 'rules' });
  Rules.belongsTo(Match, { foreignKey: 'partidaId', as: 'match' });

}
