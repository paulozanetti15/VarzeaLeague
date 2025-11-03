import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class PlayerSuspension extends Model {
  public id!: number;
  public player_id!: number;
  public championship_id!: number | null;
  public reason!: 'yellow_cards' | 'red_card' | 'manual';
  public yellow_cards_accumulated!: number;
  public games_to_suspend!: number;
  public games_suspended!: number;
  public is_active!: boolean;
  public start_date!: Date;
  public end_date!: Date | null;
  public notes!: string | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

PlayerSuspension.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  player_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  championship_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  reason: {
    type: DataTypes.ENUM('yellow_cards', 'red_card', 'manual'),
    allowNull: false,
  },
  yellow_cards_accumulated: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  games_to_suspend: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  games_suspended: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  sequelize,
  tableName: 'player_suspensions',
  modelName: 'PlayerSuspension',
  underscored: true,
  timestamps: true,
});

export default PlayerSuspension;
