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
  tipo: 'liga' | 'mata-mata';
  fase_grupos: boolean;
  max_teams: number;
  genero: 'masculino' | 'feminino' | 'misto';
  status: 'draft' | 'open' | 'closed' | 'in_progress' | 'finished';
  num_grupos?: number | null;
  times_por_grupo?: number | null;
  num_equipes_liga?: number | null;
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
  public tipo!: 'liga' | 'mata-mata';
  public fase_grupos!: boolean;
  public max_teams!: number;
  public genero!: 'masculino' | 'feminino' | 'misto';
  public status!: 'draft' | 'open' | 'closed' | 'in_progress' | 'finished';
  public num_grupos!: number | null;
  public times_por_grupo!: number | null;
  public num_equipes_liga!: number | null;
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
  tipo: {
    type: DataTypes.ENUM('liga', 'mata-mata'),
    allowNull: false,
    defaultValue: 'liga'
  },
  fase_grupos: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  max_teams: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 8,
    validate: {
      min: 4,
      max: 32
    }
  },
  genero: {
    type: DataTypes.ENUM('masculino', 'feminino', 'misto'),
    allowNull: false,
    defaultValue: 'masculino'
  },
  status: {
    type: DataTypes.ENUM('draft', 'open', 'closed', 'in_progress', 'finished'),
    allowNull: false,
    defaultValue: 'draft'
  },
  num_grupos: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 2,
      max: 8
    }
  },
  times_por_grupo: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 3,
      max: 6
    }
  },
  num_equipes_liga: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 4,
      max: 20
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
