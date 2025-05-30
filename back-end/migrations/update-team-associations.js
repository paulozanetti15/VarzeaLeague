'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Verifica se a tabela team_users existe
    try {
      await queryInterface.describeTable('team_users');
      console.log('Tabela team_users já existe.');
    } catch (error) {
      // Se a tabela não existir, cria
      console.log('Criando tabela team_users...');
      await queryInterface.createTable('team_users', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        team_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'teams',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      });

      // Adicionar índice composto
      await queryInterface.addIndex('team_users', ['team_id', 'user_id']);
    }

    // Busca todos os times ativos
    const teams = await queryInterface.sequelize.query(
      'SELECT id, captain_id FROM teams WHERE is_deleted = false',
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Para cada time, garante que o capitão esteja na tabela team_users
    for (const team of teams) {
      // Verifica se já existe o registro
      const exists = await queryInterface.sequelize.query(
        'SELECT * FROM team_users WHERE team_id = ? AND user_id = ?',
        { 
          replacements: [team.id, team.captain_id],
          type: Sequelize.QueryTypes.SELECT 
        }
      );

      if (exists.length === 0) {
        // Insere a associação
        await queryInterface.sequelize.query(
          'INSERT INTO team_users (team_id, user_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
          { 
            replacements: [team.id, team.captain_id],
            type: Sequelize.QueryTypes.INSERT 
          }
        );
        console.log(`Associação criada: Time ID ${team.id} - Usuário ID ${team.captain_id}`);
      }
    }
  },

  async down (queryInterface, Sequelize) {
    // Não precisamos remover a tabela, pois isso é feito em create-team-users.js
    // Apenas removemos as associações adicionadas automaticamente
    await queryInterface.sequelize.query(
      'DELETE FROM team_users WHERE (team_id, user_id) IN (SELECT id, captain_id FROM teams)'
    );
  }
}; 