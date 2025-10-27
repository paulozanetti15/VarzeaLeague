import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from '../config/database';

class Referee extends Model<InferAttributes<Referee, { omit: 'createdAt' | 'updatedAt' }>, InferCreationAttributes<Referee, { omit: 'createdAt' | 'updatedAt' }>> {
  declare id: CreationOptional<number>;
  declare nome: string;
  declare cpf: string;
  declare telefone?: string;
  declare email?: string;
  declare certificacao?: string;
  declare ativo: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Referee.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [3, 100]
      }
    },
    cpf: {
      type: DataTypes.STRING(14),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        is: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/
      }
    },
    telefone: {
      type: DataTypes.STRING(15),
      allowNull: true,
      validate: {
        is: /^\(\d{2}\) \d{4,5}-\d{4}$/
      }
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    certificacao: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Nível de certificação: Estadual, Nacional, FIFA, etc.'
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: 'referees',
    timestamps: true,
    underscored: true,
    modelName: 'Referee',
    freezeTableName: true,
    hooks: {
      beforeValidate: (referee: Referee) => {
        if (referee.nome) referee.nome = referee.nome.trim();
        if (referee.email) referee.email = referee.email.trim().toLowerCase();
      }
    }
  }
);

export default Referee;
