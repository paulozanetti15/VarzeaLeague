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


class PunicaoAmitosoMatch extends Model<PunicaoAttributes> {
  public id!: number;
  public idTime!: number;
  public motivo!: string;
  public idMatch!: number;
}

PunicaoAmitosoMatch.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    idTime: {
      type: DataTypes.INTEGER,
      field: 'id_time', // Especifica o nome real da coluna
      allowNull: false,
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
    modelName: 'punicaoamitosoMatch',
    tableName: 'punicaoamitosoMatch',
    timestamps: true,
    underscored: true,
  }
);

// As associações permanecem iguais
PunicaoAmitosoMatch.belongsTo(Team, {
  foreignKey: "idTime",
  as: "team"
});

PunicaoAmitosoMatch.belongsTo(Match, {
  foreignKey: "idMatch", 
  as: "match"
});

export default PunicaoAmitosoMatch; 