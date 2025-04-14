import UserType from '../models/UserTypeModel';

const userTypes = [
  {
    id: 1,
    name: 'admin_master',
    description: 'Responsável por gerenciar o sistema e conceder permissões.'
  },
  {
    id: 2,
    name: 'admin_eventos',
    description: 'Gerencia os eventos e suas configurações no sistema.'
  },
  {
    id: 3,
    name: 'admin_times',
    description: 'Responsável pela administração dos times e seus participantes.'
  },
  {
    id: 4,
    name: 'usuario_comum',
    description: 'Gerencia os usuários do sistema e suas permissões.'
  }
];

export const seedUserTypes = async () => {
  try {
    // Verifica se já existem tipos de usuário
    const existingTypes = await UserType.findAll();
    
    if (existingTypes.length === 0) {
      // Insere os tipos de usuário
      await UserType.bulkCreate(userTypes);
      console.log('Tipos de usuário inseridos com sucesso!');
    } else {
      console.log('Tipos de usuário já existem no banco de dados.');
    }
  } catch (error) {
    console.error('Erro ao inserir tipos de usuário:', error);
  }
}; 