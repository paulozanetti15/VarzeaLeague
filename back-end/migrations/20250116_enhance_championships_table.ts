import { QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.addColumn('championships', 'tipo', {
    type: DataTypes.ENUM('liga', 'mata-mata'),
    allowNull: false,
    defaultValue: 'liga'
  });

  await queryInterface.addColumn('championships', 'fase_grupos', {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  });

  await queryInterface.addColumn('championships', 'max_teams', {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 8,
    validate: {
      min: 4,
      max: 32
    }
  });

  await queryInterface.addColumn('championships', 'genero', {
    type: DataTypes.ENUM('masculino', 'feminino', 'misto'),
    allowNull: false,
    defaultValue: 'masculino'
  });

  await queryInterface.addColumn('championships', 'status', {
    type: DataTypes.ENUM('draft', 'open', 'closed', 'in_progress', 'finished'),
    allowNull: false,
    defaultValue: 'draft'
  });

  // Configurações para fase de grupos (apenas para mata-mata com fase de grupos)
  await queryInterface.addColumn('championships', 'num_grupos', {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 2,
      max: 8
    }
  });

  await queryInterface.addColumn('championships', 'times_por_grupo', {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 3,
      max: 6
    }
  });

  // Para liga, especificar quantas equipes
  await queryInterface.addColumn('championships', 'num_equipes_liga', {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 4,
      max: 20
    }
  });
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.removeColumn('championships', 'tipo');
  await queryInterface.removeColumn('championships', 'fase_grupos');
  await queryInterface.removeColumn('championships', 'max_teams');
  await queryInterface.removeColumn('championships', 'genero');
  await queryInterface.removeColumn('championships', 'status');
  await queryInterface.removeColumn('championships', 'num_grupos');
  await queryInterface.removeColumn('championships', 'times_por_grupo');
  await queryInterface.removeColumn('championships', 'num_equipes_liga');
};


