import { Request, Response, RequestHandler } from 'express';
import Championship from '../models/ChampionshipModel';
import ChampionshipApplication from '../models/ChampionshipApplicationModel';
import Team from '../models/TeamModel';
import TeamPlayer from '../models/TeamPlayerModel';
import TeamChampionship from '../models/TeamChampionshipModel'; // Added import for TeamChampionshipModel
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import path from 'path';
import fs from 'fs';

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';

function asyncHandler(fn: any) {
  return (req: Request, res: Response, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export const createChampionship = asyncHandler(async (req: Request, res: Response) => {
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
    return res.status(400).json({ message: 'Nome do campeonato é obrigatório' });
  }
  
  if (!modalidade) {
    return res.status(400).json({ message: 'Modalidade é obrigatória' });
  }
  
  if (!nomequadra) {
    return res.status(400).json({ message: 'Nome da quadra é obrigatório' });
  }

  if (!tipo) {
    return res.status(400).json({ message: 'Tipo do campeonato é obrigatório' });
  }

  if (!genero) {
    return res.status(400).json({ message: 'Gênero é obrigatório' });
  }

  // Validações específicas por tipo
  if (tipo === 'liga') {
    if (!num_equipes_liga || num_equipes_liga < 4 || num_equipes_liga > 20) {
      return res.status(400).json({ message: 'Para Liga, especifique entre 4 e 20 equipes' });
    }
  }

  if (tipo === 'mata-mata' && fase_grupos) {
    if (!num_grupos || num_grupos < 2 || num_grupos > 8) {
      return res.status(400).json({ message: 'Número de grupos deve ser entre 2 e 8' });
    }
    if (!times_por_grupo || times_por_grupo < 3 || times_por_grupo > 6) {
      return res.status(400).json({ message: 'Times por grupo deve ser entre 3 e 6' });
    }
    const totalTimes = num_grupos * times_por_grupo;
    if (totalTimes > max_teams) {
      return res.status(400).json({ message: `Total de times (${totalTimes}) excede o máximo permitido (${max_teams})` });
    }
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
    created_by,
    tipo,
    fase_grupos: fase_grupos || false,
    max_teams: max_teams || 8,
    genero,
    num_grupos: fase_grupos ? num_grupos : null,
    times_por_grupo: fase_grupos ? times_por_grupo : null,
    num_equipes_liga: tipo === 'liga' ? num_equipes_liga : null,
    status: 'draft'
  });
  
  res.status(201).json(championship);
});

export const listChampionships = asyncHandler(async (req: Request, res: Response) => {
  const { from, to, search, sort, championshipDateFrom, championshipDateTo, searchChampionships } = req.query;

  const whereClause: any = {};

  // Filtro por data (from) - usando start_date
  if (championshipDateFrom) {
    const fromDate = new Date(championshipDateFrom.toString());
    if (!isNaN(fromDate.getTime())) {
      whereClause.start_date = { [Op.gte]: fromDate };
    }
  }

  // Filtro por data (to) - usando start_date
  if (championshipDateTo) {
    const toDate = new Date(championshipDateTo.toString());
    if (!isNaN(toDate.getTime())) {
      // Ajustar para o final do dia
      toDate.setHours(23, 59, 59, 999);
      whereClause.start_date = { ...whereClause.start_date, [Op.lte]: toDate };
    }
  }

  // Filtro por busca (search)
  let searchWhereClause: any = {};
  if (searchChampionships) {
    const searchTerm = searchChampionships.toString().toLowerCase();
    searchWhereClause = {
      [Op.or]: [
        { name: { [Op.iLike]: `%${searchTerm}%` } },
        { description: { [Op.iLike]: `%${searchTerm}%` } }
      ]
    };
  }

  // Determinar ordenação
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
    where: {
      ...whereClause,
      ...searchWhereClause
    },
    order
  });

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

