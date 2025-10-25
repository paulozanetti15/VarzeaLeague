import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import User from './UserModel';

interface PlayerAttributes {
  id: number;
  nome: string;
  sexo: string;
  ano: string;
  posicao: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PlayerCreationAttributes extends Omit<PlayerAttributes, 'id'> {}

class Player extends Model<PlayerAttributes, PlayerCreationAttributes> {
  public id!: number;
  public nome!: string;
  public sexo!: string;
  public ano!: string;
  public posicao!: string;
  public isDeleted!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Player.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value: string) {
        this.setDataValue('nome', value.trim().toLowerCase());
      },
    },
    sexo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ano: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    posicao: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
  },
  {
    sequelize,
    modelName: 'Player',
    tableName: 'players',
    timestamps: true,
    underscored: true,
  }
);

export default Player; 