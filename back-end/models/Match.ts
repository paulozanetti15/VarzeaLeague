import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/databaseconfig';
import User from './User';

class Match extends Model {
  public id!: number;
  public title!: string;
  public date!: Date;
  public location!: string;
  public maxPlayers!: number;
  public status!: 'open' | 'pending' | 'confirmed' | 'cancelled' | 'completed';
  public description?: string;
  public price?: number;
  public organizerId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate(models: any) {
    Match.belongsTo(models.User, { as: 'organizer', foreignKey: 'organizerId' });
    Match.belongsToMany(models.User, { 
      as: 'players',
      through: 'match_players',
      foreignKey: 'matchId',
      otherKey: 'userId'
    });
  }

  public async addPlayer(userId: number): Promise<void> {
    const user = await User.findByPk(userId);
    if (user) {
      await (this as any).addPlayer(user);
    }
  }

  public async countPlayers(): Promise<number> {
    const players = await (this as any).getPlayers();
    return players.length;
  }
}

Match.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  maxPlayers: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10,
  },
  status: {
    type: DataTypes.ENUM('open', 'pending', 'confirmed', 'cancelled', 'completed'),
    defaultValue: 'open',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  organizerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  }
}, {
  sequelize,
  tableName: 'matches',
  timestamps: true,
  underscored: true,
  modelName: 'Match',
  freezeTableName: true
});

export default Match; 