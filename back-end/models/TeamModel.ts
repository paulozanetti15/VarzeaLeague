import { Model, DataTypes, BelongsToManyAddAssociationMixin, BelongsToManyGetAssociationsMixin, BelongsToManySetAssociationsMixin } from 'sequelize';
import sequelize from '../config/database';

import User from './UserModel';
import Player from './PlayerModel';

interface TeamAttributes {
  id: number;
  name: string;
  description: string;
  banner: string | null;
  captainId: number;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  maxparticipantes?: number;
  primaryColor?: string;
  secondaryColor?: string;
  sexo?: string;
  captain?: User;
  players?: Player[];
  users?: User[];
  estado?: string;
  cidade?: string;
  cep?: string;
}

interface TeamCreationAttributes extends Omit<TeamAttributes, 'id'> {
  isDeleted: boolean;
}

class Team extends Model<TeamAttributes, TeamCreationAttributes> {
  public id!: number;
  public name!: string;
  public description!: string;
  public banner!: string | null;
  public maxparticipantes!: number | null;
  public sexo!: string | null;
  public primaryColor!: string | null;
  public secondaryColor!: string | null;
  public captainId!: number;
  public isDeleted!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public estado!: string | null;
  public cidade!: string | null;
  public cep!: string | null;

  // Métodos de associação
  public addPlayer!: BelongsToManyAddAssociationMixin<Player, number>;
  public getPlayers!: BelongsToManyGetAssociationsMixin<Player>;
  public setPlayers!: BelongsToManySetAssociationsMixin<Player, number>;
  public countPlayers!: () => Promise<number>;

  public addUser!: BelongsToManyAddAssociationMixin<User, number>;
  public getUsers!: BelongsToManyGetAssociationsMixin<User>;
  public setUsers!: BelongsToManySetAssociationsMixin<User, number>;

  // Associações
  public captain!: User;
  public players!: Player[];
  public users!: User[];
}

Team.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    maxparticipantes: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    sexo: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    banner: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    primaryColor: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    secondaryColor: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    captainId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
      unique: false
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    cep:{
      type: DataTypes.STRING,
      allowNull: false,
    },
    estado: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cidade: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  },
  {
    sequelize,
    modelName: 'Team',
    tableName: 'teams',
    timestamps: true,
    underscored: true,
  }
);


export default Team; 