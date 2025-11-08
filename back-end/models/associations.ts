import User from './UserModel';
import UserType from './UserTypeModel';
import FriendlyMatchesModel from './FriendlyMatchesModel';
import Team from './TeamModel';
import TeamPlayer from './TeamPlayerModel';
import TeamUser from './TeamUserModel';
import FriendlyMatchReport from './FriendlyMatchReportModel';
import FriendlyMatchGoal from './FriendlyMatchGoalModel';
import FriendlyMatchCard from './FriendlyMatchCardModel';
import FriendlyMatchEvaluation from './FriendlyMatchEvaluationModel';
import Championship from './ChampionshipModel';
import ChampionshipApplication from './ChampionshipApplicationModel';
import ChampionshipGroup from './ChampionshipGroupModel';
import Player from './PlayerModel';
import FriendlyMatchTeamsModel from './FriendlyMatchTeamsModel';
import MatchChampionship from './MatchChampionshipModel';
import MatchChampionshipReport from './MatchReportChampionshipModel';
import FriendlyMatchesRulesModel from './FriendlyMatchesRulesModel';
import FriendlyMatchPenalty from './FriendlyMatchPenaltyModel';
import ChampionshipPenalty from './ChampionshipPenaltyModel';
import TeamChampionship from './TeamChampionshipModel';
import ChampionshipMatchGoal from './ChampionshipMatchGoalModel';
import ChampionshipMatchCard from './ChampionshipMatchCardModel';


