import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from '../config/database';

class MatchReferee extends Model<InferAttributes<MatchReferee, { omit: 'createdAt' | 'updatedAt' }>, InferCreationAttributes<MatchReferee, { omit: 'createdAt' | 'updatedAt' }>> {
  declare id: CreationOptional<number>;
  declare match_id: number;
  declare referee_id: number;
  declare tipo: 'principal' | 'auxiliar';
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

MatchReferee.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    match_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'matches',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    referee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'referees',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    tipo: {
      type: DataTypes.ENUM('principal', 'auxiliar'),
      allowNull: false,
      defaultValue: 'principal',
      validate: {
        isIn: [['principal', 'auxiliar']]
      }
    }
  },
  {
    sequelize,
    tableName: 'match_referees',
    timestamps: true,
    underscored: true,
    modelName: 'MatchReferee',
    freezeTableName: true,
    indexes: [
      {
        unique: true,
        fields: ['match_id', 'referee_id', 'tipo'],
        name: 'unique_match_referee_tipo'
      }
    ]
  }
);

export default MatchReferee;
