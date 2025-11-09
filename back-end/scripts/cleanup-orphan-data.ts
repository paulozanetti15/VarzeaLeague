import sequelize from '../config/database';

async function cleanupOrphanData() {
  try {
    console.log('🔍 Verificando dados órfãos...');

    // Limpar FriendlyMatchGoals com player_id inválido
    const [goalsResult] = await sequelize.query(`
      DELETE FROM FriendlyMatchGoals 
      WHERE player_id IS NOT NULL 
      AND player_id NOT IN (SELECT id FROM players)
    `);
    console.log(`✅ Removidos ${(goalsResult as any).affectedRows || 0} gols órfãos`);

    // Limpar FriendlyMatchCards com player_id inválido
    const [cardsResult] = await sequelize.query(`
      DELETE FROM FriendlyMatchCards 
      WHERE player_id IS NOT NULL 
      AND player_id NOT IN (SELECT id FROM players)
    `);
    console.log(`✅ Removidos ${(cardsResult as any).affectedRows || 0} cartões órfãos`);

    // Limpar ChampionshipMatchGoals com player_id inválido
    const [champGoalsResult] = await sequelize.query(`
      DELETE FROM ChampionshipMatchGoals 
      WHERE player_id IS NOT NULL 
      AND player_id NOT IN (SELECT id FROM players)
    `);
    console.log(`✅ Removidos ${(champGoalsResult as any).affectedRows || 0} gols de campeonato órfãos`);

    // Limpar ChampionshipMatchCards com player_id inválido
    const [champCardsResult] = await sequelize.query(`
      DELETE FROM ChampionshipMatchCards 
      WHERE player_id IS NOT NULL 
      AND player_id NOT IN (SELECT id FROM players)
    `);
    console.log(`✅ Removidos ${(champCardsResult as any).affectedRows || 0} cartões de campeonato órfãos`);

    console.log('✨ Limpeza concluída!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao limpar dados:', error);
    process.exit(1);
  }
}

cleanupOrphanData();
