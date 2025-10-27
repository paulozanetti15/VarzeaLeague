import { Request, Response } from 'express';
import crypto from 'crypto';
import Match from '../models/MatchModel';
import MatchTeams from '../models/MatchTeamsModel';
import TeamPlayer from '../models/TeamPlayerModel';
import Player from '../models/PlayerModel';
import MatchMvpVote from '../models/MatchMvpVoteModel';

export const listFinishedMatches = async (_req: Request, res: Response): Promise<void> => {
  try {
    const matches = await Match.findAll({
      where: { status: 'finalizada' },
      attributes: ['id', 'title', 'date', 'location', 'modalidade', 'nomequadra'],
      order: [['date', 'DESC']],
    });
    res.json(matches);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao listar partidas finalizadas' });
  }
};

export const getMatchPlayersPublic = async (req: Request, res: Response): Promise<void> => {
  try {
    const matchId = Number(req.params.id);
    const match = await Match.findByPk(matchId);
    if (!match) { res.status(404).json({ message: 'Partida não encontrada' }); return; }
    const teams = await MatchTeams.findAll({ where: { matchId } });
    const teamIds = teams.map(t => t.teamId);
    if (teamIds.length === 0) { res.json({ players: [] }); return; }
    const tps = await TeamPlayer.findAll({
      where: { teamId: teamIds },
      include: [
        { model: Player, as: 'player', attributes: ['id','nome','posicao','sexo'], where: { isDeleted: false } },
      ],
    });
    const players = tps.map((tp: any) => ({
      playerId: tp.playerId,
      nome: tp.player?.nome,
      posicao: tp.player?.posicao,
      sexo: tp.player?.sexo,
      teamId: tp.teamId,
    }));
    const seen = new Set<string>();
  const unique = players.filter(p => { const k = p.playerId+':'+p.teamId; if (seen.has(k)) return false; seen.add(k); return true; }).sort((a,b)=> a.nome.localeCompare(b.nome));
    res.json({ players: unique });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao listar jogadores' });
  }
};

export const getMvpSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const matchId = Number(req.params.id);
    const match = await Match.findByPk(matchId);
    if (!match) { res.status(404).json({ message: 'Partida não encontrada' }); return; }
    const rows = await MatchMvpVote.findAll({ where: { match_id: matchId } });
    const counts = new Map<number, number>();
    for (const r of rows as any[]) {
      const pid = Number(r.player_id);
      counts.set(pid, (counts.get(pid) || 0) + 1);
    }
    const entries = Array.from(counts.entries()).map(([playerId, votes]) => ({ playerId, votes }));
    let leader: { playerId: number; votes: number } | null = null;
    for (const e of entries) {
      if (!leader || e.votes > leader.votes) leader = e;
    }
    res.json({ votes: entries, leader });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar votos' });
  }
};

const parseCookies = (cookieHeader?: string): Record<string,string> => {
  if (!cookieHeader) return {};
  return cookieHeader.split(';').map(v => v.trim()).reduce((acc, part) => {
    const idx = part.indexOf('=');
    if (idx > -1) {
      const k = decodeURIComponent(part.slice(0, idx));
      const v = decodeURIComponent(part.slice(idx + 1));
      acc[k] = v;
    }
    return acc;
  }, {} as Record<string,string>);
};

export const upsertMvpVote = async (req: Request, res: Response): Promise<void> => {
  try {
    const matchId = Number(req.params.id);
    const { playerId } = req.body as { playerId: number };
    const userId = (req as any)?.user?.id as number | undefined;
    if (!playerId) { res.status(400).json({ message: 'Jogador inválido' }); return; }
    const match = await Match.findByPk(matchId);
    if (!match) { res.status(404).json({ message: 'Partida não encontrada' }); return; }
    if (String((match as any).status) !== 'finalizada') { res.status(400).json({ message: 'Votação permitida apenas após finalizar' }); return; }
    const teams = await MatchTeams.findAll({ where: { matchId } });
    const teamIds = teams.map(t => t.teamId);
    if (!teamIds.length) { res.status(400).json({ message: 'Partida sem times vinculados' }); return; }
    const belongs = await TeamPlayer.findOne({ where: { teamId: teamIds, playerId } as any });
    if (!belongs) { res.status(400).json({ message: 'Jogador não pertence à partida' }); return; }
    // Determine voter identity: logged-in user or anonymous token
    let anonToken: string | null = null;
    const cookies = parseCookies(req.headers.cookie);
    if (!userId) {
      anonToken = cookies['mvp_vid'] || crypto.randomUUID();
      // Set cookie if it wasn't present
      if (!cookies['mvp_vid']) {
        const maxAge = 60 * 60 * 24 * 365; // 1 year
        res.setHeader('Set-Cookie', `mvp_vid=${encodeURIComponent(anonToken)}; Max-Age=${maxAge}; Path=/; SameSite=Lax`);
      }
    }

    // Update existing vote if present (by user or anon token)
    const whereClause: any = { match_id: matchId };
    if (userId) whereClause.voter_id = userId; else whereClause.voter_token = anonToken;

    const existing = await MatchMvpVote.findOne({ where: whereClause });
    if (existing) {
      (existing as any).player_id = playerId;
      await (existing as any).save();
      res.json(existing);
      return;
    }
    const payload: any = { match_id: matchId, player_id: playerId };
    if (userId) payload.voter_id = userId; else payload.voter_token = anonToken;
    const created = await MatchMvpVote.create(payload);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao registrar voto' });
  }
};
