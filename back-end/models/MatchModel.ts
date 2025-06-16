import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

import User from './UserModel';
import MatchPlayer from './MatchTeamsModel';

interface MatchAttributes {
  id: number;
  title: string;
  date: Date;
  location: string;
  description?: string;
  price?: number;
  status: string;
  organizerId: number;
}

class MatchModel extends Model<MatchAttributes> implements MatchAttributes {
  public id!: number;
  public title!: string;
  public date!: Date;
  public location!: string;
  public description!: string;
  public price!: number;
  public status!: string;
  public organizerId!: number;

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

MatchModel.init({
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
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'open',
  },
  organizerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    field: 'organizer_id',
  },
}, {
  sequelize,
  tableName: 'matches',
  timestamps: true,
  underscored: true,
  modelName: 'Match',
  freezeTableName: true,
  hooks: {
    beforeValidate: (match: MatchModel) => {
      // Garantir que strings não sejam apenas espaços em branco
      if (match.title) match.title = match.title.trim();
      if (match.description) match.description = match.description.trim();
      if (match.location) match.location = match.location.trim();
    }
  }
});

export default MatchModel; 