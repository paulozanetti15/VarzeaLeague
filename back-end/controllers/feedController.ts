import { Request, Response } from 'express';
import { Op } from 'sequelize';
import MatchModel from '../models/MatchModel';
import ChampionshipModel from '../models/ChampionshipModel';
import MatchGoalModel from '../models/MatchGoalModel';
import MatchCardModel from '../models/MatchCardModel';
import TeamModel from '../models/TeamModel';
import UserModel from '../models/UserModel';
import PlayerModel from '../models/PlayerModel';
import MatchChampionship from '../models/MatchChampionshipModel';

interface FeedEvent {
  id: string;
  type: 'goal' | 'card' | 'match_completed' | 'championship_started' | 'championship_ended';
  timestamp: Date;
  title: string;
  description: string;
  relatedEntity?: {
    id: number;
    type: 'match' | 'championship';
    name: string;
  };
  metadata?: any;
}

export const getFeed = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const offset = req.query.offset ? Number(req.query.offset) : 0;
    const type = req.query.type as string | undefined;

    const events: FeedEvent[] = [];

    const since = new Date();
    since.setDate(since.getDate() - 30);

    if (!type || type === 'match_completed') {
      const completedMatches = await MatchModel.findAll({
        where: {
          status: 'completed',
          updatedAt: { [Op.gte]: since }
        },
        order: [['updatedAt', 'DESC']],
        limit: 10,
        include: [
          { model: UserModel, as: 'organizer', attributes: ['id', 'name'] }
        ]
      });

      for (const match of completedMatches) {
        const matchData = match.toJSON() as any;
        events.push({
          id: `match-completed-${matchData.id}`,
          type: 'match_completed',
          timestamp: new Date(matchData.updatedAt),
          title: 'Partida Finalizada',
          description: `A partida "${matchData.title}" foi finalizada`,
          relatedEntity: {
            id: matchData.id,
            type: 'match',
            name: matchData.title
          },
          metadata: {
            location: matchData.location,
            organizer: matchData.organizer?.name
          }
        });
      }
    }

    if (!type || type === 'goal') {
      const recentGoals = await MatchGoalModel.findAll({
        where: {
          created_at: { [Op.gte]: since }
        },
        order: [['created_at', 'DESC']],
        limit: 15,
        include: [
          { model: UserModel, as: 'user', attributes: ['id', 'name'] },
          { model: PlayerModel, as: 'player', attributes: ['id', 'nome'] },
          { model: MatchModel, as: 'match', attributes: ['id', 'title'] }
        ]
      });

      for (const goal of recentGoals) {
        const goalData = goal.toJSON() as any;
        const playerName = goalData.player?.nome || goalData.user?.name || 'Jogador';
        const matchTitle = goalData.match?.title || 'Partida';

        events.push({
          id: `goal-${goalData.id}`,
          type: 'goal',
          timestamp: new Date(goalData.created_at),
          title: 'Gol Marcado!',
          description: `${playerName} marcou um gol em "${matchTitle}"`,
          relatedEntity: {
            id: goalData.match_id,
            type: 'match',
            name: matchTitle
          },
          metadata: {
            player: playerName,
            playerId: goalData.player_id || goalData.user_id
          }
        });
      }
    }

    if (!type || type === 'card') {
      const recentCards = await MatchCardModel.findAll({
        where: {
          created_at: { [Op.gte]: since }
        },
        order: [['created_at', 'DESC']],
        limit: 15,
        include: [
          { model: UserModel, as: 'user', attributes: ['id', 'name'] },
          { model: PlayerModel, as: 'player', attributes: ['id', 'nome'] },
          { model: MatchModel, as: 'match', attributes: ['id', 'title'] }
        ]
      });

      for (const card of recentCards) {
        const cardData = card.toJSON() as any;
        const playerName = cardData.player?.nome || cardData.user?.name || 'Jogador';
        const matchTitle = cardData.match?.title || 'Partida';
        const cardTypeText = cardData.card_type === 'red' ? 'Cartão Vermelho' : 'Cartão Amarelo';

        events.push({
          id: `card-${cardData.id}`,
          type: 'card',
          timestamp: new Date(cardData.created_at),
          title: cardTypeText,
          description: `${playerName} recebeu ${cardTypeText.toLowerCase()} em "${matchTitle}"`,
          relatedEntity: {
            id: cardData.match_id,
            type: 'match',
            name: matchTitle
          },
          metadata: {
            player: playerName,
            cardType: cardData.card_type,
            minute: cardData.minute
          }
        });
      }
    }

    if (!type || type === 'championship_started') {
      const startedChampionships = await ChampionshipModel.findAll({
        where: {
          start_date: { [Op.lte]: new Date() },
          end_date: { [Op.gte]: new Date() }
        },
        order: [['start_date', 'DESC']],
        limit: 5
      });

      for (const championship of startedChampionships) {
        const champData = championship.toJSON() as any;
        events.push({
          id: `championship-started-${champData.id}`,
          type: 'championship_started',
          timestamp: new Date(champData.start_date),
          title: 'Campeonato Iniciado',
          description: `O campeonato "${champData.name}" começou!`,
          relatedEntity: {
            id: champData.id,
            type: 'championship',
            name: champData.name
          },
          metadata: {
            startDate: champData.start_date,
            endDate: champData.end_date,
            modality: champData.modalidade
          }
        });
      }
    }

    if (!type || type === 'championship_ended') {
      const endedChampionships = await ChampionshipModel.findAll({
        where: {
          end_date: { 
            [Op.lte]: new Date(),
            [Op.gte]: since
          }
        },
        order: [['end_date', 'DESC']],
        limit: 5
      });

      for (const championship of endedChampionships) {
        const champData = championship.toJSON() as any;
        events.push({
          id: `championship-ended-${champData.id}`,
          type: 'championship_ended',
          timestamp: new Date(champData.end_date),
          title: 'Campeonato Finalizado',
          description: `O campeonato "${champData.name}" foi concluído`,
          relatedEntity: {
            id: champData.id,
            type: 'championship',
            name: champData.name
          },
          metadata: {
            endDate: champData.end_date,
            modality: champData.modalidade
          }
        });
      }
    }

    events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const paginatedEvents = events.slice(offset, offset + limit);

    res.json({
      events: paginatedEvents,
      pagination: {
        total: events.length,
        limit,
        offset,
        hasMore: offset + limit < events.length
      }
    });
  } catch (error) {
    console.error('Erro ao buscar feed:', error);
    res.status(500).json({ message: 'Erro ao buscar feed de eventos' });
  }
};

export const getMatchResults = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const completedMatches = await MatchModel.findAll({
      where: { status: 'completed' },
      order: [['updatedAt', 'DESC']],
      limit,
      include: [
        { model: UserModel, as: 'organizer', attributes: ['id', 'name'] }
      ]
    });

    const results = [];

    for (const match of completedMatches) {
      const matchData = match.toJSON() as any;
      
      const goals = await MatchGoalModel.count({ where: { match_id: matchData.id } });
      const cards = await MatchCardModel.count({ where: { match_id: matchData.id } });

      results.push({
        id: matchData.id,
        title: matchData.title,
        date: matchData.date,
        location: matchData.location,
        organizer: matchData.organizer?.name,
        stats: {
          goals,
          cards
        }
      });
    }

    res.json({ results });
  } catch (error) {
    console.error('Erro ao buscar resultados:', error);
    res.status(500).json({ message: 'Erro ao buscar resultados' });
  }
};
