import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Team  from './TeamModel';
import Match from './FriendlyMatchesModel';
interface PunicaoAttributes {
  id: number;
  idTeam: number;
  reason: string;
  idMatch: number;
}


class FriendlyMatchPenalty extends Model<PunicaoAttributes> {
  public id!: number;
  public idTeam!: number;
  public reason!: string;
  public idMatch!: number;
}

FriendlyMatchPenalty.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    idTeam: {
      type: DataTypes.INTEGER,
      field: 'id_time', // Especifica o nome real da coluna
      allowNull: true,
      references: {
        model: 'teams',
        key: 'id'
      },
    },
    idMatch: {
      type: DataTypes.INTEGER,
      field: 'id_match',
      allowNull: false,
      references: {
        model: 'FriendlyMatches',
        key: 'id'
      },
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'FriendlyMatchPenalty',
    tableName: 'FriendlyMatchPenalty',
    timestamps: true,
    underscored: true,
  }
);

export default FriendlyMatchPenalty;