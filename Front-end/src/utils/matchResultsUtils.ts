export const StatusResultado = (
  idTeamHome: number,
  idTeamAway: number,
  teamHomeGoals: number,
  teamAwayGoals: number,
  meuId: number
): string => {
  let resultado: string;
  if (meuId === idTeamHome) {
    if (teamHomeGoals > teamAwayGoals) {
      resultado = 'Vitória';
    } else if (teamHomeGoals < teamAwayGoals) {
      resultado = 'Derrota';
    } else {
      resultado = 'Empate';
    }
  } else if (meuId === idTeamAway) {
    if (teamAwayGoals > teamHomeGoals) {
      resultado = 'Vitória';
    } else if (teamAwayGoals < teamHomeGoals) {
      resultado = 'Derrota';
    } else {
      resultado = 'Empate';
    }
  } else {
    resultado = 'Indefinido';
  }
  return resultado;
};

export const getResultadoClass = (
  idTeamHome: number,
  idTeamAway: number,
  teamHomeGoals: number,
  teamAwayGoals: number,
  meuId: number
): string => {
  const resultado = StatusResultado(idTeamHome, idTeamAway, teamHomeGoals, teamAwayGoals, meuId);
  switch (resultado) {
    case 'Vitória':
      return 'bg-success text-white';
    case 'Derrota':
      return 'bg-danger text-white';
    case 'Empate':
      return 'bg-secondary text-white';
    default:
      return 'bg-info text-white';
  }
};