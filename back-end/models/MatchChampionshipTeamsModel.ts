import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class MatchChampionshipTeams extends Model {
  public id!: number;
  public matchChampionshipId!: number;
  public teamId!: number;
}

MatchChampionshipTeams.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    matchChampionshipId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'match_championship_id',
      references: { model: 'match_championship', key: 'id' },
    },
    teamId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'team_id',
      references: { model: 'teams', key: 'id' },
    },
  },
  {
    sequelize,
    modelName: 'MatchChampionshipTeams',
    tableName: 'match_championship_teams',
    timestamps: false,
    underscored: true,
  }
);

export default MatchChampionshipTeams;
