import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Team from './TeamModel';
import Championship from './ChampionshipModel';


interface ChampionshipPenaltyAttributes {
  id: number;
  teamId: number;
  reason: string;
  championshipId: number;
  matchChampionshipId?: number;
}

class ChampionshipPenalty extends Model<ChampionshipPenaltyAttributes> {
  public id!: number;
  public teamId!: number;
  public reason!: string;
  public championshipId!: number;
  public matchChampionshipId?: number;
}

ChampionshipPenalty.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    teamId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'teams', key: 'id' },
    },
    championshipId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'championships', key: 'id' },
    },
    matchChampionshipId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'match_championship', key: 'id' },
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'ChampionshipPenalty',
    tableName: 'ChampionshipPenalty',
    timestamps: true,
    underscored: true,
  }
);

export default ChampionshipPenalty;
