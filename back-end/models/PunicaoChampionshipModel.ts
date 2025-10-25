import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Team from './TeamModel';
import Championship from './ChampionshipModel';

interface PunicaoChampionshipAttributes {
  id: number;
  idTime: number;
  motivo: string;
  idChampionship: number;
}

class PunicaoChampionship extends Model<PunicaoChampionshipAttributes> {
  public id!: number;
  public idTime!: number;
  public motivo!: string;
  public idChampionship!: number;
}

PunicaoChampionship.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    idTime: {
      type: DataTypes.INTEGER,
      field: 'id_time',
      allowNull: false,
      references: { model: 'teams', key: 'id' },
    },
    idChampionship: {
      type: DataTypes.INTEGER,
      field: 'id_championship',
      allowNull: false,
      references: { model: 'championships', key: 'id' },
    },
    motivo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'PunicaoChampionship',
    tableName: 'punicao_championships',
    timestamps: true,
    underscored: true,
  }
);

PunicaoChampionship.belongsTo(Team, { foreignKey: 'idTime', as: 'team' });
PunicaoChampionship.belongsTo(Championship, { foreignKey: 'idChampionship', as: 'championship' });

export default PunicaoChampionship;
