import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from '../config/database';

interface ChampionshipGroupModel extends Model<InferAttributes<ChampionshipGroupModel>, InferCreationAttributes<ChampionshipGroupModel>> {
  id: CreationOptional<number>;
  championship_id: number;
  group_name: string;
  group_order: number;
}

class ChampionshipGroup extends Model<InferAttributes<ChampionshipGroupModel>, InferCreationAttributes<ChampionshipGroupModel>> implements ChampionshipGroupModel {
  public id!: CreationOptional<number>;
  public championship_id!: number;
  public group_name!: string;
  public group_order!: number;
}

ChampionshipGroup.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
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
  group_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 50]
    }
  },
  group_order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
}, {
  sequelize,
  tableName: 'championship_groups',
  modelName: 'ChampionshipGroup',
  underscored: true,
  timestamps: true,
  indexes: [
    {
      fields: ['championship_id']
    },
    {
      fields: ['championship_id', 'group_order']
    }
  ]
});

export default ChampionshipGroup;


