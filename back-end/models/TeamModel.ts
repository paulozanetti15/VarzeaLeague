import { Model, DataTypes, BelongsToManyAddAssociationMixin, BelongsToManyGetAssociationsMixin, BelongsToManySetAssociationsMixin } from 'sequelize';
import sequelize from '../config/database';

import User from './UserModel';

interface TeamAttributes {
  id: number;
  name: string;
  description: string;
  banner: string | null;
  captainId: number;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  idademinima?: number;
  idademaxima?: number;
  maxparticipantes?: number;
  primaryColor?: string;
  secondaryColor?: string;
  sexo?: string;
  captain?: User;
  players?: User[];
  estado?: string;
  cidade?: string;
  jogadores?: any[];
}

interface TeamCreationAttributes extends Omit<TeamAttributes, 'id'> {
  isDeleted: boolean;
}

class Team extends Model<TeamAttributes, TeamCreationAttributes> {
  public id!: number;
  public name!: string;
  public description!: string;
  public banner!: string | null;
  public idademinima!: number | null;
  public idademaxima!: number | null;
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
  public jogadores!: any[] | null;

  // Métodos de associação
  public addPlayer!: BelongsToManyAddAssociationMixin<User, number>;
  public getPlayers!: BelongsToManyGetAssociationsMixin<User>;
  public setPlayers!: BelongsToManySetAssociationsMixin<User, number>;
  public countPlayers!: () => Promise<number>;

  // Associações
  public captain!: User;
  public players!: User[];
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
    idademinima: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    idademaxima: {
      type: DataTypes.INTEGER,
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
    estado: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cidade: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jogadores: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Team',
    tableName: 'teams',
    timestamps: true,
    underscored: true,
  }
);

// Método para adicionar um jogador ao time
Team.prototype.addPlayer = async function(userId: number): Promise<void> {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error('Usuário não encontrado');
  }
  await (this as any).addPlayer(user);
};

// Método para contar o número de jogadores no time
Team.prototype.countPlayers = async function(): Promise<number> {
  const players = await (this as any).getPlayers();
  return players.length;
};

export default Team; 