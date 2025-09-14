import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Championship extends Model {}

Championship.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      notNull: { msg: 'Data de início é obrigatória' },
      isDate: true,
    }
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      notNull: { msg: 'Data de término é obrigatória' },
      isDate: true,
      isAfterStart(value: any) {
        // "this" é a instância do modelo
        if (this.start_date && value && new Date(value) <= new Date(this.start_date)) {
          throw new Error('Data de término deve ser após a data de início');
        }
      }
    }
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'championships',
  modelName: 'Championship',
  underscored: true,
  timestamps: true,
});

export default Championship;
