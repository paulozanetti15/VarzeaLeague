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
  const { name, description, start_date, end_date, modalidade, nomequadra } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: 'Nome do campeonato é obrigatório' });
  }
  
  if (!modalidade) {
    return res.status(400).json({ message: 'Modalidade é obrigatória' });
  }
  
  if (!nomequadra) {
    return res.status(400).json({ message: 'Nome da quadra é obrigatório' });
  }
  
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Token ausente' });
  }
  const decoded = jwt.verify(token, JWT_SECRET) as { id: string | number };
  const created_by = Number(decoded.id);
  
  // Date validations (server side authoritative)
  if (!start_date) {
    return res.status(400).json({ message: 'Data de início é obrigatória' });
  }
  if (!end_date) {
    return res.status(400).json({ message: 'Data de término é obrigatória' });
  }
  const parseDate = (d: string) => new Date(d);
  const start = parseDate(start_date);
  const end = parseDate(end_date);
  if (isNaN(start.getTime())) {
    return res.status(400).json({ message: 'Data de início inválida' });
  }
  if (isNaN(end.getTime())) {
    return res.status(400).json({ message: 'Data de término inválida' });
  }
  const normalizeDay = (dt: Date) => { const c = new Date(dt); c.setHours(0,0,0,0); return c; };
  const today = normalizeDay(new Date());
  const ns = normalizeDay(start);
  const ne = normalizeDay(end);
  if (ns < today) {
    return res.status(400).json({ message: 'Data de início não pode ser no passado' });
  }
  if (ne <= ns) {
    return res.status(400).json({ message: 'Data de término deve ser posterior à data de início' });
  }

  const championship = await Championship.create({
    name: name.trim(),
    description: description?.trim(),
    start_date: start_date,
    end_date: end_date,
    modalidade: modalidade.trim(),
    nomequadra: nomequadra.trim(),
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
  const { name, description, start_date, end_date, modalidade, nomequadra } = req.body;
  
  const championship = await Championship.findByPk(id);
  if (!championship) {
    return res.status(404).json({ message: 'Campeonato não encontrado' });
  }
  
  // Ownership check
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Token ausente' });
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string | number };
    const userId = Number(decoded.id);
    const ownerId = Number((championship as any).created_by);
    if (userId !== ownerId) {
      return res.status(403).json({ message: 'Apenas o criador pode editar este campeonato' });
    }
  } catch (_) {
    return res.status(401).json({ message: 'Token inválido' });
  }

  // Field validations
  if (name !== undefined && !name.trim()) {
    return res.status(400).json({ message: 'Nome do campeonato é obrigatório' });
  }
  
  if (modalidade !== undefined && !modalidade.trim()) {
    return res.status(400).json({ message: 'Modalidade é obrigatória' });
  }
  
  if (nomequadra !== undefined && !nomequadra.trim()) {
    return res.status(400).json({ message: 'Nome da quadra é obrigatório' });
  }
  
  const updateData: any = {};
  if (name !== undefined) updateData.name = name.trim();
  if (description !== undefined) updateData.description = description?.trim();
  if (start_date !== undefined) updateData.start_date = start_date;
  if (end_date !== undefined) updateData.end_date = end_date;
  if (modalidade !== undefined) updateData.modalidade = modalidade.trim();
  if (nomequadra !== undefined) updateData.nomequadra = nomequadra.trim();
  
  // Date logic if provided
  if (updateData.start_date || updateData.end_date) {
  const currentStart = updateData.start_date ? new Date(updateData.start_date) : new Date((championship as any).start_date);
  const currentEnd = updateData.end_date ? new Date(updateData.end_date) : new Date((championship as any).end_date);
    const normalizeDay = (dt: Date) => { const c = new Date(dt); c.setHours(0,0,0,0); return c; };
    const today = normalizeDay(new Date());
    const ns = normalizeDay(currentStart);
    const ne = normalizeDay(currentEnd);
    if (isNaN(ns.getTime())) {
      return res.status(400).json({ message: 'Data de início inválida' });
    }
    if (isNaN(ne.getTime())) {
      return res.status(400).json({ message: 'Data de término inválida' });
    }
    if (ns < today) {
      return res.status(400).json({ message: 'Data de início não pode ser no passado' });
    }
    if (ne <= ns) {
      return res.status(400).json({ message: 'Data de término deve ser posterior à data de início' });
    }
  }

  await championship.update(updateData);
  res.json(championship);
});

// Deletar campeonato
export const deleteChampionship = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const championship = await Championship.findByPk(id);
  if (!championship) {
    return res.status(404).json({ message: 'Campeonato não encontrado' });
  }
  // Ownership check
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Token ausente' });
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string | number };
    const userId = Number(decoded.id);
    const ownerId = Number((championship as any).created_by);
    if (userId !== ownerId) {
      return res.status(403).json({ message: 'Apenas o criador pode excluir este campeonato' });
    }
  } catch (_) {
    return res.status(401).json({ message: 'Token inválido' });
  }

  // Prevent deletion if teams linked
  const links = await TeamChampionship.findAll({ where: { championshipId: id } });
  if (links.length > 0) {
    return res.status(409).json({ message: 'Não é possível excluir: existem times vinculados ao campeonato.' });
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
