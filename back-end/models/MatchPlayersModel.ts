import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

interface MatchPlayersAttributes {
  id: number;
  matchId: number;
  playerId: number;
  teamId: number;
}

class MatchPlayersModel extends Model<MatchPlayersAttributes> implements MatchPlayersAttributes {
  public id!: number;
  public matchId!: number;
  public playerId!: number;
  public teamId!: number;
}

MatchPlayersModel.init(
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
    playerId: {
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
    modelName: 'MatchPlayers',
    tableName: 'match_players',
    timestamps: true,
  }
);

export default MatchPlayersModel; 