import { Request, Response, RequestHandler } from 'express';
import Championship from '../models/ChampionshipModel';
import Team from '../models/TeamModel';
import TeamPlayer from '../models/TeamPlayerModel';
import TeamChampionship from '../models/TeamChampionshipModel'; // Added import for TeamChampionshipModel
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';

function asyncHandler(fn: any) {
  return (req: Request, res: Response, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export const createChampionship = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, start_date, end_date } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Nome do campeonato é obrigatório' });
  }
  const token = req.headers.authorization?.replace('Bearer ', '');
  const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
  const created_by = decoded.id;
  const championship = await Championship.create({
    name: name.trim(),
    description: description?.trim(),
    start_date,
    end_date,
    created_by
  });
  res.status(201).json(championship);
});

export const listChampionships = asyncHandler(async (req: Request, res: Response) => {
  const championships = await Championship.findAll();
  res.json(championships);
});

export const getChampionship = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const championship = await Championship.findByPk(id);
  if (!championship) {
    return res.status(404).json({ message: 'Campeonato não encontrado' });
  }
  res.json(championship);
});

export const updateChampionship = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const championship = await Championship.findByPk(id);
  if (!championship) {
    return res.status(404).json({ message: 'Campeonato não encontrado' });
  }
  await championship.update(req.body);
  res.json(championship);
});

// Deletar campeonato
export const deleteChampionship = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const championship = await Championship.findByPk(id);
  if (!championship) {
    return res.status(404).json({ message: 'Campeonato não encontrado' });
  }
  await championship.destroy();
  res.json({ message: 'Campeonato deletado com sucesso' });
});

export const joinTeamInChampionship = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { teamId } = req.body;
  if (!teamId) {
    return res.status(400).json({ message: 'teamId é obrigatório' });
  }
  const championship = await Championship.findByPk(id);
  if (!championship) {
    return res.status(404).json({ message: 'Campeonato não encontrado' });
  }
  const team = await Team.findByPk(teamId);
  if (!team) {
    return res.status(404).json({ message: 'Time não encontrado' });
  }
  const exists = await TeamChampionship.findOne({ where: { teamId, championshipId: id } });
  if (exists) {
    return res.status(400).json({ message: 'O time já está inscrito neste campeonato' });
  }
  await TeamChampionship.create({ teamId, championshipId: id });
  res.json({ message: 'Time inscrito no campeonato com sucesso' });
});

// Listar times inscritos em um campeonato
export const getChampionshipTeams = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const championship = await Championship.findByPk(id);
  if (!championship) {
    return res.status(404).json({ message: 'Campeonato não encontrado' });
  }

  const links = await TeamChampionship.findAll({ where: { championshipId: id } });
  const teamIds = links.map((l: any) => l.teamId);
  if (teamIds.length === 0) {
    return res.json([]);
  }

  const teams = await Team.findAll({ where: { id: teamIds } });
  res.json(teams);
});

// Remover um time do campeonato
export const leaveTeamFromChampionship = asyncHandler(async (req: Request, res: Response) => {
  const { id, teamId } = req.params;

  const championship = await Championship.findByPk(id);
  if (!championship) {
    return res.status(404).json({ message: 'Campeonato não encontrado' });
  }

  const link = await TeamChampionship.findOne({ where: { championshipId: id, teamId } });
  if (!link) {
    return res.status(404).json({ message: 'O time não está inscrito neste campeonato' });
  }

  await link.destroy();
  res.json({ message: 'Time removido do campeonato com sucesso' });
});
