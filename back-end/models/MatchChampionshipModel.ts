import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
 

class MatchChampionship extends Model {
  public id!: number;
  public championship_id!: number;
  public date!: Date;
  public location!: string;
  public nomequadra!: string;
  public Rodada!: number; 
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}
MatchChampionship.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: false, // Permitir definir manualmente para vincular com Match
    primaryKey: true,
  },
  championship_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'championships',
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: true
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
  nomequadra: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    }
  },
  Rodada: {
    type: DataTypes.INTEGER,
    allowNull: false, 
  },
  
}, {
  sequelize,
  tableName: 'match_championship',
  timestamps: true,
  underscored: true,
  modelName: 'Match_championship',
  freezeTableName: true,
});

export default MatchChampionship; 