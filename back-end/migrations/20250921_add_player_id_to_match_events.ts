import { QueryInterface, DataTypes } from 'sequelize';

// Adiciona coluna player_id (opcional) para permitir associação direta a Player
export async function up(queryInterface: QueryInterface) {
  await queryInterface.addColumn('match_goals', 'player_id', {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'players', key: 'id' },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  });
  await queryInterface.addColumn('match_cards', 'player_id', {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'players', key: 'id' },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  });
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.removeColumn('match_goals', 'player_id');
  await queryInterface.removeColumn('match_cards', 'player_id');
}
