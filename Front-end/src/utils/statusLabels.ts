export const statusLabelMap: Record<string, string> = {
  aberta: 'Aberta',
  sem_vagas: 'Sem Vagas',
  em_andamento: 'Em Andamento',
  confirmada: 'Confirmada',
  cancelada: 'Cancelada',
  finalizada: 'Finalizada'
};

export const getStatusLabel = (status?: string): string => {
  if (!status) return '';
  return statusLabelMap[status] || status.replace(/_/g, ' ');
};
