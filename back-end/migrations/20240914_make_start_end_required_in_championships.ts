import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration: make start_date and end_date NOT NULL in championships.
 * Strategy:
 * 1. Backfill any NULL start_date/end_date with NOW() so constraint can be applied (adjust if business wants different default).
 * 2. Alter columns to set NOT NULL.
 * 3. Down reverts to allowing NULL again.
 */
export async function up(queryInterface: QueryInterface) {
  // Backfill nulls to current timestamp (can be adjusted to a fixed date if needed)
  await queryInterface.sequelize.query(`UPDATE championships SET start_date = NOW() WHERE start_date IS NULL`);
  await queryInterface.sequelize.query(`UPDATE championships SET end_date = DATE_ADD(NOW(), INTERVAL 1 DAY) WHERE end_date IS NULL`);

  // Alter columns to NOT NULL
  await queryInterface.changeColumn('championships', 'start_date', {
    type: DataTypes.DATE,
    allowNull: false,
  });
  await queryInterface.changeColumn('championships', 'end_date', {
    type: DataTypes.DATE,
    allowNull: false,
  });
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.changeColumn('championships', 'start_date', {
    type: DataTypes.DATE,
    allowNull: true,
  });
  await queryInterface.changeColumn('championships', 'end_date', {
    type: DataTypes.DATE,
    allowNull: true,
  });
}
