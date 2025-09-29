import { QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.createTable('championship_groups', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
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
      allowNull: false
    },
    group_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  });

  // Índices para performance
  await queryInterface.addIndex('championship_groups', ['championship_id']);
  await queryInterface.addIndex('championship_groups', ['championship_id', 'group_order']);
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.dropTable('championship_groups');
};


