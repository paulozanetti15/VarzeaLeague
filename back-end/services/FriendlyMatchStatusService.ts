import FriendlyMatchesModel from '../models/FriendlyMatchesModel';
import FriendlyMatchesRulesModel from '../models/FriendlyMatchesRulesModel';
import FriendlyMatchTeamsModel from '../models/FriendlyMatchTeamsModel';
import { Op } from 'sequelize';

const parseDurationToMinutes = (duration?: string): number => {
  if (!duration) return 90;
  const minutes = parseInt(duration, 10);
  return isNaN(minutes) || minutes <= 0 ? 90 : minutes;
};

const computeMatchEnd = (startDate: Date, duration?: string): Date => {
  const minutes = parseDurationToMinutes(duration);
  return new Date(startDate.getTime() + minutes * 60000);
};

export const checkAndSetMatchesInProgress = async (): Promise<void> => {
  try {
    const now = new Date();
    const candidates = await FriendlyMatchesModel.findAll({
      where: {
        status: { [Op.notIn]: ['finalizada', 'cancelada'] }
      }
    });

    for (const match of candidates) {
      if (!match.date) continue;
      
      const start = new Date(match.date);
      const end = computeMatchEnd(start, match.duration || undefined);

      if (now >= start && now < end && match.status !== 'em_andamento') {
        await match.update({ status: 'em_andamento' });
      }

      if (now >= end && match.status !== 'finalizada') {
        await match.update({ status: 'finalizada' });
      }
    }
  } catch (error) {
    throw new Error('Erro ao verificar partidas em andamento');
  }
};

export const checkAndConfirmFullMatches = async (): Promise<void> => {
  try {
    const now = new Date();

    const candidates = await FriendlyMatchesModel.findAll({
      where: {
        status: { [Op.notIn]: ['finalizada'] }
      }
    });

    for (const match of candidates) {
      try {
        const rules = await FriendlyMatchesRulesModel.findOne({ 
          where: { matchId: match.id } 
        });
        
        if (!rules?.registrationDeadline) continue;

        const deadline = new Date(rules.registrationDeadline);
        const timeString = (rules as any).registrationDeadlineTime || '23:59:59';
        const [hours, minutes, seconds] = timeString.split(':').map(Number);
        deadline.setHours(hours, minutes, seconds || 0, 0);

        const deadlinePassed = now > deadline;

        console.log(`[checkAndConfirmFullMatches] Partida ${match.id}:`, {
          now: now.toISOString(),
          deadline: deadline.toISOString(),
          deadlineTime: timeString,
          isPast: deadlinePassed,
          currentStatus: match.status
        });

        const teamsCount = await FriendlyMatchTeamsModel.count({ 
          where: { matchId: match.id } 
        });

        console.log(`[checkAndConfirmFullMatches] Partida ${match.id} - Times inscritos: ${teamsCount}`);

        if (deadlinePassed) {
          if (teamsCount >= 2 && match.status !== 'confirmada') {
            await match.update({ status: 'confirmada' });
            console.log(`[checkAndConfirmFullMatches] ✅ Partida ${match.id} confirmada`);
          } else if (teamsCount < 2 && (match.status === 'aberta' || match.status === 'sem_vagas')) {
            await match.update({ status: 'cancelada' });
            console.log(`[checkAndConfirmFullMatches] ❌ Partida ${match.id} cancelada (times insuficientes)`);
          }
        } else {
          if (match.status === 'confirmada') {
            if (teamsCount >= 2) {
              await match.update({ status: 'sem_vagas' });
              console.log(`[checkAndConfirmFullMatches] 🔄 Partida ${match.id} voltou para sem_vagas (deadline estendido)`);
            } else {
              await match.update({ status: 'aberta' });
              console.log(`[checkAndConfirmFullMatches] 🔄 Partida ${match.id} voltou para aberta (deadline estendido)`);
            }
          } else if (match.status === 'cancelada') {
            if (teamsCount >= 2) {
              await match.update({ status: 'sem_vagas' });
              console.log(`[checkAndConfirmFullMatches] 🔄 Partida ${match.id} voltou para sem_vagas (deadline estendido)`);
            } else {
              await match.update({ status: 'aberta' });
              console.log(`[checkAndConfirmFullMatches] 🔄 Partida ${match.id} voltou para aberta (deadline estendido)`);
            }
          }
        }
      } catch (matchError) {
        console.error(`Erro ao processar partida ${match.id}:`, matchError);
      }
    }
  } catch (error) {
    console.error('Erro ao confirmar partidas completas:', error);
    throw new Error('Erro ao confirmar partidas completas');
  }
};

export const checkAndSetSemVagas = async (): Promise<void> => {
  try {
    const now = new Date();

    const candidates = await FriendlyMatchesModel.findAll({
      where: {
        status: { [Op.notIn]: ['finalizada', 'cancelada', 'sem_vagas'] }
      }
    });

    for (const match of candidates) {
      try {
        const rules = await FriendlyMatchesRulesModel.findOne({ 
          where: { matchId: match.id } 
        });
        
        if (!rules?.registrationDeadline) continue;

        const deadline = new Date(rules.registrationDeadline);
        const timeString = (rules as any).registrationDeadlineTime || '23:59:59';
        const [hours, minutes, seconds] = timeString.split(':').map(Number);
        deadline.setHours(hours, minutes, seconds || 0, 0);

        if (now > deadline) continue;

        const teamsCount = await FriendlyMatchTeamsModel.count({ 
          where: { matchId: match.id } 
        });

        if (teamsCount >= 2 && match.status !== 'sem_vagas') {
          await match.update({ status: 'sem_vagas' });
        }
      } catch (matchError) {
        console.error(`Erro ao processar partida ${match.id}:`, matchError);
      }
    }
  } catch (error) {
    console.error('Erro ao atualizar partidas sem vagas:', error);
    throw new Error('Erro ao atualizar partidas sem vagas');
  }
};

export const checkAndStartConfirmedMatches = async (): Promise<void> => {
  try {
    const now = new Date();
    const candidates = await FriendlyMatchesModel.findAll({
      where: { status: 'confirmada' }
    });

    for (const match of candidates) {
      if (!match.date) continue;
      
      const start = new Date(match.date);
      const end = computeMatchEnd(start, match.duration || undefined);

      if (now >= start && now < end && match.status !== 'em_andamento') {
        await match.update({ status: 'em_andamento' });
      }

      if (now >= end && match.status !== 'finalizada') {
        await match.update({ status: 'finalizada' });
      }
    }
  } catch (error) {
    throw new Error('Erro ao iniciar partidas confirmadas');
  }
};

export const updateAllMatchStatuses = async (): Promise<void> => {
  try {
    await checkAndSetMatchesInProgress();
    await checkAndConfirmFullMatches();
    await checkAndStartConfirmedMatches();
    await checkAndSetSemVagas();
  } catch (error) {
    throw new Error('Erro ao atualizar status das partidas');
  }
};
