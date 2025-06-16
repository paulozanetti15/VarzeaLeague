import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import TeamModel from './TeamModel';

interface MatchTeamsAttributes {
  id: number;
  matchId: number;
  teamId: number;
}

class MatchTeamsModel extends Model<MatchTeamsAttributes> implements MatchTeamsAttributes {
  public id!: number;
  public matchId!: number;
  public teamId!: number;

  // Example method to get a descriptive string for the match player
  public getDescription(): string {
    return `MatchPlayer: Match ID = ${this.matchId}, Team ID = ${this.teamId}`;
  }

  // Example static method to find all players for a specific match
  public static async findByMatchId(matchId: number): Promise<MatchTeamsModel[]> {
    return await MatchTeamsModel.findAll({ where: { matchId } });
  }
}

MatchTeamsModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    matchId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    teamId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'MatchTeams',
    tableName: 'match_teams',
    timestamps: true,
  }
);

// Definindo a associação com o modelo Team
MatchTeamsModel.belongsTo(TeamModel, {
  foreignKey: 'teamId',
  as: 'Team'
});

export default MatchTeamsModel; 