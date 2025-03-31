const Team = require('../models/teamModel');
const User = require('../models/userModel');

// Criar um novo time
exports.createTeam = async (req, res) => {
  try {
    const { name, description, players } = req.body;
    const userId = req.user.id; // ID do usuário autenticado
    
    if (!name || !description) {
      return res.status(400).json({ error: 'Nome e descrição são obrigatórios' });
    }
    
    // Verificar apenas se o nome já está em uso
    const existingTeam = await Team.findOne({ name });
    if (existingTeam) {
      return res.status(400).json({ 
        error: 'Este nome de time já está em uso. Escolha outro nome.' 
      });
    }
    
    // Criar o time sem verificar se o usuário já possui um
    const newTeam = new Team({
      name,
      description,
      owner: userId,
      players: players || []
    });
    
    await newTeam.save();
    
    res.status(201).json({ 
      message: 'Time criado com sucesso', 
      team: newTeam 
    });
  } catch (error) {
    console.error('Erro ao criar time:', error);
    res.status(500).json({ error: 'Erro ao criar time' });
  }
};

// Obter todos os times do usuário atual
exports.getTeams = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Buscar todos os times onde o usuário é dono
    const teams = await Team.find({ owner: userId });
    
    res.json(teams);
  } catch (error) {
    console.error('Erro ao buscar times:', error);
    res.status(500).json({ error: 'Erro ao buscar times' });
  }
};

// Obter um time específico
exports.getTeamById = async (req, res) => {
  try {
    const teamId = req.params.id;
    const userId = req.user.id;
    
    const team = await Team.findById(teamId);
    
    if (!team) {
      return res.status(404).json({ error: 'Time não encontrado' });
    }
    
    // Verificar se o usuário é o dono do time
    if (team.owner.toString() !== userId) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    
    res.json(team);
  } catch (error) {
    console.error('Erro ao buscar time:', error);
    res.status(500).json({ error: 'Erro ao buscar time' });
  }
};

// Atualizar um time
exports.updateTeam = async (req, res) => {
  try {
    const teamId = req.params.id;
    const userId = req.user.id;
    const { name, description, players } = req.body;
    
    const team = await Team.findById(teamId);
    
    if (!team) {
      return res.status(404).json({ error: 'Time não encontrado' });
    }
    
    // Verificar se o usuário é o dono do time
    if (team.owner.toString() !== userId) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    
    // Verificar se o novo nome já está em uso por outro time
    if (name && name !== team.name) {
      const existingTeam = await Team.findOne({ name, _id: { $ne: teamId } });
      if (existingTeam) {
        return res.status(400).json({ 
          error: 'Este nome de time já está em uso. Escolha outro nome.' 
        });
      }
    }
    
    // Atualizar o time
    team.name = name || team.name;
    team.description = description || team.description;
    team.players = players || team.players;
    
    await team.save();
    
    res.json({ 
      message: 'Time atualizado com sucesso', 
      team 
    });
  } catch (error) {
    console.error('Erro ao atualizar time:', error);
    res.status(500).json({ error: 'Erro ao atualizar time' });
  }
};

// Excluir um time
exports.deleteTeam = async (req, res) => {
  try {
    const teamId = req.params.id;
    const userId = req.user.id;
    
    const team = await Team.findById(teamId);
    
    if (!team) {
      return res.status(404).json({ error: 'Time não encontrado' });
    }
    
    // Verificar se o usuário é o dono do time
    if (team.owner.toString() !== userId) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    
    await Team.deleteOne({ _id: teamId });
    
    res.json({ message: 'Time excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir time:', error);
    res.status(500).json({ error: 'Erro ao excluir time' });
  }
}; 