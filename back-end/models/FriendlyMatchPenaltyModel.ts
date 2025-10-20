import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Team  from './TeamModel';
import Match from './MatchModel';
interface PunicaoAttributes {
  id: number;
  idTime: number;
  motivo: string;
  idMatch: number;
}


class FriendlyMatchPenalty extends Model<PunicaoAttributes> {
  public id!: number;
  public idTime!: number;
  public motivo!: string;
  public idMatch!: number;
}

FriendlyMatchPenalty.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    idTime: {
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
      field: 'id_match', // Especifica o nome real da coluna
      allowNull: false,
      references: {
        model: 'matches',
        key: 'id'
      },
    },
    motivo: {
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

// Associações corrigidas para snake_case
FriendlyMatchPenalty.belongsTo(Team, {
  foreignKey: "id_time",
  as: "team"
});

FriendlyMatchPenalty.belongsTo(Match, {
  foreignKey: "id_match", 
  as: "match"
});

export default FriendlyMatchPenalty;