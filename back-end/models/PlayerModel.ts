import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import User from './UserModel';

interface PlayerAttributes {
  id: number;
  name: string;
  gender: string;
  year: string;
  position: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PlayerCreationAttributes extends Omit<PlayerAttributes, 'id'> {}

class Player extends Model<PlayerAttributes, PlayerCreationAttributes> {
  public id!: number;
  public name!: string;
  public gender!: string;
  public year!: string;
  public position!: string;
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value: string) {
        this.setDataValue('name', value.trim().toLowerCase());
      },
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    year: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    position: {
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