// Aplicar time para campeonato
export const applyToChampionship = asyncHandler(async (req: Request, res: Response) => {
  const { championshipId } = req.params;
  const { teamId } = req.body;

  if (!teamId) {
    return res.status(400).json({ message: 'ID do time é obrigatório' });
  }

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Token ausente' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string | number };
    const userId = Number(decoded.id);

    // Verificar se o campeonato existe e está aberto para aplicações
    const championship = await Championship.findByPk(parseInt(championshipId));
    if (!championship) {
      return res.status(404).json({ message: 'Campeonato não encontrado' });
    }

    if (championship.status !== 'open') {
      return res.status(400).json({ message: 'Este campeonato não está aceitando aplicações no momento' });
    }

    // Verificar se o time existe e pertence ao usuário
    const team = await Team.findByPk(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Time não encontrado' });
    }

    // Aqui você pode adicionar verificação se o usuário é admin do time
    // Por simplicidade, vou assumir que qualquer usuário pode aplicar

    // Verificar se já existe uma aplicação
    const existingApplication = await ChampionshipApplication.findOne({
      where: { championship_id: parseInt(championshipId), team_id: teamId }
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'Este time já aplicou para este campeonato' });
    }

    // Criar aplicação
    const application = await ChampionshipApplication.create({
      championship_id: parseInt(championshipId),
      team_id: teamId,
      status: 'pending'
    });

    res.status(201).json(application);
  } catch (error) {
    console.error('Erro ao aplicar para campeonato:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Listar aplicações de um campeonato
export const getChampionshipApplications = asyncHandler(async (req: Request, res: Response) => {
  const { championshipId } = req.params;

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Token ausente' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string | number };
    const userId = Number(decoded.id);

    // Verificar se o usuário é o criador do campeonato
    const championship = await Championship.findByPk(parseInt(championshipId));
    if (!championship) {
      return res.status(404).json({ message: 'Campeonato não encontrado' });
    }

    if (championship.created_by !== userId) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    const applications = await ChampionshipApplication.findAll({
      where: { championship_id: parseInt(championshipId) },
      include: [
        {
          model: Team,
          as: 'team',
          attributes: ['id', 'name', 'description']
        }
      ],
      order: [['applied_at', 'ASC']]
    });

    res.json(applications);
  } catch (error) {
    console.error('Erro ao buscar aplicações:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

 
export const updateApplicationStatus = asyncHandler(async (req: Request, res: Response) => {
  const { applicationId } = req.params;
  const { status, rejection_reason } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Status deve ser "approved" ou "rejected"' });
  }

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Token ausente' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string | number };
    const userId = Number(decoded.id);

    const application = await ChampionshipApplication.findByPk(applicationId);

    if (!application) {
      return res.status(404).json({ message: 'Aplicação não encontrada' });
    }

    // Verificar se o usuário é o criador do campeonato
    const championship = await Championship.findByPk(application.championship_id);
    if (!championship) {
      return res.status(404).json({ message: 'Campeonato não encontrado' });
    }

    if (championship.created_by !== userId) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    // Atualizar status
    application.status = status;
    if (status === 'approved') {
      application.approved_at = new Date();
    } else if (status === 'rejected') {
      application.rejected_at = new Date();
      application.rejection_reason = rejection_reason;
    }

    await application.save();

    res.json(application);
  } catch (error) {
    console.error('Erro ao atualizar aplicação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Publicar campeonato (abrir para aplicações)
export const publishChampionship = asyncHandler(async (req: Request, res: Response) => {
  const { championshipId } = req.params;

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Token ausente' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string | number };
    const userId = Number(decoded.id);

    const championship = await Championship.findByPk(parseInt(championshipId));
    if (!championship) {
      return res.status(404).json({ message: 'Campeonato não encontrado' });
    }

    if (championship.created_by !== userId) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    if (championship.status !== 'draft') {
      return res.status(400).json({ message: 'Apenas campeonatos em rascunho podem ser publicados' });
    }

    championship.status = 'open';
    await championship.save();

    res.json(championship);
  } catch (error) {
    console.error('Erro ao publicar campeonato:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Upload de logo do campeonato
export const uploadChampionshipLogo = asyncHandler(async (req: Request, res: Response) => {
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
    return res.status(400).json({ message: 'Nenhum arquivo enviado' });
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      console.log('Erro: Token ausente');
      return res.status(401).json({ message: 'Token ausente' });
    }

    console.log('Token recebido, verificando...');
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string | number };
    const userId = Number(decoded.id);
    console.log('User ID do token:', userId);

    const championship = await Championship.findByPk(parseInt(id));
    if (!championship) {
      console.log('Erro: Campeonato não encontrado');
      return res.status(404).json({ message: 'Campeonato não encontrado' });
    }

    console.log('Campeonato encontrado:', {
      id: championship.id,
      name: championship.name,
      created_by: championship.created_by,
      current_logo: championship.logo
    });

    // Verificar se o usuário é o criador do campeonato
    if (championship.created_by !== userId) {
      console.log('Erro: Usuário não é o criador', {
        championship_created_by: championship.created_by,
        user_id: userId
      });
      return res.status(403).json({ message: 'Apenas o criador pode atualizar o logo' });
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
});
