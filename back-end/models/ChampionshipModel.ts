import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from '../config/database';
interface ChampionshipModel extends Model<InferAttributes<ChampionshipModel>, InferCreationAttributes<ChampionshipModel>> {
  id: CreationOptional<number>;
  name: string;
  description?: string | null;
  start_date: Date;
  end_date: Date;
  created_by: number;
  modalidade: string;
  nomequadra: string;
}

class Championship extends Model<InferAttributes<ChampionshipModel>, InferCreationAttributes<ChampionshipModel>> implements ChampionshipModel {
  public id!: CreationOptional<number>;
  public name!: string;
  public description!: string | null;
  public start_date!: Date;
  public end_date!: Date;
  public created_by!: number;
  public modalidade!: string;
  public nomequadra!: string;
}

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
  modalidade: {
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
}, {
  sequelize,
  tableName: 'championships',
  modelName: 'Championship',
  underscored: true,
  timestamps: true,
});

export default Championship;
