export const USER_ROLES = {
  ADMIN_SISTEMA: 1,
  ADMIN_EVENTOS: 2,
  ADMIN_TIMES: 3,
  USUARIO_COMUM: 4
};

export const getRoleName = (roleId: number): string => {
  switch (roleId) {
    case USER_ROLES.ADMIN_SISTEMA:
      return 'Administrador do Sistema';
    case USER_ROLES.ADMIN_EVENTOS:
      return 'Administrador de Eventos';
    case USER_ROLES.ADMIN_TIMES:
      return 'Administrador de Times';
    case USER_ROLES.USUARIO_COMUM:
      return 'Usuário Comum';
  }
};