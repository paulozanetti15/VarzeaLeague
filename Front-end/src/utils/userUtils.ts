// Constantes relacionadas a usuários
export const SEXO_OPTIONS = [
  { value: 'Masculino', label: 'Masculino' },
  { value: 'Feminino', label: 'Feminino' },
  { value: 'N/A', label: 'N/A' },
];

export const USER_TYPE_OPTIONS = [
  { id: 1, name: 'Admin Master' },
  { id: 2, name: 'Admin Eventos' },
  { id: 3, name: 'Admin Times' },
  { id: 4, name: 'Usuário Comum' },
];

// Funções utilitárias para usuários
export const sexoValue = (label: string) => {
  const found = SEXO_OPTIONS.find(opt => opt.label === label || opt.value === label);
  return found ? found.value : label;
};

export const userTypeLabel = (id: number|string) => {
  const found = USER_TYPE_OPTIONS.find(opt => String(opt.id) === String(id));
  return found ? found.name : 'Desconhecido';
};

// MenuProps para Selects com fundo branco
export const getSelectMenuProps = (theme: any) => ({
  PaperProps: {
    sx: {
      backgroundColor: '#ffffff',
      color: theme.palette.text.primary,
    }
  },
  MenuListProps: {
    sx: {
      backgroundColor: '#ffffff'
    }
  }
});