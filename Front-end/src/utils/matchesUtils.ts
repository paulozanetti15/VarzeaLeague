export const getTeamInitials = (teamName: string): string => {
  const words = teamName.trim().split(' ');
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return words.map(word => word[0]).join('').substring(0, 2).toUpperCase();
};

export const getToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

export const isToday = (date: Date) => {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);
  const today = getToday();
  return normalizedDate.getTime() === today.getTime();
};

export const formatMatchDate = (isoDate?: string) => {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  d.setHours(0, 0, 0, 0);
  const today = getToday();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (d.getTime() === today.getTime()) return 'Hoje';
  if (d.getTime() === tomorrow.getTime()) return 'Amanhã';

  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};

export const getMockMatches = () => [
  {
    id: 1,
    date: new Date().toISOString(),
    time: '15:00',
    homeTeam: { id: 1, name: 'Partida Amistosa', banner: undefined },
    awayTeam: { id: 2, name: 'Aberto', banner: undefined },
    score: undefined,
    status: 'upcoming' as const,
    championship: 'Partida Amistosa',
    location: 'Campo Central',
    round: 'amistosa',
    category: 'Futebol'
  }
];


