import { Op } from 'sequelize';
import Player from '../models/PlayerModel';
import MatchCard from '../models/MatchCardModel';
import PlayerSuspension from '../models/PlayerSuspensionModel';
import Match from '../models/MatchModel';
import MatchChampionship from '../models/MatchChampionshipModel';

interface EligibilityResult {
  eligible: boolean;
  reason?: string;
  yellowCards?: number;
  activeSuspension?: any;
  details?: string;
}

interface SuspensionRules {
  yellowCardsForSuspension: number;
  gamesForYellowSuspension: number;
  gamesForRedSuspension: number;
}

class PlayerEligibilityService {
  private defaultRules: SuspensionRules = {
    yellowCardsForSuspension: 3,
    gamesForYellowSuspension: 1,
    gamesForRedSuspension: 2,
  };

  async checkPlayerEligibility(
    playerId: number,
    matchId: number,
    isChampionship: boolean = false
  ): Promise<EligibilityResult> {
    const match = await Match.findByPk(matchId);
    if (!match) {
      return {
        eligible: false,
        reason: 'Partida não encontrada',
      };
    }

    let championshipId: number | null = null;
    if (isChampionship) {
      const matchChamp = await MatchChampionship.findOne({
        where: { id: matchId },
      });
      championshipId = matchChamp?.championship_id || null;
    }

    const activeSuspension = await this.getActiveSuspension(playerId, championshipId);
    if (activeSuspension) {
      return {
        eligible: false,
        reason: 'Jogador suspenso',
        activeSuspension,
        details: `Suspenso por ${activeSuspension.games_to_suspend - activeSuspension.games_suspended} jogo(s) restante(s)`,
      };
    }

    const yellowCards = await this.getYellowCardsCount(playerId, championshipId);
    if (yellowCards >= this.defaultRules.yellowCardsForSuspension) {
      return {
        eligible: false,
        reason: 'Cartões amarelos acumulados',
        yellowCards,
        details: `Jogador possui ${yellowCards} cartões amarelos e está automaticamente suspenso`,
      };
    }

    return {
      eligible: true,
      yellowCards,
    };
  }

  async getActiveSuspension(playerId: number, championshipId: number | null = null) {
    const where: any = {
      player_id: playerId,
      is_active: true,
    };

    if (championshipId !== null) {
      where.championship_id = championshipId;
    } else {
      where.championship_id = null;
    }

    return await PlayerSuspension.findOne({
      where,
      order: [['created_at', 'DESC']],
    });
  }

  async getYellowCardsCount(playerId: number, championshipId: number | null = null): Promise<number> {
    const where: any = {
      player_id: playerId,
      card_type: 'yellow',
    };

    if (championshipId !== null) {
      const championshipMatches = await MatchChampionship.findAll({
        where: { championship_id: championshipId },
        attributes: ['id'],
      });
      const matchIds = championshipMatches.map(m => m.id);
      
      if (matchIds.length === 0) return 0;
      
      where.match_id = { [Op.in]: matchIds };
    }

    const cards = await MatchCard.findAll({ where });
    return cards.length;
  }

  async processCardAndCheckSuspension(
    playerId: number,
    matchId: number,
    cardType: 'yellow' | 'red',
    isChampionship: boolean = false
  ): Promise<PlayerSuspension | null> {
    let championshipId: number | null = null;
    if (isChampionship) {
      const matchChamp = await MatchChampionship.findOne({
        where: { id: matchId },
      });
      championshipId = matchChamp?.championship_id || null;
    }

    if (cardType === 'red') {
      return await this.createSuspension(
        playerId,
        championshipId,
        'red_card',
        0,
        this.defaultRules.gamesForRedSuspension,
        `Cartão vermelho direto na partida #${matchId}`
      );
    }

    const yellowCards = await this.getYellowCardsCount(playerId, championshipId);
    
    if (yellowCards >= this.defaultRules.yellowCardsForSuspension) {
      return await this.createSuspension(
        playerId,
        championshipId,
        'yellow_cards',
        yellowCards,
        this.defaultRules.gamesForYellowSuspension,
        `${yellowCards} cartões amarelos acumulados`
      );
    }

    return null;
  }

  async createSuspension(
    playerId: number,
    championshipId: number | null,
    reason: 'yellow_cards' | 'red_card' | 'manual',
    yellowCardsAccumulated: number,
    gamesToSuspend: number,
    notes: string
  ): Promise<PlayerSuspension> {
    const existingActive = await this.getActiveSuspension(playerId, championshipId);
    if (existingActive) {
      return existingActive;
    }

    return await PlayerSuspension.create({
      player_id: playerId,
      championship_id: championshipId,
      reason,
      yellow_cards_accumulated: yellowCardsAccumulated,
      games_to_suspend: gamesToSuspend,
      games_suspended: 0,
      is_active: true,
      start_date: new Date(),
      notes,
    });
  }

  async processSuspensionAfterMatch(playerId: number, matchId: number, isChampionship: boolean = false) {
    let championshipId: number | null = null;
    if (isChampionship) {
      const matchChamp = await MatchChampionship.findOne({
        where: { id: matchId },
      });
      championshipId = matchChamp?.championship_id || null;
    }

    const activeSuspension = await this.getActiveSuspension(playerId, championshipId);
    if (!activeSuspension) return;

    activeSuspension.games_suspended += 1;

    if (activeSuspension.games_suspended >= activeSuspension.games_to_suspend) {
      activeSuspension.is_active = false;
      activeSuspension.end_date = new Date();
    }

    await activeSuspension.save();
  }

  async getPlayerSuspensionHistory(playerId: number, championshipId: number | null = null) {
    const where: any = { player_id: playerId };
    if (championshipId !== null) {
      where.championship_id = championshipId;
    }

    return await PlayerSuspension.findAll({
      where,
      order: [['created_at', 'DESC']],
    });
  }
}

export default new PlayerEligibilityService();
