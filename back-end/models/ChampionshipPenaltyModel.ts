import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Team from './TeamModel';
import Championship from './ChampionshipModel';

interface ChampionshipPenaltyAttributes {
  id: number;
  idTime: number;
  motivo: string;
  idChampionship: number;
  idMatchChampionship?: number;
}

class ChampionshipPenalty extends Model<ChampionshipPenaltyAttributes> {
  public id!: number;
  public idTime!: number;
  public motivo!: string;
  public idChampionship!: number;
  public idMatchChampionship?: number;
}

ChampionshipPenalty.init(
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
    idMatchChampionship: {
      type: DataTypes.INTEGER,
      field: 'id_match_championship',
      allowNull: true,
      references: { model: 'match_championship', key: 'id' },
    },
    motivo: {
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

ChampionshipPenalty.belongsTo(Team, { foreignKey: 'idTime', as: 'team' });
ChampionshipPenalty.belongsTo(Championship, { foreignKey: 'idChampionship', as: 'championship' });

export default ChampionshipPenalty;
