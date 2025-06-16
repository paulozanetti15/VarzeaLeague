import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

interface RulesAttributes {
  id: number;
  partidaId: number;
  idade_minima: number;
  idade_maxima: number;
  sexo: string;
}

class RulesModel extends Model<RulesAttributes> implements RulesAttributes {
  public id!: number;
  public partidaId!: number;
  public idade_minima!: number;
  public idade_maxima!: number;
  public sexo!: string;
}

RulesModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    partidaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    idade_minima: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    idade_maxima: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sexo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Rules',
    tableName: 'rules',
    timestamps: true,
  }
);

export default RulesModel;