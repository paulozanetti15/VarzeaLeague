import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

import User from './UserModel';
import MatchPlayer from './FriendlyMatchTeamsModel';

class Match extends Model {
  public id!: number;
  public title!: string;
  public date!: Date;
  public duration?: string;
  public location!: string;
  public number!: string;
  public complement!: string;
  public status!: 'aberta' | 'sem_vagas' | 'em_andamento' | 'confirmada' | 'cancelada' | 'finalizada';
  public description?: string;
  public price?: number;
  public organizerId!: number;
  public Uf!: string;
  public Cep!: string;
  public square!: string;
  public matchType!: string;
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
  },
  duration: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [5, 200]
    }
  },
  number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
   matchType: {
   type: DataTypes.STRING,
   allowNull: false,
  },
  square: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  Cep: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  Uf : {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('aberta', 'sem_vagas', 'em_andamento', 'confirmada', 'cancelada', 'finalizada'),
    defaultValue: 'aberta',
    validate: {
      isIn: [['aberta', 'sem_vagas', 'em_andamento', 'confirmada', 'cancelada', 'finalizada']]
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
      model: 'users',
      key: 'id',
    },
    field: 'organizer_id',
  },
  
}, {
  sequelize,
  tableName: 'FriendlyMatches',
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