import { Request, Response, RequestHandler } from 'express';
import Championship from '../models/ChampionshipModel';
import ChampionshipApplication from '../models/ChampionshipApplicationModel';
import Team from '../models/TeamModel';
import TeamPlayer from '../models/TeamPlayerModel';
import TeamChampionship from '../models/TeamChampionshipModel';
import MatchChampionship from '../models/MatchChampionshipModel';
import MatchChampionshpReport from '../models/MatchReportChampionshipModel';
import FriendlyMatchesModel from '../models/FriendlyMatchesModel';
import FriendlyMatchTeamsModel from '../models/FriendlyMatchTeamsModel';
import User from '../models/UserModel';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import path from 'path';
import fs from 'fs';

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';

export const createChampionship = async (req: Request, res: Response) => {
  try {
    const { 
      name, 
      description, 
      start_date, 
      end_date, 
      modalidade, 
      nomequadra,
      tipo,
      fase_grupos,
      max_teams,
      genero,
      num_grupos,
      times_por_grupo,
      num_equipes_liga
    } = req.body;
    
    if (!name) {
      res.status(400).json({ message: 'Nome do campeonato é obrigatório' });
      return;
    }
    
    if (!modalidade) {
      res.status(400).json({ message: 'Modalidade é obrigatória' });
      return;
    }
    
    if (!nomequadra) {
      res.status(400).json({ message: 'Nome da quadra é obrigatório' });
      return;
    }

    if (!tipo) {
      res.status(400).json({ message: 'Tipo do campeonato é obrigatório' });
      return;
    }

    const tiposValidos = ['Liga', 'Mata-Mata'];
    if (!tiposValidos.includes(tipo)) {
      res.status(409).json({ 
        message: `Tipo de campeonato inválido. Use: ${tiposValidos.join(', ')}` 
      });
      return;
    }

    if (!genero) {
      res.status(400).json({ message: 'Gênero é obrigatório' });
      return;
    }

    const normalizedName = name.trim().toLowerCase();
    const existingChampionship = await Championship.findOne({
      where: {
        name: {
          [Op.like]: normalizedName
        }
      }
    });

    if (existingChampionship) {
      res.status(409).json({ message: 'Já existe um campeonato com este nome' });
      return;
    }

    const tipoNormalizado = tipo.toLowerCase();
    let tipoBD: 'liga' | 'mata-mata';
    
    if (tipoNormalizado === 'liga') {
      tipoBD = 'liga';
    } else {
      tipoBD = 'mata-mata';
    }

    if (tipoBD === 'liga') {
      if (!num_equipes_liga || num_equipes_liga < 4 || num_equipes_liga > 20) {
        res.status(400).json({ message: 'Para Liga, especifique entre 4 e 20 equipes' });
        return;
      }
    }

    if (tipoBD === 'mata-mata' && fase_grupos) {
      if (!num_grupos || num_grupos < 2 || num_grupos > 8) {
        res.status(400).json({ message: 'Número de grupos deve ser entre 2 e 8' });
        return;
      }
      if (!times_por_grupo || times_por_grupo < 3 || times_por_grupo > 6) {
        res.status(400).json({ message: 'Times por grupo deve ser entre 3 e 6' });
        return;
      }
      const totalTimes = num_grupos * times_por_grupo;
      if (totalTimes > max_teams) {
        res.status(400).json({ message: `Total de times (${totalTimes}) excede o máximo permitido (${max_teams})` });
        return;
      }
    }
    
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      res.status(401).json({ message: 'Token ausente' });
      return;
    }
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string | number };
    const created_by = Number(decoded.id);
    
    if (!start_date) {
      res.status(400).json({ message: 'Data de início é obrigatória' });
      return;
    }
    if (!end_date) {
      res.status(400).json({ message: 'Data de término é obrigatória' });
      return;
    }
    const parseDate = (d: string) => new Date(d);
    const start = parseDate(start_date);
    const end = parseDate(end_date);
    if (isNaN(start.getTime())) {
      res.status(400).json({ message: 'Data de início inválida' });
      return;
    }
    if (isNaN(end.getTime())) {
      res.status(400).json({ message: 'Data de término inválida' });
      return;
    }
    const normalizeDay = (dt: Date) => { const c = new Date(dt); c.setHours(0,0,0,0); return c; };
    const today = normalizeDay(new Date());
    const ns = normalizeDay(start);
    const ne = normalizeDay(end);
    if (ns < today) {
      res.status(400).json({ message: 'Data de início não pode ser no passado' });
      return;
    }
    if (ne <= ns) {
      res.status(400).json({ message: 'Data de término deve ser posterior à data de início' });
      return;
    }

    const championship = await Championship.create({
      name: name.trim(),
      description: description?.trim(),
      start_date: start_date,
      end_date: end_date,
      modalidade: modalidade.trim(),
      nomequadra: nomequadra.trim(),
      created_by,
      tipo: tipoBD,
      fase_grupos: tipoBD === 'mata-mata' ? (fase_grupos || false) : false,
      max_teams: max_teams || 8,
      genero: genero.toLowerCase() as 'masculino' | 'feminino' | 'misto',
      num_grupos: tipoBD === 'mata-mata' && fase_grupos ? num_grupos : null,
      times_por_grupo: tipoBD === 'mata-mata' && fase_grupos ? times_por_grupo : null,
      num_equipes_liga: tipoBD === 'liga' ? num_equipes_liga : null,
      status: 'draft'
    });
    
    res.status(201).json(championship);
  } catch (error) {
    res.status(500).json({ 
      message: 'Erro ao criar campeonato',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

export const listChampionships = async (req: Request, res: Response) => {
  try {
    const { 
      from, 
      to, 
      search, 
      sort, 
      championshipDateFrom, 
      championshipDateTo, 
      searchChampionships,
      tipo,
      genero,
      modalidade,
      status
    } = req.query;

    const whereClause: any = {};

    if (championshipDateFrom) {
      const fromDate = new Date(championshipDateFrom.toString());
      if (!isNaN(fromDate.getTime())) {
        whereClause.start_date = { [Op.gte]: fromDate };
      }
    }

    if (championshipDateTo) {
      const toDate = new Date(championshipDateTo.toString());
      if (!isNaN(toDate.getTime())) {
        toDate.setHours(23, 59, 59, 999);
        whereClause.start_date = { ...whereClause.start_date, [Op.lte]: toDate };
      }
    }

    if (tipo) {
      const tipoNormalizado = tipo.toString().toLowerCase();
      if (tipoNormalizado === 'liga') {
        whereClause.tipo = 'liga';
      } else if (tipoNormalizado === 'mata-mata') {
        whereClause.tipo = 'mata-mata';
      }
    }

    if (genero) {
      const generoNormalizado = genero.toString().toLowerCase();
      if (['masculino', 'feminino', 'misto'].includes(generoNormalizado)) {
        whereClause.genero = generoNormalizado;
      }
    }

    if (modalidade) {
      whereClause.modalidade = { [Op.like]: `%${modalidade.toString()}%` };
    }

    if (status) {
      const statusNormalizado = status.toString().toLowerCase();
      if (['draft', 'open', 'closed', 'in_progress', 'finished'].includes(statusNormalizado)) {
        whereClause.status = statusNormalizado;
      }
    }

    if (searchChampionships) {
      const searchTerm = searchChampionships.toString();
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${searchTerm}%` } },
        { description: { [Op.like]: `%${searchTerm}%` } }
      ];
    }

    let order: any = [['start_date', 'ASC']];
    if (sort) {
      switch (sort.toString()) {
        case 'date_desc':
          order = [['start_date', 'DESC']];
          break;
        case 'date_asc':
          order = [['start_date', 'ASC']];
          break;
        default:
          order = [['start_date', 'ASC']];
      }
    }

    const championships = await Championship.findAll({
      where: whereClause,
      order
    });

    res.json(championships);
  } catch (error) {
    console.error('Erro ao listar campeonatos:', error);
    res.status(500).json({ 
      message: 'Erro ao listar campeonatos',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

export const getChampionship = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const championship = await Championship.findByPk(id);
    if (!championship) {
      res.status(404).json({ message: 'Campeonato não encontrado' });
      return;
    }
    res.json(championship);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar campeonato' });
  }
};

export const updateChampionship = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      start_date, 
      end_date, 
      modalidade, 
      nomequadra,
      tipo,
      genero,
      fase_grupos,
      max_teams,
      num_grupos,
      times_por_grupo,
      num_equipes_liga
    } = req.body;
    
    const championship = await Championship.findByPk(id);
    if (!championship) {
      res.status(404).json({ message: 'Campeonato não encontrado' });
      return;
    }
    
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      res.status(401).json({ message: 'Token ausente' });
      return;
    }
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string | number };
      const userId = Number(decoded.id);
      const ownerId = Number((championship as any).created_by);
      if (userId !== ownerId) {
        res.status(403).json({ message: 'Apenas o criador pode editar este campeonato' });
        return;
      }
    } catch (jwtError) {
      res.status(401).json({ message: 'Token inválido' });
      return;
    }

    if (name !== undefined && !name.trim()) {
      res.status(400).json({ message: 'Nome do campeonato é obrigatório' });
      return;
    }
    
    if (modalidade !== undefined && !modalidade.trim()) {
      res.status(400).json({ message: 'Modalidade é obrigatória' });
      return;
    }
    
    if (nomequadra !== undefined && !nomequadra.trim()) {
      res.status(400).json({ message: 'Nome da quadra é obrigatório' });
      return;
    }

    if (tipo !== undefined) {
      const tiposValidos = ['Liga', 'Mata-Mata'];
      if (!tiposValidos.includes(tipo)) {
        res.status(409).json({ 
          message: `Tipo de campeonato inválido. Use: ${tiposValidos.join(', ')}` 
        });
        return;
      }
    }
    
    if (name !== undefined) {
      const normalizedName = name.trim().toLowerCase();
      const existingChampionship = await Championship.findOne({
        where: {
          name: {
            [Op.like]: normalizedName
          },
          id: {
            [Op.ne]: id
          }
        }
      });

      if (existingChampionship) {
        res.status(409).json({ message: 'Já existe outro campeonato com este nome' });
        return;
      }
    }
    
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim();
    if (start_date !== undefined) updateData.start_date = start_date;
    if (end_date !== undefined) updateData.end_date = end_date;
    if (modalidade !== undefined) updateData.modalidade = modalidade.trim();
    if (nomequadra !== undefined) updateData.nomequadra = nomequadra.trim();
    
    if (tipo !== undefined) {
      const tipoNormalizado = tipo.toLowerCase();
      if (tipoNormalizado === 'liga') {
        updateData.tipo = 'liga';
      } else {
        updateData.tipo = 'mata-mata';
      }
    }

    if (genero !== undefined) {
      updateData.genero = genero.toLowerCase();
    }

    if (fase_grupos !== undefined) {
      updateData.fase_grupos = fase_grupos;
    }

    if (max_teams !== undefined) {
      updateData.max_teams = max_teams;
    }

    if (num_grupos !== undefined) {
      updateData.num_grupos = num_grupos;
    }

    if (times_por_grupo !== undefined) {
      updateData.times_por_grupo = times_por_grupo;
    }

    if (num_equipes_liga !== undefined) {
      updateData.num_equipes_liga = num_equipes_liga;
    }

    const tipoBD = updateData.tipo || championship.tipo;
    
    if (tipoBD === 'liga') {
      if (num_equipes_liga !== undefined && (num_equipes_liga < 4 || num_equipes_liga > 20)) {
        res.status(400).json({ message: 'Para Liga, especifique entre 4 e 20 equipes' });
        return;
      }
      updateData.num_grupos = null;
      updateData.times_por_grupo = null;
    }

    if (tipoBD === 'mata-mata') {
      updateData.num_equipes_liga = null;
      
      const usaFaseGrupos = fase_grupos !== undefined ? fase_grupos : championship.fase_grupos;
      
      if (usaFaseGrupos) {
        const finalNumGrupos = num_grupos !== undefined ? num_grupos : championship.num_grupos;
        const finalTimesPorGrupo = times_por_grupo !== undefined ? times_por_grupo : championship.times_por_grupo;
        
        if (finalNumGrupos && (finalNumGrupos < 2 || finalNumGrupos > 8)) {
          res.status(400).json({ message: 'Número de grupos deve ser entre 2 e 8' });
          return;
        }
        if (finalTimesPorGrupo && (finalTimesPorGrupo < 3 || finalTimesPorGrupo > 6)) {
          res.status(400).json({ message: 'Times por grupo deve ser entre 3 e 6' });
          return;
        }
      } else {
        updateData.num_grupos = null;
        updateData.times_por_grupo = null;
      }
    }
    
    if (updateData.start_date || updateData.end_date) {
      const currentStart = updateData.start_date ? new Date(updateData.start_date) : new Date((championship as any).start_date);
      const currentEnd = updateData.end_date ? new Date(updateData.end_date) : new Date((championship as any).end_date);
      const normalizeDay = (dt: Date) => { const c = new Date(dt); c.setHours(0,0,0,0); return c; };
      const today = normalizeDay(new Date());
      const ns = normalizeDay(currentStart);
      const ne = normalizeDay(currentEnd);
      if (isNaN(ns.getTime())) {
        res.status(400).json({ message: 'Data de início inválida' });
        return;
      }
      if (isNaN(ne.getTime())) {
        res.status(400).json({ message: 'Data de término inválida' });
        return;
      }
      if (ns < today) {
        res.status(400).json({ message: 'Data de início não pode ser no passado' });
        return;
      }
      if (ne <= ns) {
        res.status(400).json({ message: 'Data de término deve ser posterior à data de início' });
        return;
      }
    }

    await championship.update(updateData);
    res.json(championship);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar campeonato' });
  }
};

// Deletar campeonato
export const deleteChampionship = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const championship = await Championship.findByPk(id);
    if (!championship) {
      res.status(404).json({ message: 'Campeonato não encontrado' });
      return;
    }

    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      res.status(401).json({ message: 'Token ausente' });
      return;
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string | number };
      const userId = Number(decoded.id);
      const ownerId = Number((championship as any).created_by);
      if (userId !== ownerId) {
        res.status(403).json({ message: 'Apenas o criador pode excluir este campeonato' });
        return;
      }
    } catch (jwtError) {
      res.status(401).json({ message: 'Token inválido' });
      return;
    }

    const links = await TeamChampionship.findAll({ where: { championshipId: id } });
    if (links.length > 0) {
      res.status(409).json({ message: 'Não é possível excluir: existem times vinculados ao campeonato.' });
      return;
    }

    await championship.destroy();
    res.json({ message: 'Campeonato deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar campeonato' });
  }
};

export const joinTeamInChampionship = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { teamId } = req.body;
    
    console.log(`[joinTeamInChampionship] Iniciando - championshipId: ${id}, teamId: ${teamId}`);
    
    if (!teamId) {
      res.status(400).json({ message: 'teamId é obrigatório' });
      return;
    }

    const championship = await Championship.findByPk(id);
    if (!championship) {
      res.status(404).json({ message: 'Campeonato não encontrado' });
      return;
    }

    const team = await Team.findOne({
      where: {
        id: teamId,
        isDeleted: false
      }
    });

    if (!team) {
      res.status(404).json({ message: 'Time não encontrado' });
      return;
    }

    const existingRegistration = await TeamChampionship.findOne({
      where: {
        teamId,
        championshipId: parseInt(id)
      }
    });

    if (existingRegistration) {
      res.status(409).json({ message: 'O time já está inscrito neste campeonato' });
      return;
    }

    const created = await TeamChampionship.create({
      teamId,
      championshipId: parseInt(id)
    });

    console.log('[joinTeamInChampionship] Sucesso:', created.toJSON());
    res.status(201).json({ message: 'Time inscrito no campeonato com sucesso' });
  } catch (error) {
    console.error('[joinTeamInChampionship] ERRO:', error);
    res.status(500).json({ message: 'Erro ao inscrever time no campeonato' });
  }
};

export const getChampionshipTeams = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const championship = await Championship.findByPk(id);
    if (!championship) {
      res.status(404).json({ message: 'Campeonato não encontrado' });
      return;
    }

    const teamChampionships = await TeamChampionship.findAll({
      where: { championshipId: parseInt(id) },
      include: [{
        model: Team,
        as: 'team',
        where: { isDeleted: false },
        required: true
      }]
    });

    const teams = teamChampionships
      .map((tc: any) => tc.team)
      .filter(Boolean);

    res.json(teams);
  } catch (error) {
    console.error('[getChampionshipTeams] Erro:', error);
    res.status(500).json({ message: 'Erro ao listar times do campeonato' });
  }
};

export const leaveTeamFromChampionship = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, teamId } = req.params;

    const championship = await Championship.findByPk(id);
    if (!championship) {
      res.status(404).json({ message: 'Campeonato não encontrado' });
      return;
    }

    const link = await TeamChampionship.findOne({ where: { championshipId: id, teamId } });
    if (!link) {
      res.status(404).json({ message: 'O time não está inscrito neste campeonato' });
      return;
    }

    await link.destroy();
    res.json({ message: 'Time removido do campeonato com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao remover time do campeonato' });
  }
};

export const applyToChampionship = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { teamId } = req.body;

    if (!teamId) {
      res.status(400).json({ message: 'ID do time é obrigatório' });
      return;
    }

    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      res.status(401).json({ message: 'Token ausente' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string | number };
    const userId = Number(decoded.id);

    const championship = await Championship.findByPk(parseInt(id));
    if (!championship) {
      res.status(404).json({ message: 'Campeonato não encontrado' });
      return;
    }

    if (championship.status !== 'open') {
      res.status(400).json({ 
        message: `Este campeonato não está aceitando aplicações no momento. Status atual: ${championship.status}`,
        hint: championship.status === 'draft' ? 'O campeonato precisa ser publicado primeiro' : undefined
      });
      return;
    }

    const team = await Team.findByPk(teamId);
    if (!team) {
      res.status(404).json({ message: 'Time não encontrado' });
      return;
    }

    const existingApplication = await ChampionshipApplication.findOne({
      where: { championship_id: parseInt(id), team_id: teamId }
    });

    if (existingApplication) {
      res.status(409).json({ message: 'Este time já aplicou para este campeonato' });
      return;
    }

    const application = await ChampionshipApplication.create({
      championship_id: parseInt(id),
      team_id: teamId,
      status: 'pending'
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao aplicar para campeonato' });
  }
};

export const getChampionshipApplications = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      res.status(401).json({ message: 'Token ausente' });
      return;
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string | number };
      const userId = Number(decoded.id);

      const championship = await Championship.findByPk(parseInt(id));
      if (!championship) {
        res.status(404).json({ message: 'Campeonato não encontrado' });
        return;
      }

      if (championship.created_by !== userId) {
        res.status(403).json({ message: 'Acesso negado' });
        return;
      }

      const applications = await ChampionshipApplication.findAll({
        where: { championship_id: parseInt(id) },
        include: [
          {
            model: Team,
            as: 'applicationTeam',
            attributes: ['id', 'name', 'description']
          }
        ],
        order: [['applied_at', 'ASC']]
      });

      res.json(applications);
    } catch (jwtError) {
      res.status(401).json({ message: 'Token inválido' });
      return;
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar aplicações' });
  }
};

export const updateApplicationStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { applicationId } = req.params;
    const { status, rejection_reason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      res.status(400).json({ message: 'Status deve ser "approved" ou "rejected"' });
      return;
    }

    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      res.status(401).json({ message: 'Token ausente' });
      return;
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string | number };
      const userId = Number(decoded.id);

      const application = await ChampionshipApplication.findByPk(applicationId);
      if (!application) {
        res.status(404).json({ message: 'Aplicação não encontrada' });
        return;
      }

      const championship = await Championship.findByPk(application.championship_id);
      if (!championship) {
        res.status(404).json({ message: 'Campeonato não encontrado' });
        return;
      }

      if (championship.created_by !== userId) {
        res.status(403).json({ message: 'Acesso negado' });
        return;
      }

      if (application.status === status) {
        res.status(409).json({ 
          message: `Esta candidatura já está com o status "${status}"`,
          currentStatus: application.status
        });
        return;
      }

      if (application.status !== 'pending') {
        res.status(409).json({ 
          message: `Não é possível alterar candidatura com status "${application.status}"`,
          currentStatus: application.status,
          hint: 'Apenas candidaturas pendentes podem ser aprovadas ou rejeitadas'
        });
        return;
      }

      application.status = status;
      if (status === 'approved') {
        application.approved_at = new Date();
      } else if (status === 'rejected') {
        application.rejected_at = new Date();
        application.rejection_reason = rejection_reason;
      }

      await application.save();
      res.json(application);
    } catch (jwtError) {
      res.status(401).json({ message: 'Token inválido' });
      return;
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar aplicação' });
  }
};

export const publishChampionship = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      res.status(401).json({ message: 'Token ausente' });
      return;
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string | number };
      const userId = Number(decoded.id);

      const championship = await Championship.findByPk(parseInt(id));
      if (!championship) {
        res.status(404).json({ message: 'Campeonato não encontrado' });
        return;
      }

      if (championship.created_by !== userId) {
        res.status(403).json({ message: 'Acesso negado' });
        return;
      }

      if (championship.status !== 'draft') {
        res.status(400).json({ 
          message: 'Apenas campeonatos em rascunho podem ser publicados',
          currentStatus: championship.status
        });
        return;
      }

      championship.status = 'open';
      await championship.save();

      res.json({ 
        message: 'Campeonato publicado com sucesso! Agora está aberto para inscrições.',
        championship 
      });
    } catch (jwtError) {
      res.status(401).json({ message: 'Token inválido' });
      return;
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro ao publicar campeonato' });
  }
};

export const uploadChampionshipLogo = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  console.log('=== UPLOAD LOGO INICIADO ===');
  console.log('ID do campeonato:', id);
  console.log('Arquivo recebido:', req.file ? {
    filename: req.file.filename,
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size
  } : 'Nenhum arquivo');

  if (!req.file) {
    console.log('Erro: Nenhum arquivo enviado');
    res.status(400).json({ message: 'Nenhum arquivo enviado' });
    return;
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      console.log('Erro: Token ausente');
      res.status(401).json({ message: 'Token ausente' });
      return;
    }

    console.log('Token recebido, verificando...');
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string | number };
    const userId = Number(decoded.id);
    console.log('User ID do token:', userId);

    const championship = await Championship.findByPk(parseInt(id));
    if (!championship) {
      console.log('Erro: Campeonato não encontrado');
      res.status(404).json({ message: 'Campeonato não encontrado' });
      return;
    }

    console.log('Campeonato encontrado:', {
      id: championship.id,
      name: championship.name,
      created_by: championship.created_by,
      current_logo: championship.logo
    });

    if (championship.created_by !== userId) {
      console.log('Erro: Usuário não é o criador', {
        championship_created_by: championship.created_by,
        user_id: userId
      });
      res.status(403).json({ message: 'Apenas o criador pode atualizar o logo' });
      return;
    }

    // Remover logo antigo se existir
    if (championship.logo) {
      const oldLogoPath = path.join(__dirname, '..', 'uploads', 'championships', championship.logo);
      console.log('Tentando remover logo antigo:', oldLogoPath);
      if (fs.existsSync(oldLogoPath)) {
        try {
          fs.unlinkSync(oldLogoPath);
          console.log('Logo antigo removido com sucesso');
        } catch (err) {
          console.warn('Erro ao remover logo antigo:', err);
        }
      } else {
        console.log('Logo antigo não encontrado no caminho:', oldLogoPath);
      }
    }

    // Atualizar logo no banco de dados
    console.log('Atualizando logo no banco de dados:', req.file.filename);
    championship.logo = req.file.filename;
    
    try {
      await championship.save();
      console.log('Logo salvo no banco com sucesso');
    } catch (saveError) {
      console.error('Erro ao salvar no banco:', saveError);
      throw saveError;
    }

    console.log('Upload concluído com sucesso');
    res.json({
      message: 'Logo atualizado com sucesso',
      logo: `/uploads/championships/${championship.logo}`
    });
  } catch (error: any) {
    console.error('=== ERRO NO UPLOAD DO LOGO ===');
    console.error('Tipo do erro:', error?.constructor?.name);
    console.error('Mensagem:', error?.message);
    console.error('Stack:', error?.stack);
    console.error('Erro completo:', error);
    res.status(500).json({ 
      message: 'Erro ao fazer upload do logo',
      error: error?.message || 'Erro desconhecido'
    });
  }
};

export const createChampionshipMatch = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  let { teamHomeId, teamAwayId, date, time, location, rodada } = req.body;

  console.log('=== INICIANDO CRIAÇÃO DE PARTIDA DE CAMPEONATO ===');
  console.log('Championship ID:', id);
  console.log('Body recebido:', { teamHomeId, teamAwayId, date, time, location, rodada });

  // Converter para números se vierem como string
  teamHomeId = Number(teamHomeId);
  teamAwayId = Number(teamAwayId);
  rodada = Number(rodada);

  if (!teamHomeId || isNaN(teamHomeId)) {
    res.status(400).json({ message: 'É necessário selecionar o time mandante' });
    return;
  }

  if (!teamAwayId || isNaN(teamAwayId)) {
    res.status(400).json({ message: 'É necessário selecionar o time visitante' });
    return;
  }

  if (teamHomeId === teamAwayId) {
    res.status(400).json({ message: 'Os times devem ser diferentes' });
    return;
  }

  if (!date) {
    res.status(400).json({ message: 'Data é obrigatória' });
    return;
  }

  if (!location || typeof location !== 'string' || location.trim().length === 0) {
    res.status(400).json({ message: 'Local é obrigatório' });
    return;
  }

  if (!rodada || isNaN(rodada) || rodada < 1) {
    res.status(400).json({ message: 'Rodada é obrigatória e deve ser um número maior que zero' });
    return;
  }

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    res.status(401).json({ message: 'Token ausente' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string | number };
    const userId = Number(decoded.id);
    console.log('User ID:', userId);

    if (!userId || isNaN(userId)) {
      res.status(401).json({ message: 'ID do usuário inválido no token' });
      return;
    }

    const championship = await Championship.findByPk(parseInt(id));
    if (!championship) {
      console.log('Campeonato não encontrado');
      res.status(404).json({ message: 'Campeonato não encontrado' });
      return;
    }
    console.log('Campeonato encontrado:', championship.name);

    if (championship.created_by !== userId) {
      console.log('Usuário não é o criador do campeonato');
      res.status(403).json({ message: 'Apenas o criador pode agendar partidas' });
      return;
    }

    const teamHome = await Team.findByPk(teamHomeId);
    const teamAway = await Team.findByPk(teamAwayId);

    if (!teamHome) {
      console.log('Time mandante não encontrado:', teamHomeId);
      res.status(404).json({ message: `Time mandante (ID: ${teamHomeId}) não foi encontrado` });
      return;
    }

    if (!teamAway) {
      console.log('Time visitante não encontrado:', teamAwayId);
      res.status(404).json({ message: `Time visitante (ID: ${teamAwayId}) não foi encontrado` });
      return;
    }
    
    console.log('Times encontrados:', { home: teamHome.name, away: teamAway.name });

    const championshipId = parseInt(id);
    if (isNaN(championshipId)) {
      res.status(400).json({ message: 'ID do campeonato inválido' });
      return;
    }

    const teamHomeInChampionship = await TeamChampionship.findOne({
      where: { championshipId: championshipId, teamId: teamHomeId }
    });

    const teamAwayInChampionship = await TeamChampionship.findOne({
      where: { championshipId: championshipId, teamId: teamAwayId }
    });

    if (!teamHomeInChampionship || !teamAwayInChampionship) {
      console.log('Times não estão inscritos no campeonato');
      res.status(400).json({ message: 'Ambos os times devem estar inscritos no campeonato' });
      return;
    }
    console.log('Times confirmados no campeonato');

    let matchDateTime: Date;
    try {
      const dateStr = date.includes('T') ? date : `${date}T${time || '00:00'}`;
      matchDateTime = new Date(dateStr);
      
      if (isNaN(matchDateTime.getTime())) {
        console.log('Data inválida:', dateStr);
        res.status(400).json({ message: 'Formato de data/hora inválido' });
        return;
      }
      
      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
      if (matchDateTime <= oneMinuteAgo) {
        console.log('Data no passado detectada:', matchDateTime, 'Agora:', now);
        res.status(400).json({ message: 'A data da partida deve ser futura' });
        return;
      }
      
      console.log('Data/hora parseada:', matchDateTime);
    } catch (error) {
      console.error('Erro ao parsear data:', error);
      res.status(400).json({ message: 'Formato de data/hora inválido' });
      return;
    }

    const nomeQuadra = championship.nomequadra?.trim() || location.trim() || 'Quadra não informada';
    console.log('Nome da quadra:', nomeQuadra);

    const locationTrimmed = location.trim();
    if (locationTrimmed.length < 5) {
      res.status(400).json({ message: 'O local deve ter pelo menos 5 caracteres' });
      return;
    }

    const matchTitle = `${teamHome.name} x ${teamAway.name} - Rodada ${rodada}`;

    console.log('Criando Match na tabela FriendlyMatches com dados:', {
      title: matchTitle,
      date: matchDateTime,
      location: locationTrimmed,
      square: nomeQuadra,
      matchType: championship.modalidade || 'Futsal',
      organizerId: userId,
      status: 'confirmada'
    });

    const match = await FriendlyMatchesModel.create({
      title: matchTitle,
      date: matchDateTime,
      location: locationTrimmed,
      square: nomeQuadra,
      matchType: championship.modalidade || 'Futsal',
      organizerId: userId,
      status: 'confirmada' as const,
      description: `Partida da Rodada ${rodada} do campeonato ${championship.name}`,
      Cep: '',
      Uf: ''
    });
    console.log('Match criado com sucesso. ID:', match.id);

    // Criar MatchChampionship vinculado ao Match criado (mesmo ID)
    console.log('Criando MatchChampionship com dados:', {
      id: match.id,
      championship_id: championshipId,
      date: matchDateTime,
      location: locationTrimmed,
      nomequadra: nomeQuadra,
      Rodada: rodada
    });

    const matchChampionship = await MatchChampionship.create({
      id: match.id, // Usar o mesmo ID do Match
      championship_id: championshipId,
      date: matchDateTime,
      location: locationTrimmed,
      nomequadra: nomeQuadra,
      Rodada: rodada
    });
    console.log('MatchChampionship criado com sucesso. ID:', matchChampionship.id);

    console.log('Vinculando times à partida através de FriendlyMatchTeamsModel');
    await FriendlyMatchTeamsModel.create({
      matchId: match.id,
      teamId: teamHomeId
    });
    await FriendlyMatchTeamsModel.create({
      matchId: match.id,
      teamId: teamAwayId
    });
    console.log('Times vinculados com sucesso');
    
    // Criar notificações para os admins dos times
    try {
      const { createNotification } = await import('./NotificationController');
      const teamHome = await Team.findByPk(teamHomeId);
      const teamAway = await Team.findByPk(teamAwayId);
      const championship = await Championship.findByPk(championshipId);
      
      if (teamHome && (teamHome as any).captainId) {
        await createNotification(
          (teamHome as any).captainId,
          'championship_match_scheduled',
          'Partida de campeonato agendada',
          `Seu time "${teamHome.name}" foi vinculado a uma partida do campeonato "${championship?.name || 'Campeonato'}" que acontecerá em ${matchDateTime ? new Date(matchDateTime).toLocaleDateString('pt-BR') : 'data a definir'}.`,
          match.id,
          teamHomeId,
          championshipId
        );
      }
      
      if (teamAway && (teamAway as any).captainId) {
        await createNotification(
          (teamAway as any).captainId,
          'championship_match_scheduled',
          'Partida de campeonato agendada',
          `Seu time "${teamAway.name}" foi vinculado a uma partida do campeonato "${championship?.name || 'Campeonato'}" que acontecerá em ${matchDateTime ? new Date(matchDateTime).toLocaleDateString('pt-BR') : 'data a definir'}.`,
          match.id,
          teamAwayId,
          championshipId
        );
      }
    } catch (notifError) {
      console.error('Erro ao criar notificações:', notifError);
      // Não falhar a operação se a notificação falhar
    }

    // Criar o report inicial com os times (placar inicial 0x0)
    console.log('Criando MatchChampionshpReport com dados:', {
      match_id: matchChampionship.id,
      team_home: teamHomeId,
      team_away: teamAwayId,
      teamHome_score: 0,
      teamAway_score: 0,
      created_by: userId,
      is_penalty: false
    });

    try {
      await MatchChampionshpReport.create({
        match_id: matchChampionship.id,
        team_home: teamHomeId,
        team_away: teamAwayId,
        teamHome_score: 0,
        teamAway_score: 0,
        created_by: userId,
        is_penalty: false
      });
      console.log('MatchChampionshpReport criado com sucesso');
    } catch (reportError: any) {
      console.error('Erro ao criar MatchChampionshpReport:', reportError);
      console.error('Detalhes do erro:', {
        name: reportError?.name,
        message: reportError?.message,
        errors: reportError?.errors,
        stack: reportError?.stack
      });
      // Se falhar ao criar o report, deletar a partida criada
      try {
        await matchChampionship.destroy();
        await match.destroy(); // Também deletar o Match
      } catch (destroyError) {
        console.error('Erro ao deletar partida após falha no report:', destroyError);
      }
      throw new Error(`Erro ao criar relatório da partida: ${reportError.message || 'Erro desconhecido'}`);
    }

    console.log('=== PARTIDA CRIADA COM SUCESSO ===');
    res.status(201).json({
      message: 'Partida agendada com sucesso',
      match: matchChampionship
    });
  } catch (error: any) {
    console.error('=== ERRO AO CRIAR PARTIDA DE CAMPEONATO ===');
    console.error('Tipo do erro:', error?.constructor?.name);
    console.error('Nome do erro:', error?.name);
    console.error('Mensagem:', error?.message);
    console.error('Stack:', error?.stack);
    console.error('Erro completo:', JSON.stringify(error, null, 2));
    
    if (error?.name === 'SequelizeValidationError') {
      const validationErrors = error.errors?.map((e: any) => `${e.path}: ${e.message}`).join(', ') || error.message;
      res.status(400).json({
        message: 'Erro de validação',
        error: validationErrors,
        details: error.errors
      });
      return;
    }
    
    if (error?.name === 'SequelizeForeignKeyConstraintError') {
      res.status(400).json({
        message: 'Erro de referência',
        error: 'Um ou mais dados referenciados não existem no banco de dados',
        details: error.message
      });
      return;
    }
    
    if (error?.name === 'SequelizeDatabaseError') {
      res.status(500).json({
        message: 'Erro no banco de dados',
        error: error.message
      });
      return;
    }
    
    res.status(500).json({
      message: 'Erro ao criar partida de campeonato',
      error: error?.message || 'Erro desconhecido',
      type: error?.name || error?.constructor?.name
    });
  }
};

export const getChampionshipMatches = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  
  const championship = await Championship.findByPk(id);
  if (!championship) {
    res.status(404).json({ message: 'Campeonato não encontrado' });
    return;
  }

  const matches = await MatchChampionship.findAll({
    where: { championship_id: id },
    attributes: ['id', 'championship_id', 'Rodada', 'date', 'location', 'quadra'],
    include: [
      {
        model: Championship,
        as: 'matchChampionship',
        attributes: ['id', 'name', 'modalidade', 'logo', 'tipo']
      },
      {
        model: MatchChampionshpReport,
        as: 'report',
        required: false,
        attributes: ['id', 'teamHome_score', 'teamAway_score', 'team_home', 'team_away', 'is_penalty']
      }
    ],
    order: [['date', 'ASC']]
  });

  res.json(matches);
};
