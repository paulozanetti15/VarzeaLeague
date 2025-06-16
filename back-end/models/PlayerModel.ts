import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

interface PlayerAttributes {
  id: number;
  nome: string;
  ano: number;
  sexo: string;
  posicao: string;
  teamId: number;
}

class PlayerModel extends Model<PlayerAttributes> implements PlayerAttributes {
  public id!: number;
  public nome!: string;
  public ano!: number;
  public sexo!: string;
  public posicao!: string;
  public teamId!: number;
}

PlayerModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ano: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1925,
        max: 2019
      }
    },
    sexo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    posicao: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    teamId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Player',
    tableName: 'players',
    timestamps: true,
  }
);

export default PlayerModel; 