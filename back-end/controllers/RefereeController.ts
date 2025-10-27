import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Referee from '../models/RefereeModel';
import MatchReferee from '../models/MatchRefereeModel';
import MatchModel from '../models/MatchModel';
import { Op } from 'sequelize';

export class RefereeController {
  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { nome, cpf, telefone, email, certificacao } = req.body;

      if (!nome || !cpf) {
        res.status(400).json({ error: 'Nome e CPF são obrigatórios' });
        return;
      }

      const cpfExists = await Referee.findOne({ where: { cpf } });
      if (cpfExists) {
        res.status(400).json({ error: 'Já existe um árbitro cadastrado com este CPF' });
        return;
      }

      const referee = await Referee.create({
        nome,
        cpf,
        telefone,
        email,
        certificacao,
        ativo: true
      });

      res.status(201).json(referee);
    } catch (error: any) {
      console.error('Erro ao criar árbitro:', error);
      res.status(500).json({ error: 'Erro ao criar árbitro', details: error.message });
    }
  }

  static async list(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { ativo, search } = req.query;

      const where: any = {};

      if (ativo !== undefined) {
        where.ativo = ativo === 'true';
      }

      if (search) {
        where[Op.or] = [
          { nome: { [Op.like]: `%${search}%` } },
          { cpf: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } }
        ];
      }

      const referees = await Referee.findAll({
        where,
        order: [['nome', 'ASC']]
      });

      res.status(200).json(referees);
    } catch (error: any) {
      console.error('Erro ao listar árbitros:', error);
      res.status(500).json({ error: 'Erro ao listar árbitros', details: error.message });
    }
  }

  static async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const referee = await Referee.findByPk(id);

      if (!referee) {
        res.status(404).json({ error: 'Árbitro não encontrado' });
        return;
      }

      res.status(200).json(referee);
    } catch (error: any) {
      console.error('Erro ao buscar árbitro:', error);
      res.status(500).json({ error: 'Erro ao buscar árbitro', details: error.message });
    }
  }

  static async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { nome, cpf, telefone, email, certificacao, ativo } = req.body;

      const referee = await Referee.findByPk(id);

      if (!referee) {
        res.status(404).json({ error: 'Árbitro não encontrado' });
        return;
      }

      if (cpf && cpf !== referee.cpf) {
        const cpfExists = await Referee.findOne({ 
          where: { 
            cpf,
            id: { [Op.ne]: id }
          } 
        });
        if (cpfExists) {
          res.status(400).json({ error: 'Já existe outro árbitro cadastrado com este CPF' });
          return;
        }
      }

      await referee.update({
        nome: nome || referee.nome,
        cpf: cpf || referee.cpf,
        telefone,
        email,
        certificacao,
        ativo: ativo !== undefined ? ativo : referee.ativo
      });

      res.status(200).json(referee);
    } catch (error: any) {
      console.error('Erro ao atualizar árbitro:', error);
      res.status(500).json({ error: 'Erro ao atualizar árbitro', details: error.message });
    }
  }

  static async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const referee = await Referee.findByPk(id);

      if (!referee) {
        res.status(404).json({ error: 'Árbitro não encontrado' });
        return;
      }

      const hasMatches = await MatchReferee.count({ where: { referee_id: id } });
      
      if (hasMatches > 0) {
        await referee.update({ ativo: false });
        res.status(200).json({ 
          message: 'Árbitro desativado (possui partidas vinculadas)',
          referee 
        });
        return;
      }

      await referee.destroy();
      res.status(200).json({ message: 'Árbitro excluído com sucesso' });
    } catch (error: any) {
      console.error('Erro ao excluir árbitro:', error);
      res.status(500).json({ error: 'Erro ao excluir árbitro', details: error.message });
    }
  }

  static async getByMatch(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { matchId } = req.params;

      const match = await MatchModel.findByPk(matchId);
      if (!match) {
        res.status(404).json({ error: 'Partida não encontrada' });
        return;
      }

      const matchReferees = await MatchReferee.findAll({
        where: { match_id: matchId },
        include: [
          {
            model: Referee,
            as: 'referee',
            attributes: ['id', 'nome', 'cpf', 'telefone', 'email', 'certificacao', 'ativo']
          }
        ]
      });

      res.status(200).json(matchReferees);
    } catch (error: any) {
      console.error('Erro ao buscar árbitros da partida:', error);
      res.status(500).json({ error: 'Erro ao buscar árbitros da partida', details: error.message });
    }
  }

  static async assignToMatch(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { matchId, refereeId } = req.params;
      const { tipo } = req.body;

      if (!tipo || !['principal', 'auxiliar'].includes(tipo)) {
        res.status(400).json({ error: 'Tipo inválido. Use "principal" ou "auxiliar"' });
        return;
      }

      const match = await MatchModel.findByPk(matchId);
      if (!match) {
        res.status(404).json({ error: 'Partida não encontrada' });
        return;
      }

      const referee = await Referee.findByPk(refereeId);
      if (!referee) {
        res.status(404).json({ error: 'Árbitro não encontrado' });
        return;
      }

      if (!referee.ativo) {
        res.status(400).json({ error: 'Árbitro está inativo' });
        return;
      }

      const exists = await MatchReferee.findOne({
        where: { 
          match_id: matchId, 
          referee_id: refereeId,
          tipo 
        }
      });

      if (exists) {
        res.status(400).json({ error: 'Árbitro já está associado a esta partida com este tipo' });
        return;
      }

      const matchReferee = await MatchReferee.create({
        match_id: parseInt(matchId),
        referee_id: parseInt(refereeId),
        tipo
      });

      const result = await MatchReferee.findByPk(matchReferee.id, {
        include: [
          {
            model: Referee,
            as: 'referee',
            attributes: ['id', 'nome', 'cpf', 'telefone', 'email', 'certificacao']
          }
        ]
      });

      res.status(201).json(result);
    } catch (error: any) {
      console.error('Erro ao associar árbitro à partida:', error);
      res.status(500).json({ error: 'Erro ao associar árbitro à partida', details: error.message });
    }
  }

  static async removeFromMatch(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { matchId, refereeId } = req.params;

      const matchReferee = await MatchReferee.findOne({
        where: { 
          match_id: matchId, 
          referee_id: refereeId 
        }
      });

      if (!matchReferee) {
        res.status(404).json({ error: 'Associação não encontrada' });
        return;
      }

      await matchReferee.destroy();
      res.status(200).json({ message: 'Árbitro removido da partida com sucesso' });
    } catch (error: any) {
      console.error('Erro ao remover árbitro da partida:', error);
      res.status(500).json({ error: 'Erro ao remover árbitro da partida', details: error.message });
    }
  }
}
