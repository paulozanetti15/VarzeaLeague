import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface TeamChampionshipAttributes {
  id: number;
  teamId: number;
  championshipId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface TeamChampionshipCreationAttributes extends Omit<TeamChampionshipAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class TeamChampionship extends Model<TeamChampionshipAttributes, TeamChampionshipCreationAttributes> {
  public id!: number;
  public teamId!: number;
  public championshipId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

TeamChampionship.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    teamId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'team_id'
    },
    championshipId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'championship_id'
    }
  },
  {
    sequelize,
    tableName: 'team_championships',
    modelName: 'TeamChampionship',
    timestamps: true,
    underscored: true
  }
);

export default TeamChampionship;
