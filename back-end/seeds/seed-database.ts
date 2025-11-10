import sequelize from '../config/database';
import bcrypt from 'bcrypt';

import UserType from '../models/UserTypeModel';
import User from '../models/UserModel';
import Team from '../models/TeamModel';
import Player from '../models/PlayerModel';
import TeamPlayer from '../models/TeamPlayerModel';
import Championship from '../models/ChampionshipModel';
import TeamChampionship from '../models/TeamChampionshipModel';
import FriendlyMatches from '../models/FriendlyMatchesModel';
import FriendlyMatchesRules from '../models/FriendlyMatchesRulesModel';
import FriendlyMatchTeams from '../models/FriendlyMatchTeamsModel';
import MatchChampionship from '../models/MatchChampionshipModel';

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando seed do banco de dados...\n');

    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await sequelize.sync({ force: true });
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Banco de dados sincronizado\n');

    console.log('📝 Criando tipos de usuário...');
    const userTypes = await UserType.bulkCreate([
      { id: 1, name: 'admin_master', description: 'Administrador com acesso total ao sistema' },
      { id: 2, name: 'admin_eventos', description: 'Administrador de partidas e campeonatos' },
      { id: 3, name: 'admin_times', description: 'Administrador de times' },
      { id: 4, name: 'usuario_comum', description: 'Usuário comum com permissões básicas' }
    ]);
    console.log(`✅ ${userTypes.length} tipos de usuário criados\n`);

    console.log('👥 Criando usuários...');
    const hashedPassword = await bcrypt.hash('senha123', 10);
    
    const adminMaster = await User.create({
      name: 'Admin Master',
      cpf: '11111111111',
      phone: '11999999999',
      email: 'admin@varzealeague.com',
      password: hashedPassword,
      gender: 'Masculino',
      userTypeId: 1
    });
    console.log('✅ Admin Master criado (não cria nenhum dado)\n');

    console.log('👥 Criando organizador de eventos (admin_eventos)...');
    const organizerEventos = await User.create({
      name: 'João Silva',
      cpf: '22222222222',
      phone: '11988888888',
      email: 'joao@email.com',
      password: hashedPassword,
      gender: 'Masculino',
      userTypeId: 2
    });
    console.log('✅ Organizador de eventos criado\n');

    console.log('👥 Criando gerenciadores de times (admin_times)...');
    const organizersTeams = await User.bulkCreate([
      {
        name: 'Maria Santos',
        cpf: '33333333333',
        phone: '11977777777',
        email: 'maria@email.com',
        password: hashedPassword,
        gender: 'Feminino',
        userTypeId: 3
      },
      {
        name: 'Carlos Mendes',
        cpf: '66666666666',
        phone: '11944444444',
        email: 'carlos@email.com',
        password: hashedPassword,
        gender: 'Masculino',
        userTypeId: 3
      },
      {
        name: 'Juliana Costa',
        cpf: '77777777777',
        phone: '11933333333',
        email: 'juliana@email.com',
        password: hashedPassword,
        gender: 'Feminino',
        userTypeId: 3
      },
      {
        name: 'Roberto Silva',
        cpf: '88888888888',
        phone: '11922222222',
        email: 'roberto@email.com',
        password: hashedPassword,
        gender: 'Masculino',
        userTypeId: 3
      }
    ]);
    console.log(`✅ ${organizersTeams.length} gerenciadores de times criados (cada um pode criar 1 time)\n`);

    console.log('👥 Criando usuários comuns (usuario_comum)...');
    const commonUsers = await User.bulkCreate([
      {
        name: 'Pedro Oliveira',
        cpf: '44444444444',
        phone: '11966666666',
        email: 'pedro@email.com',
        password: hashedPassword,
        gender: 'Masculino',
        userTypeId: 4
      },
      {
        name: 'Ana Costa',
        cpf: '55555555555',
        phone: '11955555555',
        email: 'ana@email.com',
        password: hashedPassword,
        gender: 'Feminino',
        userTypeId: 4
      }
    ]);
    console.log(`✅ ${commonUsers.length} usuários comuns criados (não criam nenhum dado)\n`);

    console.log('⚽ Criando times (um por gerenciador)...');
    const teams = await Team.bulkCreate([
      {
        name: 'Tigres FC',
        captainId: organizersTeams[0].id,
        description: 'Time tradicional de São Paulo',
        city: 'São Paulo',
        state: 'SP',
        cep: '01310100',
        isDeleted: false
      },
      {
        name: 'Leões United',
        captainId: organizersTeams[1].id,
        description: 'Time competitivo da Vila Mariana',
        city: 'São Paulo',
        state: 'SP',
        cep: '04567890',
        isDeleted: false
      },
      {
        name: 'Águias FC',
        captainId: organizersTeams[2].id,
        description: 'Time feminino de Pinheiros',
        city: 'São Paulo',
        state: 'SP',
        cep: '05402000',
        isDeleted: false
      },
      {
        name: 'Panteras FC',
        captainId: organizersTeams[3].id,
        description: 'Time dos Jardins',
        city: 'São Paulo',
        state: 'SP',
        cep: '01451000',
        isDeleted: false
      }
    ]);
    console.log(`✅ ${teams.length} times criados (um por gerenciador)\n`);

    console.log('🏃 Criando jogadores...');
    const players = await Player.bulkCreate([
      { name: 'Carlos Alberto', gender: 'Masculino', dateOfBirth: '1995-01-15', position: 'Goleiro', isDeleted: false },
      { name: 'Rafael Mendes', gender: 'Masculino', dateOfBirth: '1998-03-20', position: 'Zagueiro', isDeleted: false },
      { name: 'Fernando Lima', gender: 'Masculino', dateOfBirth: '1992-07-10', position: 'Meio-campo', isDeleted: false },
      { name: 'Gustavo Pereira', gender: 'Masculino', dateOfBirth: '1997-05-25', position: 'Atacante', isDeleted: false },
      { name: 'Lucas Rodrigues', gender: 'Masculino', dateOfBirth: '1999-09-08', position: 'Lateral', isDeleted: false },
      
      { name: 'Marcos Vinicius', gender: 'Masculino', dateOfBirth: '1994-02-14', position: 'Goleiro', isDeleted: false },
      { name: 'Diego Santos', gender: 'Masculino', dateOfBirth: '1996-06-18', position: 'Zagueiro', isDeleted: false },
      { name: 'Bruno Costa', gender: 'Masculino', dateOfBirth: '1993-11-22', position: 'Meio-campo', isDeleted: false },
      { name: 'Thiago Silva', gender: 'Masculino', dateOfBirth: '1991-08-30', position: 'Atacante', isDeleted: false },
      { name: 'André Oliveira', gender: 'Masculino', dateOfBirth: '2000-04-12', position: 'Lateral', isDeleted: false },
      
      { name: 'Julia Martins', gender: 'Feminino', dateOfBirth: '1997-03-15', position: 'Goleira', isDeleted: false },
      { name: 'Camila Ferreira', gender: 'Feminino', dateOfBirth: '1999-07-20', position: 'Zagueira', isDeleted: false },
      { name: 'Beatriz Lima', gender: 'Feminino', dateOfBirth: '1995-11-10', position: 'Meio-campo', isDeleted: false },
      { name: 'Larissa Santos', gender: 'Feminino', dateOfBirth: '1998-05-25', position: 'Atacante', isDeleted: false },
      { name: 'Patricia Costa', gender: 'Feminino', dateOfBirth: '1996-09-08', position: 'Lateral', isDeleted: false },
      
      { name: 'Roberto Firmino', gender: 'Masculino', dateOfBirth: '1994-10-02', position: 'Goleiro', isDeleted: false },
      { name: 'Gabriel Jesus', gender: 'Masculino', dateOfBirth: '1997-04-03', position: 'Zagueiro', isDeleted: false },
      { name: 'Felipe Anderson', gender: 'Masculino', dateOfBirth: '1993-04-15', position: 'Meio-campo', isDeleted: false },
      { name: 'Matheus Cunha', gender: 'Masculino', dateOfBirth: '1999-05-27', position: 'Atacante', isDeleted: false },
      { name: 'Richarlison', gender: 'Masculino', dateOfBirth: '1997-05-10', position: 'Lateral', isDeleted: false }
    ]);
    console.log(`✅ ${players.length} jogadores criados\n`);

    console.log('🔗 Vinculando jogadores aos times...');
    const teamPlayers = await TeamPlayer.bulkCreate([
      { teamId: teams[0].id, playerId: players[0].id },
      { teamId: teams[0].id, playerId: players[1].id },
      { teamId: teams[0].id, playerId: players[2].id },
      { teamId: teams[0].id, playerId: players[3].id },
      { teamId: teams[0].id, playerId: players[4].id },
      
      { teamId: teams[1].id, playerId: players[5].id },
      { teamId: teams[1].id, playerId: players[6].id },
      { teamId: teams[1].id, playerId: players[7].id },
      { teamId: teams[1].id, playerId: players[8].id },
      { teamId: teams[1].id, playerId: players[9].id },
      
      { teamId: teams[2].id, playerId: players[10].id },
      { teamId: teams[2].id, playerId: players[11].id },
      { teamId: teams[2].id, playerId: players[12].id },
      { teamId: teams[2].id, playerId: players[13].id },
      { teamId: teams[2].id, playerId: players[14].id },
      
      { teamId: teams[3].id, playerId: players[15].id },
      { teamId: teams[3].id, playerId: players[16].id },
      { teamId: teams[3].id, playerId: players[17].id },
      { teamId: teams[3].id, playerId: players[18].id },
      { teamId: teams[3].id, playerId: players[19].id }
    ]);
    console.log(`✅ ${teamPlayers.length} vínculos time-jogador criados\n`);

    console.log('🏆 Criando campeonatos pelo organizador de eventos...');
    const championships = await Championship.bulkCreate([
      {
        name: 'Copa VarzeaLeague 2025',
        description: 'Primeiro campeonato oficial da temporada 2025',
        start_date: new Date('2025-01-15'),
        end_date: new Date('2025-03-30'),
        created_by: organizerEventos.id,
        modalidade: 'Society',
        nomequadra: 'Arena Paulista',
        tipo: 'mata-mata',
        fase_grupos: false,
        max_teams: 8,
        genero: 'masculino',
        status: 'open'
      },
      {
        name: 'Campeonato Feminino SP',
        description: 'Campeonato de futebol feminino de São Paulo',
        start_date: new Date('2025-02-01'),
        end_date: new Date('2025-04-15'),
        created_by: organizerEventos.id,
        modalidade: 'Futsal',
        nomequadra: 'Ginásio Municipal',
        tipo: 'liga',
        fase_grupos: true,
        max_teams: 12,
        num_grupos: 3,
        times_por_grupo: 4,
        genero: 'feminino',
        status: 'open'
      }
    ]);
    console.log(`✅ ${championships.length} campeonatos criados pelo organizador de eventos\n`);

    console.log('📋 Inscrevendo times nos campeonatos...');
    const teamChampionships = await TeamChampionship.bulkCreate([
      { teamId: teams[0].id, championshipId: championships[0].id },
      { teamId: teams[1].id, championshipId: championships[0].id },
      { teamId: teams[3].id, championshipId: championships[0].id },
      { teamId: teams[2].id, championshipId: championships[1].id }
    ]);
    console.log(`✅ ${teamChampionships.length} inscrições em campeonatos criadas\n`);

    console.log('⚽ Criando partidas amistosas pelo organizador de eventos...');
    const friendlyMatches = await FriendlyMatches.bulkCreate([
      {
        title: 'Partida Amistosa - Campo da Juventude',
        date: new Date('2025-11-20'),
        duration: '90',
        location: 'Campo da Juventude',
        square: 'Campo da Juventude',
        Uf: 'SP',
        Cep: '03164000',
        matchType: 'amistosa',
        status: 'aberta',
        organizerId: organizerEventos.id
      },
      {
        title: 'Partida Amistosa - Arena Central',
        date: new Date('2025-11-25'),
        duration: '90',
        location: 'Arena Central',
        square: 'Arena Central',
        Uf: 'SP',
        Cep: '03081000',
        matchType: 'amistosa',
        status: 'confirmada',
        organizerId: organizerEventos.id
      }
    ]);
    console.log(`✅ ${friendlyMatches.length} partidas amistosas criadas pelo organizador de eventos\n`);

    console.log('📜 Criando regras para partidas amistosas...');
    const friendlyRules = await FriendlyMatchesRules.bulkCreate([
      {
        matchId: friendlyMatches[0].id,
        registrationDeadline: new Date('2025-11-19'),
        registrationDeadlineTime: '18:00',
        minimumAge: 18,
        maximumAge: 45,
        gender: 'Masculino'
      },
      {
        matchId: friendlyMatches[1].id,
        registrationDeadline: new Date('2025-11-24'),
        registrationDeadlineTime: '18:00',
        minimumAge: 16,
        maximumAge: 50,
        gender: 'Misto'
      }
    ]);
    console.log(`✅ ${friendlyRules.length} regras de partidas criadas\n`);

    console.log('🔗 Vinculando times às partidas amistosas...');
    const friendlyMatchTeams = await FriendlyMatchTeams.bulkCreate([
      { matchId: friendlyMatches[1].id, teamId: teams[0].id },
      { matchId: friendlyMatches[1].id, teamId: teams[1].id }
    ]);
    console.log(`✅ ${friendlyMatchTeams.length} times vinculados às partidas\n`);

    console.log('🏆 Criando partidas de campeonato...');
    const championshipMatches = await MatchChampionship.bulkCreate([
      {
        id: 1,
        championship_id: championships[0].id,
        date: new Date('2025-01-20'),
        location: 'Arena Paulista',
        quadra: 'Arena Paulista',
        Rodada: 1
      },
      {
        id: 2,
        championship_id: championships[0].id,
        date: new Date('2025-01-22'),
        location: 'Arena Paulista',
        quadra: 'Arena Paulista',
        Rodada: 1
      }
    ]);
    console.log(`✅ ${championshipMatches.length} partidas de campeonato criadas\n`);

    console.log('\n🎉 Seed concluído com sucesso!\n');
    console.log('📊 Resumo:');
    console.log(`   - ${userTypes.length} tipos de usuário`);
    console.log(`   - 1 admin master (não cria nenhum dado)`);
    console.log(`   - 1 organizador de eventos (cria campeonatos e partidas amistosas)`);
    console.log(`   - 1 gerenciador de times (cria times e jogadores)`);
    console.log(`   - ${commonUsers.length} usuários comuns (não criam nenhum dado)`);
    console.log(`   - ${teams.length} times`);
    console.log(`   - ${players.length} jogadores`);
    console.log(`   - ${teamPlayers.length} vínculos time-jogador`);
    console.log(`   - ${championships.length} campeonatos`);
    console.log(`   - ${teamChampionships.length} inscrições em campeonatos`);
    console.log(`   - ${friendlyMatches.length} partidas amistosas`);
    console.log(`   - ${friendlyRules.length} regras de partidas`);
    console.log(`   - ${friendlyMatchTeams.length} times em partidas amistosas`);
    console.log(`   - ${championshipMatches.length} partidas de campeonato`);
    console.log('\n✅ Banco de dados populado e pronto para uso!\n');

  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

seedDatabase();
