import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import User from './UserModel';

interface PlayerAttributes {
  id: number;
  name: string;
  gender: string;
  dateOfBirth: string;
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
  public dateOfBirth!: string;
  public position!: string;
  public isDeleted!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  
  public getAge(): number {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
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
    dateOfBirth: {
      type: DataTypes.DATEONLY,
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