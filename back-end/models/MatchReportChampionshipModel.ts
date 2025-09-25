import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Team from './TeamModel';

class MatchChampionshpReport extends Model {}

MatchChampionshpReport.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  match_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'match_id',
    references: {
      model: 'Match_championship',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
   team_home: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Team, // aqui também
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  team_away: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Team, // idem
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  teamHome_score: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  teamAway_score: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'match_reports_championship',
  modelName: 'MatchChampionshpReport',
  underscored: true,
  timestamps: true,
});

export default MatchChampionshpReport;
