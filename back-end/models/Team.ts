import { Model, DataTypes, BelongsToManyAddAssociationMixin, BelongsToManyGetAssociationsMixin, BelongsToManySetAssociationsMixin } from 'sequelize';
import sequelize from '../config/databaseconfig';
import User from './User';

interface TeamAttributes {
  id: number;
  name: string;
  description: string;
  banner: string | null;
  captainId: number;
  createdAt?: Date;
  updatedAt?: Date;
  captain?: User;
  players?: User[];
}

interface TeamCreationAttributes extends Omit<TeamAttributes, 'id'> {}

class Team extends Model<TeamAttributes, TeamCreationAttributes> {
  public id!: number;
  public name!: string;
  public description!: string;
  public banner!: string | null;
  public captainId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

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
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    banner: {
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