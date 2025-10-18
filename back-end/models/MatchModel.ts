import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

import User from './UserModel';
import MatchPlayer from './MatchTeamsModel';

class Match extends Model {
  public id!: number;
  public title!: string;
  public date!: Date;
  public duration?: string;
  public location!: string;
  public number!: string;
  public complement!: string;
  public status!: 'aberta' | 'pendente' | 'confirmada' | 'cancelada' | 'finalizada';
  public description?: string;
  public price?: number;
  public organizerId!: number;
  public Uf!: string;
  public Cep!: string;
  public quadra!: string;
  public modalidade!: string;
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
  duration: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      is: /^([0-9]{1,2}):([0-5][0-9])$/,
      customValidator(value: string) {
        if (value) {
          const [hours, minutes] = value.split(':').map(Number);
          if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
            throw new Error('Duração inválida. Use o formato HH:MM');
          }
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
  number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  modalidade : {
   type: DataTypes.STRING,
   allowNull: false,
   validate: {
     notEmpty: true,
   }
  },
  nomequadra: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    }
  },
  Cep: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    }
  },
  Uf : {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 2]
    }
  },
  status: {
    type: DataTypes.ENUM('aberta', 'pendente', 'confirmada', 'cancelada', 'finalizada'),
    defaultValue: 'aberta',
    validate: {
      isIn: [['aberta', 'pendente', 'confirmada', 'cancelada', 'finalizada']]
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