export function associateModels() {
  User.belongsTo(UserType, { foreignKey: 'userTypeId', as: 'usertype' });
  UserType.hasMany(User, { foreignKey: 'userTypeId', as: 'users' });

  User.hasMany(FriendlyMatchesModel, {
    foreignKey: 'organizerId',
    as: 'organizedMatches'
  });

  FriendlyMatchesModel.belongsTo(User, {
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

  FriendlyMatchReport.belongsTo(User, { 
    foreignKey: 'created_by', 
    as: 'creator' 
  });
  
  FriendlyMatchReport.belongsTo(FriendlyMatchesModel, { 
    foreignKey: 'match_id', 
    as: 'friendlyMatch' 
  });
  
  User.hasMany(FriendlyMatchReport, { 
    foreignKey: 'created_by', 
    as: 'friendlyMatchReports' 
  });
  
  FriendlyMatchesModel.hasOne(FriendlyMatchReport, { 
    foreignKey: 'match_id', 
    as: 'report' 
  });

  FriendlyMatchGoal.belongsTo(User, { 
    foreignKey: 'user_id', 
    as: 'user' 
  });
  
  FriendlyMatchGoal.belongsTo(Player, { 
    foreignKey: 'player_id', 
    as: 'player' 
  });
  
  FriendlyMatchGoal.belongsTo(FriendlyMatchesModel, { 
    foreignKey: 'match_id', 
    as: 'friendlyMatch' 
  });
  
  User.hasMany(FriendlyMatchGoal, { 
    foreignKey: 'user_id', 
    as: 'goals' 
  });
  
  Player.hasMany(FriendlyMatchGoal, { 
    foreignKey: 'player_id', 
    as: 'goals' 
  });
  
  FriendlyMatchesModel.hasMany(FriendlyMatchGoal, { 
    foreignKey: 'match_id', 
    as: 'goals' 
  });

  FriendlyMatchCard.belongsTo(User, { 
    foreignKey: 'user_id', 
    as: 'user' 
  });
  
  FriendlyMatchCard.belongsTo(Player, { 
    foreignKey: 'player_id', 
    as: 'player' 
  });
  
  FriendlyMatchCard.belongsTo(FriendlyMatchesModel, { 
    foreignKey: 'match_id', 
    as: 'friendlyMatch' 
  });
  
  User.hasMany(FriendlyMatchCard, { 
    foreignKey: 'user_id', 
    as: 'cards' 
  });
  
  Player.hasMany(FriendlyMatchCard, { 
    foreignKey: 'player_id', 
    as: 'cards' 
  });
  
  FriendlyMatchesModel.hasMany(FriendlyMatchCard, { 
    foreignKey: 'match_id', 
    as: 'cards' 
  });

  FriendlyMatchEvaluation.belongsTo(User, { 
    foreignKey: 'evaluator_id', 
    as: 'evaluator' 
  });
  
  FriendlyMatchEvaluation.belongsTo(FriendlyMatchesModel, { 
    foreignKey: 'match_id', 
    as: 'friendlyMatch' 
  });
  
  User.hasMany(FriendlyMatchEvaluation, { 
    foreignKey: 'evaluator_id', 
    as: 'evaluations' 
  });
  
  FriendlyMatchesModel.hasMany(FriendlyMatchEvaluation, { 
    foreignKey: 'match_id', 
    as: 'evaluations' 
  });

  Championship.belongsTo(User, { 
    foreignKey: 'created_by', 
    as: 'creator' 
  });
  
  User.hasMany(Championship, { 
    foreignKey: 'created_by', 
    as: 'createdChampionships' 
  });

  ChampionshipApplication.belongsTo(Team, { 
    foreignKey: 'team_id', 
    as: 'applicationTeam'
  });
  
  ChampionshipApplication.belongsTo(Championship, { 
    foreignKey: 'championship_id', 
    as: 'applicationChampionship' 
  });
  
  Team.hasMany(ChampionshipApplication, { 
    foreignKey: 'team_id', 
    as: 'championshipApplications' 
  });
  
  Championship.hasMany(ChampionshipApplication, { 
    foreignKey: 'championship_id', 
    as: 'applications' 
  });

  ChampionshipGroup.belongsTo(Championship, { 
    foreignKey: 'championship_id', 
    as: 'groupChampionship' 
  });
  Championship.hasMany(ChampionshipGroup, { 
    foreignKey: 'championship_id', 
    as: 'groups' 
  });
  
  FriendlyMatchTeamsModel.belongsTo(FriendlyMatchesModel, {
    foreignKey: 'matchId',
    as: 'friendlyMatch'
  });
  
  FriendlyMatchTeamsModel.belongsTo(Team, {
    foreignKey: 'teamId',
    as: 'matchTeam'
  });

  FriendlyMatchesModel.hasMany(FriendlyMatchTeamsModel, {
    foreignKey: 'matchId',
    as: 'matchTeams'
  });
  
  Team.hasMany(FriendlyMatchTeamsModel, {
    foreignKey: 'teamId',
    as: 'friendlyMatchTeams'
  });
  
  FriendlyMatchReport.belongsTo(FriendlyMatchesModel, {
    foreignKey: 'match_id',
    as: 'reportFriendlyMatch'
  });
  
  FriendlyMatchReport.belongsTo(Team, {
    foreignKey: 'team_home',
    as: 'teamHome'
  });
  
  FriendlyMatchReport.belongsTo(Team, {
    foreignKey: 'team_away',
    as: 'teamAway'
  });
  
  MatchChampionship.belongsTo(Championship, {
    foreignKey: 'championship_id',
    as: 'matchChampionship'
  });

  Championship.hasMany(MatchChampionship, {
    foreignKey: 'championship_id',
    as: 'matches'
  });
  
  MatchChampionshipReport.belongsTo(MatchChampionship, {
    foreignKey: 'match_id',
    as: 'championshipMatch'
  });
  
  MatchChampionshipReport.belongsTo(Team, {
    foreignKey: 'team_home',
    as: 'reportTeamHome'
  });
  
  MatchChampionshipReport.belongsTo(Team, {
    foreignKey: 'team_away',
    as: 'reportTeamAway'
  });

  MatchChampionship.hasOne(MatchChampionshipReport, {
    foreignKey: 'match_id',
    as: 'report'
  });

  FriendlyMatchesModel.hasOne(FriendlyMatchesRulesModel, { 
    foreignKey: 'matchId', 
    as: 'rules' 
  });
  
  FriendlyMatchesRulesModel.belongsTo(FriendlyMatchesModel, { 
    foreignKey: 'matchId', 
    as: 'friendlyMatch' 
  });

  FriendlyMatchPenalty.belongsTo(Team, {
    foreignKey: 'idTeam',
    as: 'penaltyTeam'
  });
  
  FriendlyMatchPenalty.belongsTo(FriendlyMatchesModel, {
    foreignKey: 'idMatch',
    as: 'friendlyMatch'
  });
  
  Team.hasMany(FriendlyMatchPenalty, {
    foreignKey: 'idTeam',
    as: 'friendlyMatchPenalties'
  });
  
  FriendlyMatchesModel.hasMany(FriendlyMatchPenalty, {
    foreignKey: 'idMatch',
    as: 'penalties'
  });

  ChampionshipPenalty.belongsTo(Team, {
    foreignKey: 'teamId',
    as: 'championshipPenaltyTeam'
  });
  
  ChampionshipPenalty.belongsTo(Championship, {
    foreignKey: 'championshipId',
    as: 'penaltyChampionship'
  });
  
  Team.hasMany(ChampionshipPenalty, {
    foreignKey: 'teamId',
    as: 'championshipPenalties'
  });
  
  Championship.hasMany(ChampionshipPenalty, {
    foreignKey: 'championshipId',
    as: 'championshipPenaltiesRecords'
  });

  Team.hasMany(TeamChampionship, {
    foreignKey: 'teamId',
    as: 'teamChampionships'
  });

  TeamChampionship.belongsTo(Team, {
    foreignKey: 'teamId',
    as: 'championshipTeam'
  });

  TeamChampionship.belongsTo(Championship, {
    foreignKey: 'championshipId',
    as: 'teamChampionship'
  });

  Championship.hasMany(TeamChampionship, {
    foreignKey: 'championshipId',
    as: 'teamChampionships'
  });

  ChampionshipMatchGoal.belongsTo(User, { 
    foreignKey: 'user_id', 
    as: 'user' 
  });
  
  ChampionshipMatchGoal.belongsTo(Player, { 
    foreignKey: 'player_id', 
    as: 'player' 
  });
  
  ChampionshipMatchGoal.belongsTo(MatchChampionship, { 
    foreignKey: 'match_id', 
    as: 'championshipMatch' 
  });
  
  User.hasMany(ChampionshipMatchGoal, { 
    foreignKey: 'user_id', 
    as: 'championshipGoals' 
  });
  
  Player.hasMany(ChampionshipMatchGoal, { 
    foreignKey: 'player_id', 
    as: 'championshipGoals' 
  });
  
  MatchChampionship.hasMany(ChampionshipMatchGoal, { 
    foreignKey: 'match_id', 
    as: 'goals' 
  });

  ChampionshipMatchCard.belongsTo(User, { 
    foreignKey: 'user_id', 
    as: 'user' 
  });
  
  ChampionshipMatchCard.belongsTo(Player, { 
    foreignKey: 'player_id', 
    as: 'player' 
  });
  
  ChampionshipMatchCard.belongsTo(MatchChampionship, { 
    foreignKey: 'match_id', 
    as: 'championshipMatch' 
  });
  
  User.hasMany(ChampionshipMatchCard, { 
    foreignKey: 'user_id', 
    as: 'championshipCards' 
  });
  
  Player.hasMany(ChampionshipMatchCard, { 
    foreignKey: 'player_id', 
    as: 'championshipCards' 
  });
  
  MatchChampionship.hasMany(ChampionshipMatchCard, { 
    foreignKey: 'match_id', 
    as: 'cards' 
  });
}
