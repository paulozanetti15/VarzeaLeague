import MatchPlayer from "models/MatchPlayersModel";
import Match from "models/MatchModel";
import User from "models/UserModel";
import Team from "models/TeamModel";
import Sequelize from "sequelize";
export async function getMatchPlayers(req: any, res: any) {
    try {
      // Verificar se a partida existe
      const matchId = parseInt(req.params.id, 10);
      const matchExists = await Match.findByPk(matchId);
      if (!matchExists) {
        return res.json({ 
          message: 'Partida não encontrada',
          players: [],
          meta: {
            totalIndividualPlayers: 0,
            totalTeams: 0,
            totalTeamPlayers: 0,
            totalPlayers: 0,
            isEmpty: true,
            error: true,
            errorType: 'MATCH_NOT_FOUND'
          }
        });
      }
      
      // Contagem de jogadores na partida
      const matchPlayerCount = await MatchPlayer.findAndCountAll({ 
        where: { matchId: matchId }
      });
      const actualPlayerCount = matchPlayerCount.count || 0;
      
      if (actualPlayerCount === 0) {
        // Se não houver jogadores, retornar resposta vazia mas válida
        return res.json({
          players: [],
          meta: {
            totalIndividualPlayers: 0,
            totalTeams: 0,
            totalTeamPlayers: 0,
            totalPlayers: 0,
            isEmpty: true,
            hasPlayersInDB: false
          }
        });
      }
      
      // Buscar jogadores individuais
      const regularPlayersData = await User.findAll({
        attributes: [
          'id',
          'name',
          'email',
          [Sequelize.literal('false'), 'isTeam'],
          [Sequelize.literal('null'), 'teamId'],
          [Sequelize.literal('null'), 'teamName'],
          [Sequelize.literal('null'), 'playerCount'],
        ],
        include: [{
          model: MatchPlayer,
          attributes: [],
          where: {
            match_id: matchId,
            is_team: false // Garantindo que são jogadores individuais
          },
          required: true
        }],
        raw: true
      });
      
      // Transformar os resultados para o formato correto
      const regularPlayers = regularPlayersData.map(player => ({
        ...player,
        isTeam: false,
        teamId: null,
        teamName: null,
        playerCount: null
      }));
      
      // Buscar times participantes
      const teamPlayersData = await MatchPlayer.findAll({
        attributes: [
          ['user_id', 'id'],
          ['team_id', 'teamId'],
          ['match_id', 'matchId']
        ],
        include: [
          {
            model: User,
            attributes: ['name', 'email'],
            required: true
          },
          {
            model: Team,
            attributes: ['name'],
            required: false
          }
        ],
        where: {
          matchId: matchId,
          '$MatchPlayer.is_team$': true
        },
        raw: true,
        nest: true
    });
    let playerCount = 1;
    const matchIdteamplayers=teamPlayersData.map((team: any) => team.matchId)[0];
    if (teamPlayersData.length === 0) {
        const teamPlayerCount = await MatchPlayer.count({
            where: {
                matchId: teamPlayersData[0].matchId,
            },
        });
        playerCount = teamPlayerCount || 1;
    }
    const teamPlayers = teamPlayersData.map((team: any) => ({
        id: team.teamId,
        name: team.User.name,
        email: team.User.email,
        isTeam: true,
        teamId: team.teamId,
        teamName: team.Team?.name || 'Time sem nome',
        playerCount
    })); 
     const allPlayers = [...regularPlayers, ...teamPlayers];
      

    const totalRegularPlayers = regularPlayers.length;
    const totalTeams = teamPlayers.length;
    const totalTeamPlayers = teamPlayers.reduce((acc, team) =>
        acc + (parseInt(String(team.playerCount), 10) || 1), 0);
    const totalPlayers = totalRegularPlayers + totalTeamPlayers;

    return res.json({
        players: allPlayers,
        meta: {
          totalIndividualPlayers: totalRegularPlayers,
          totalTeams,
          totalTeamPlayers,
          totalPlayers,
          isEmpty: allPlayers.length === 0,
          hasPlayersInDB: actualPlayerCount > 0
        }
      });
      
    } catch (error) {
      console.error('Erro ao buscar jogadores da partida:', error);
      return res.json({
        players: [],
        meta: {
          totalIndividualPlayers: 0,
          totalTeams: 0,
          totalTeamPlayers: 0,
          totalPlayers: 0,
          isEmpty: true,
          error: true,
          errorMessage: String(error),
          hasPlayersInDB: false
        }
      });
    }
}
export async function getMatchPlayerById(req: any, res: any) {
    try {
        const match = await Match.findByPk(req.params.id);
        const userId = req.user?.id;
    
        if (!match) {
          res.status(404).json({ message: 'Partida não encontrada' });
          return;
        }
    
        if (!userId) {
          res.status(401).json({ message: 'Usuário não autenticado' });
          return;
        }
    
        if (match.status !== 'open') {
          res.status(400).json({ message: 'Esta partida não está aberta para inscrições' });
          return;
        }
    
        const playerCount = await match.countPlayers();
        if (playerCount >= match.maxPlayers) {
          res.status(400).json({ message: 'Esta partida já está cheia' });
          return;
        }
    
        await match.addPlayer(userId);
        console.log('Usuário', userId, 'entrou na partida', match.id);
        res.json({ message: 'Inscrição realizada com sucesso' });
      } catch (error) {
        console.error('Erro ao entrar na partida:', error);
        res.status(500).json({ message: 'Erro ao entrar na partida' });
      }
}
export async function leaveMatchPlayer(req: any, res: any) {
    try {
        const match = await Match.findByPk(req.params.id);
        const userId = req.user?.id;
    
        if (!match) {
          res.status(404).json({ message: 'Partida não encontrada' });
          return;
        }
    
        if (!userId) {
          res.status(401).json({ message: 'Usuário não autenticado' });
          return;
        }
        const user = await User.findByPk(userId);
        if (user) {
          await (match as any).removePlayers(user);
          console.log('Usuário', userId, 'saiu da partida', match.id);
          res.json({ message: 'Você saiu da partida com sucesso' });
        } else {
          res.status(404).json({ message: 'Usuário não encontrado' });
        }
      } catch (error) {
        console.error('Erro ao sair da partida:', error);
        res.status(500).json({ message: 'Erro ao sair da partida' });
      }            
}
export async function joinMatchByTeam(req: any, res: any) {

    const matchId = parseInt(req.params.id, 10);
    const { teamId } = req.body;  
    const match = await Match.findByPk(matchId);
    const userId = req.user?.id;

    if (!match) {
      res.status(404).json({ message: 'Partida não encontrada' });
      return;
    }

    if (!userId) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    if (match.status !== 'open') {
      res.status(400).json({ message: 'Esta partida não está aberta para inscrições' });
      return;
    }
    // Verificar se o time existe e se o usuário é capitão
    const [teamResult] = await (Match.sequelize?.query(`
      SELECT t.id, t.name, t.captain_id as captainId, 
             (SELECT COUNT(*) FROM team_players WHERE team_id = t.id) as playerCount
      FROM teams t
      WHERE t.id = ? AND t.is_deleted = false
    `, {
      replacements: [teamId]
    }) || []) as [any[], any];
    
    if (!teamResult || teamResult.length === 0) {
      res.status(404).json({ message: 'Time não encontrado ou foi removido' });
      return;
    }
    
    const team = teamResult[0];
    
    if (team.captainId !== userId) {
      res.status(403).json({ message: 'Apenas o capitão do time pode inscrevê-lo em uma partida' });
      return;
    }
    
    // Verificar se o time já está inscrito na partida
    const [existingEntry] = await (Match.sequelize?.query(`
      SELECT * FROM match_players
      WHERE match_id = ? AND user_id = ? AND is_team = true AND team_id = ?
    `, {
      replacements: [matchId, userId, teamId]
    }) || []) as [any[], any];
    
    if (existingEntry && existingEntry.length > 0) {
      res.status(400).json({ message: 'Este time já está inscrito nesta partida' });
      return;
    }
    
    // Verificar se há vagas suficientes na partida
    const currentPlayerCount = await getMatchPlayerCount(matchId);
    const teamPlayerCount = team.playerCount || 1; // Considerar pelo menos 1 jogador
    
    if (currentPlayerCount + teamPlayerCount > match.maxPlayers) {
      res.status(400).json({ 
        message: 'Não há vagas suficientes para este time na partida',
        details: {
          currentPlayers: currentPlayerCount,
          teamSize: teamPlayerCount,
          maxPlayers: match.maxPlayers,
          remaining: match.maxPlayers - currentPlayerCount
        }
      });
      return;
    }
    
    // Adicionar o time à partida
    await (Match.sequelize?.query(`
      INSERT INTO match_players (match_id, user_id, created_at, updated_at)
      VALUES (?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE updated_at = NOW()
    `, {
      replacements: [matchId, userId]
    }) || []);
    
    console.log(`Time ${team.name} (ID: ${teamId}) inscrito na partida ${matchId} pelo usuário ${userId}`);
    
    res.json({ 
      message: 'Time inscrito na partida com sucesso',
      details: {
        matchId,
        teamId,
        teamName: team.name,
        teamSize: teamPlayerCount
      }
    });
  } catch (error) {
    console.error('Erro ao entrar na partida com o time:', error);
    res.status(500).json({ message: 'Erro ao entrar na partida com o time' });
}
