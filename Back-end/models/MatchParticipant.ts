import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/databaseconfig';
import User from './User';
import Match from './Match';

interface MatchParticipantAttributes {
  id: number;
  matchId: number;
  userId: number;
  team?: 'A' | 'B';
  status: 'pending' | 'confirmed' | 'rejected';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  position?: string;
}

interface MatchParticipantCreationAttributes extends Optional<MatchParticipantAttributes, 'id'> {}

class MatchParticipant extends Model<MatchParticipantAttributes, MatchParticipantCreationAttributes> implements MatchParticipantAttributes {
  public id!: number;
  public matchId!: number;
  public userId!: number;
  public team!: 'A' | 'B' | undefined;
  public status!: 'pending' | 'confirmed' | 'rejected';
  public paymentStatus!: 'pending' | 'paid' | 'refunded';
  public position!: string | undefined;
}

MatchParticipant.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  matchId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Match,
      key: 'id',
    },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  team: {
    type: DataTypes.ENUM('A', 'B'),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'rejected'),
    defaultValue: 'pending',
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'refunded'),
    defaultValue: 'pending',
  },
  position: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  sequelize,
  tableName: 'match_participants',
  modelName: 'MatchParticipant',
});

// Relacionamentos
MatchParticipant.belongsTo(Match, { foreignKey: 'matchId' });
MatchParticipant.belongsTo(User, { foreignKey: 'userId' });

export default MatchParticipant; 