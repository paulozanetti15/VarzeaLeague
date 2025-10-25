import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from '../config/database';

interface ChampionshipApplicationModel extends Model<InferAttributes<ChampionshipApplicationModel>, InferCreationAttributes<ChampionshipApplicationModel>> {
  id: CreationOptional<number>;
  team_id: number;
  championship_id: number;
  status: 'pending' | 'approved' | 'rejected';
  applied_at: Date;
  approved_at: Date | null;
  rejected_at: Date | null;
  rejection_reason: string | null;
}

class ChampionshipApplication extends Model<InferAttributes<ChampionshipApplicationModel>, InferCreationAttributes<ChampionshipApplicationModel>> implements ChampionshipApplicationModel {
  public id!: CreationOptional<number>;
  public team_id!: number;
  public championship_id!: number;
  public status!: 'pending' | 'approved' | 'rejected';
  public applied_at!: Date;
  public approved_at!: Date | null;
  public rejected_at!: Date | null;
  public rejection_reason!: string | null;
}

ChampionshipApplication.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  team_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'teams',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  championship_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'championships',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    allowNull: false,
    defaultValue: 'pending'
  },
  applied_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  approved_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  rejected_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  rejection_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
}, {
  sequelize,
  tableName: 'championship_applications',
  modelName: 'ChampionshipApplication',
  underscored: true,
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['team_id', 'championship_id'],
      name: 'unique_team_championship_application'
    },
    {
      fields: ['championship_id', 'status']
    },
    {
      fields: ['team_id']
    }
  ]
});

export default ChampionshipApplication;

