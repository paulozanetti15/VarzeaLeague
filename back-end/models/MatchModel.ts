import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

import User from './UserModel';
import MatchPlayer from './MatchPlayersModel';

class Match extends Model {
  public id!: number;
  public title!: string;
  public date!: Date;
  public location!: string;
  public complement!: string;
  public maxPlayers!: number;
  public status!: 'open' | 'pending' | 'confirmed' | 'cancelled' | 'completed';
  public description?: string;
  public price?: number;
  public organizerId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public async addPlayer(userId: number): Promise<void> {
    const user = await User.findByPk(userId);
    if (user) {
      await (this as any).addPlayers(user);
    }
  }

  public async countPlayers(): Promise<number> {
    const players =  await MatchPlayer.count({
      where: { matchId: this.id }
    });
    return players
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
    validate: {
      notEmpty: true,
      len: [3, 100]
    }
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: true,
      isFuture(value: Date) {
        if (value <= new Date()) {
          throw new Error('A data da partida deve ser futura');
        }
      }
    }
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [5, 200]
    }
  },
  status: {
    type: DataTypes.ENUM('open', 'pending', 'confirmed', 'cancelled', 'completed'),
    defaultValue: 'open',
    validate: {
      isIn: [['open', 'pending', 'confirmed', 'cancelled', 'completed']]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 1000]
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  organizerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'User',
      key: 'id',
    },
    field: 'organizer_id',
  }
}, {
  sequelize,
  tableName: 'matches',
  timestamps: true,
  underscored: true,
  modelName: 'Match',
  freezeTableName: true,
  hooks: {
    beforeValidate: (match: Match) => {
      // Garantir que strings não sejam apenas espaços em branco
      if (match.title) match.title = match.title.trim();
      if (match.description) match.description = match.description.trim();
      if (match.location) match.location = match.location.trim();
      if (match.complement) match.complement = match.complement.trim();
    }
  }
});

export default Match; 