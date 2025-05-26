import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import './CreateTeam.css';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PaletteIcon from '@mui/icons-material/Palette';
import ImageIcon from '@mui/icons-material/Image';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import EditIcon from '@mui/icons-material/Edit';
import './EditTeam.css';
import PlayerModal from '../../components/teams/PlayerModal';

interface PlayerData {
  id?: number;
  nome: string;
  sexo: string;
  ano: string;
  posicao: string;
}

interface ExistingPlayer {
  id: number;
  nome: string;
  sexo: string;
  ano: string;
  posicao: string;
}

interface TeamFormData {
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  estado: string;
  cidade: string;
  logo?: File | null;
  jogadores: PlayerData[];
}

export default function EditTeam() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [showPlayersList, setShowPlayersList] = useState(false);
  const [existingPlayers, setExistingPlayers] = useState<ExistingPlayer[]>([]);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<PlayerData | null>(null);
  const [editingPlayerIndex, setEditingPlayerIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<TeamFormData>({
    name: '',
    description: '',
    primaryColor: '#1a237e',
    secondaryColor: '#0d47a1',
    estado: '',
    cidade: '',
    logo: null,
    jogadores: [],
  });
  const [cidadesDisponiveis, setCidadesDisponiveis] = useState<string[]>([]);
  const estadosCidades: Record<string, string[]> = {
    'MG': ['Belo Horizonte', 'Ouro Preto', 'Uberlândia'],
    'PR': [
      'Cascavel', 'Colombo', 'Curitiba', 'Foz do Iguaçu', 'Guarapuava',
      'Londrina', 'Maringá', 'Paranaguá', 'Ponta Grossa', 'São José dos Pinhais', 'União da Vitória'
    ],
    'RJ': ['Niterói', 'Petrópolis', 'Rio de Janeiro'],
    'SP': ['Campinas', 'Santos', 'São Paulo'],
  };
  const estadosOrdem = Object.keys(estadosCidades).sort();

  // Função para mostrar mensagem de erro ou sucesso
  const [messageType, setMessageType] = useState<'error' | 'success' | null>(null);
  
  const showMessage = (message: string, type: 'error' | 'success') => {
    setError(message);
    setMessageType(type);
    
    if (type === 'success') {
      setTimeout(() => {
        setError('');
        setMessageType(null);
      }, 3000);
    }
  };

  useEffect(() => {
    if (!id) return;
    const fetchTeam = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        const response = await axios.get(`http://localhost:3001/api/teams/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const teamData = response.data;
        setTeamId(id);
        
        // Formatar os jogadores para o formato esperado pelo componente
        let formattedJogadores = [];
        if (teamData.players && teamData.players.length > 0) {
          formattedJogadores = teamData.players.map((player: any) => ({
            id: player.id,
            nome: player.nome,
            sexo: player.sexo,
            ano: player.ano,
            posicao: player.posicao
          }));
          setExistingPlayers(teamData.players);
        }
        
        setFormData({
          name: teamData.name || '',
          description: teamData.description || '',
          primaryColor: teamData.primaryColor || '#1a237e',
          secondaryColor: teamData.secondaryColor || '#0d47a1',
          estado: teamData.estado || '',
          cidade: teamData.cidade || '',
          logo: null,
          jogadores: formattedJogadores
        });
        
        if (teamData.banner) {
          setLogoPreview(`http://localhost:3001${teamData.banner}`);
        }
        if (teamData.estado) {
          setCidadesDisponiveis(estadosCidades[teamData.estado] || []);
        }
      } catch (err: any) {
        setError('Erro ao carregar o time.');
      }
    };
    fetchTeam();
  }, [id]);

  useEffect(() => {
    if (formData.estado) {
      setCidadesDisponiveis(estadosCidades[formData.estado] || []);
    } else {
      setCidadesDisponiveis([]);
    }
  }, [formData.estado]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePlayerChange = (index: number, field: keyof PlayerData, value: string) => {
    const updated = [...formData.jogadores];
    
    // Validação especial para o campo ano
    if (field === 'ano') {
      const anoNum = parseInt(value);
      if (anoNum < 0) {
        return; // Não permite ano negativo
      }
      if (anoNum > 120) {
        return; // Limite máximo razoável de ano
      }
    }
    
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setFormData({ ...formData, jogadores: updated });
  };

  const addPlayer = () => {
    setFormData({
      ...formData,  
      jogadores: [...formData.jogadores, { nome: '', sexo: '', ano: '', posicao: '' }],
    });
  };

  const removePlayer = (index: number) => {
    const updatedPlayers = [...formData.jogadores];
    
    // Se o jogador tiver um ID, precisamos remover a associação com o time no backend
    const player = updatedPlayers[index];
    if (player.id) {
      handleRemoveExistingPlayer(player.id);
    } else {
      // Se for um jogador novo, apenas remover localmente
      updatedPlayers.splice(index, 1);
      setFormData({ ...formData, jogadores: updatedPlayers });
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLogoClick = () => {
    if (logoInputRef.current) {
      logoInputRef.current.click();
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({ ...formData, logo: file });
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          setLogoPreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const validateFields = () => {
    if (formData.name.trim() === '') {
      setError('Nome do time é obrigatório.');
      return false;
    }
    if (formData.description.trim() === '') {
      setError('Descrição é obrigatória.');
      return false;
    }
    return true;
  };

  // Função para formatar os jogadores para o formato esperado pelo backend
  const formatJogadoresForSubmit = (jogadores: PlayerData[]) => {
    return jogadores.map(jogador => ({
      id: jogador.id,
      nome: jogador.nome,
      sexo: jogador.sexo,
      ano: jogador.ano,
      posicao: jogador.posicao
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessageType(null);
    
    if (!validateFields()) {
      setLoading(false);
      return;
    }
    try {
      const submitFormData = new FormData();
      submitFormData.append('name', formData.name);
      submitFormData.append('description', formData.description);
      submitFormData.append('primaryColor', formData.primaryColor);
      submitFormData.append('secondaryColor', formData.secondaryColor);
      submitFormData.append('estado', formData.estado);
      submitFormData.append('cidade', formData.cidade);
      
      // Formatar e enviar todos os jogadores, incluindo os modificados
      const formattedJogadores = formatJogadoresForSubmit(formData.jogadores);
      submitFormData.append('jogadores', JSON.stringify(formattedJogadores));
      
      if (formData.logo) {
        submitFormData.append('banner', formData.logo);
      }
      
      console.log('Enviando dados para atualização:', {
        name: formData.name,
        description: formData.description,
        logo: formData.logo ? 'Nova imagem selecionada' : 'Nenhuma nova imagem',
        jogadores: formData.jogadores.length
      });
      
      const response = await axios.put(`http://localhost:3001/api/teams/${id}`,
        submitFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      
      console.log('Resposta da atualização:', response.data);
      
      if (response.data.banner) {
        setLogoPreview(`http://localhost:3001${response.data.banner}`);
      }
      
      // Atualizar a lista de jogadores existentes com os novos dados
      if (response.data.players) {
        setExistingPlayers(response.data.players);
        setFormData({
          ...formData,
          jogadores: response.data.players.map((player: any) => ({
            id: player.id,
            nome: player.nome,
            sexo: player.sexo,
            ano: player.ano,
            posicao: player.posicao
          }))
        });
      }
      
      setLoading(false);
      // Exibir mensagem de sucesso
      showMessage('Time atualizado com sucesso!', 'success');
      setTimeout(() => {
        navigate('/teams');
      }, 1500);
    } catch (err: any) {
      setLoading(false);
      console.error('Erro ao atualizar time:', err);
      const errorMsg = err.response?.data?.message || 'Erro ao atualizar time. Tente novamente.';
      showMessage(errorMsg, 'error');
    }
  };

  const bannerStyle = {
    background: `linear-gradient(135deg, ${formData.primaryColor} 0%, ${formData.secondaryColor} 100%)`,
  };

  const cidadesDisponiveisOrdenadas = [...cidadesDisponiveis].sort();

  const handleRemoveExistingPlayer = async (playerId: number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      // Verificar se o playerId é válido
      if (!playerId) {
        showMessage('ID do jogador inválido', 'error');
        setLoading(false);
        return;
      }
      
      // Chamar o endpoint para remover o jogador do time (apenas a associação)
      await axios.delete(`http://localhost:3001/api/teams/${teamId}/players/${playerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Atualizar a lista de jogadores localmente
      const updatedExistingPlayers = existingPlayers.filter(player => player.id !== playerId);
      setExistingPlayers(updatedExistingPlayers);
      
      // Atualizar também a lista no formData
      const updatedFormDataPlayers = formData.jogadores.filter(player => player.id !== playerId);
      setFormData({ ...formData, jogadores: updatedFormDataPlayers });
      
      setLoading(false);
      showMessage('Jogador removido com sucesso!', 'success');
    } catch (err: any) {
      setLoading(false);
      console.error('Erro ao remover jogador:', err);
      showMessage('Erro ao remover jogador do time.', 'error');
    }
  };
  
  const togglePlayersList = () => {
    setShowPlayersList(!showPlayersList);
  };

  // Funções para gerenciar jogadores
  const openPlayerModal = () => {
    setEditingPlayer(null);
    setEditingPlayerIndex(null);
    setIsPlayerModalOpen(true);
  };

  const editPlayer = (player: PlayerData, index: number) => {
    setEditingPlayer(player);
    setEditingPlayerIndex(index);
    setIsPlayerModalOpen(true);
  };

  const handleSavePlayer = (player: PlayerData) => {
    if (editingPlayerIndex !== null) {
      // Atualizar um jogador existente
      const updatedPlayers = [...formData.jogadores];
      updatedPlayers[editingPlayerIndex] = player;
      setFormData({ ...formData, jogadores: updatedPlayers });
    } else {
      // Adicionar um novo jogador
      setFormData({
        ...formData,
        jogadores: [...formData.jogadores, player]
      });
    }
    
    // Fechar o modal após salvar
    setIsPlayerModalOpen(false);
  };

  return (
    <div className="create-team-container">
      <PlayerModal 
        isOpen={isPlayerModalOpen}
        onClose={() => setIsPlayerModalOpen(false)}
        onSave={handleSavePlayer}
        editingPlayer={editingPlayer}
      />
      
      <div className="top-navigation">
        <button 
          onClick={() => navigate('/teams')} 
          className="back-btn"
        >
          <ArrowBackIcon /> Voltar
        </button>
      </div>
      <div className="teams-header">
        <h1 className="teams-title">Editar meu time</h1>
        <p className="teams-subtitle">
          Edite as informações do seu time e seus jogadores
        </p>
      </div>
      <motion.div 
        className="form-container" 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {error && (
          <div className={`message-container ${messageType === 'success' ? 'success-message' : 'error-message'}`}>
            <p>{error}</p>
          </div>
        )}
        <div className="preview-banner" style={bannerStyle}>
          <div className="logo-preview-container" onClick={handleLogoClick}>
            {logoPreview ? (
              <img src={logoPreview} alt="Logo preview" className="logo-preview" />
            ) : (
              <div className="logo-placeholder">
                <ImageIcon />
                <span>Adicionar Logo</span>
              </div>
            )}
            <input 
              type="file" 
              ref={logoInputRef}
              className="hidden-file-input"
              name="banner" 
              onChange={handleLogoChange}
            />
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <motion.div 
            className="form-group"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <label className="form-label" htmlFor="name">Nome do Time</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Digite o nome do time"
              required
            />
          </motion.div>
          <motion.div 
            className="form-group"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label className="form-label" htmlFor="description">Descrição</label>
            <textarea
              id="description"
              name="description"
              className="form-control"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Adicione a história, curiosidades, conquistas do seu time"
              required
            />
          </motion.div>
          <motion.div 
            className="form-group"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <label className="form-label" htmlFor="estado">Estado</label>
            <select
              id="estado"
              name="estado"
              className="form-control"
              value={formData.estado}
              onChange={handleInputChange}
              required
            >
              <option value="">Selecione o estado</option>
              {estadosOrdem.map(uf => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
          </motion.div>
          <motion.div 
            className="form-group"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label className="form-label" htmlFor="cidade">Cidade</label>
            <select
              id="cidade"
              name="cidade"
              className="form-control"
              value={formData.cidade}
              onChange={handleInputChange}
              required
              disabled={!formData.estado}
            >
              <option value="">Selecione a cidade</option>
              {cidadesDisponiveisOrdenadas.map(cidade => (
                <option key={cidade} value={cidade}>{cidade}</option>
              ))}
            </select>
          </motion.div>
          <motion.div 
            className="colors-section"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <label className="form-label"> 
              <PaletteIcon style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Cores do Time
            </label>
            <div className="color-pickers">
              <div className="color-picker">
                <label htmlFor="primaryColor">Cor Primária</label>
                <input
                  type="color"
                  id="primaryColor"
                  name="primaryColor"
                  className="color-input"
                  value={formData.primaryColor}
                  onChange={handleColorChange}
                /> 
                <div className="color-text">{formData.primaryColor}</div>
              </div>
              <div className="color-picker">
                <label htmlFor="secondaryColor">Cor Secundária</label>
                <input
                  type="color"
                  id="secondaryColor"
                  name="secondaryColor"
                  className="color-input"
                  value={formData.secondaryColor}
                  onChange={handleColorChange}
                />
                <div className="color-text">{formData.secondaryColor}</div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="form-group"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="players-header">
              <label className="form-label">Cadastrar Jogadores</label>
              <button 
                type="button" 
                className="add-player-btn"
                onClick={openPlayerModal}
              >
                <AddIcon style={{ marginRight: '5px' }} /> Adicionar Jogador
              </button>
            </div>
            
            <AnimatePresence>
              {formData.jogadores.length === 0 ? (
                <motion.div 
                  className="no-players"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <p>Nenhum jogador adicionado. Clique no botão acima para adicionar jogadores ao seu time.</p>
                </motion.div>
              ) : (
                <div className="players-list">
                  {formData.jogadores.map((jogador, index) => (
                    <motion.div 
                      key={index} 
                      className="player-card"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        background: `linear-gradient(135deg, ${formData.primaryColor}20 0%, ${formData.secondaryColor}20 100%)`
                      }}
                    >
                      <div className="player-info">
                        <div className="player-name">{jogador.nome}</div>
                        <div className="player-details">
                          <span className="player-position">{jogador.posicao}</span>
                          <span className="player-year">Ano: {jogador.ano}</span>
                          <span className="player-gender">{jogador.sexo}</span>
                        </div>
                      </div>
                      <div className="player-actions">
                        <button 
                          type="button"   
                          className="edit-player-btn"
                          onClick={() => editPlayer(jogador, index)}
                        >
                          <EditIcon />
                        </button>
                        <button 
                          type="button" 
                          className="remove-player-btn"
                          onClick={() => removePlayer(index)}
                        >
                          <RemoveIcon />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </motion.div>
          
          <div className="form-actions">
            <motion.button 
              type="submit"
              className="submit-btn"
              disabled={loading}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                background: `linear-gradient(135deg, ${formData.primaryColor} 0%, ${formData.secondaryColor} 100%)`
              }}
            >
              {loading ? (
                <span className="loading-text">Salvando...</span>
              ) : (
                'Salvar Alterações'
              )}
            </motion.button>
          </div>
        </form>
        
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="form-group delete-section"
        >
          <label className="form-label delete-label" style={{ color: '#dc3545', fontWeight: 700, display: 'flex', alignItems: 'center', marginBottom: '1rem', fontSize: '1.2rem' }}>
            <WarningIcon className="warning-icon" style={{ marginRight: 8 }} />
            Área de Perigo
          </label>
          <div className="delete-card" style={{ background: 'rgba(220, 53, 69, 0.1)', border: '1px solid rgba(220, 53, 69, 0.3)', borderRadius: 10, padding: '1.5rem', textAlign: 'center', boxShadow: '0 10px 25px rgba(220, 53, 69, 0.15)' }}>
            <div className="delete-card-content">
              <h3 style={{ color: '#dc3545', marginBottom: '1rem', fontSize: '1.4rem', fontWeight: 700 }}>Deletar Time</h3>
              <p style={{ color: '#fff', marginBottom: '1.5rem', fontSize: '1rem', opacity: 0.9, lineHeight: 1.5, maxWidth: '80%', marginLeft: 'auto', marginRight: 'auto' }}>
                Esta ação não pode ser desfeita. Todos os dados do time serão permanentemente excluídos.
              </p>
              <button 
                type="button"
                className="delete-team-btn"
                style={{ backgroundColor: '#dc3545', color: 'white', borderRadius: 50, padding: '0.8rem 2rem', fontWeight: 600, fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', boxShadow: '0 4px 15px rgba(220, 53, 69, 0.25)' }}
                onClick={() => setShowDeleteConfirm(true)}
              >
                <DeleteIcon className="button-icon" style={{ marginRight: 8 }} />
                Deletar Time
              </button>
            </div>
          </div>
        </motion.div>
        {showDeleteConfirm && (
          <div className="delete-modal">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="delete-modal-content"
            >
              <div className="warning-icon-container">
                <WarningIcon className="large-warning-icon" style={{ fontSize: 48, color: '#dc3545' }} />
              </div>
              <h2 style={{ color: '#dc3545', fontWeight: 800, fontSize: '2rem', marginBottom: 8 }}>Confirmar exclusão de time</h2>
              <p style={{ color: '#fff', fontSize: '1.1rem', marginBottom: 8 }}>
                Tem certeza que deseja excluir o time <strong style={{ color: '#ffc107' }}>{formData.name}</strong>?
              </p>
              <p className="warning-text" style={{ color: '#fff', opacity: 0.7, marginBottom: 24 }}>Esta ação não pode ser desfeita!</p>
              <div className="delete-modal-actions">
                <button 
                  className="confirm-delete-btn"
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const token = localStorage.getItem('token');
                      if (!token) {
                        navigate('/login');
                        return;
                      }
                      
                      console.log('Enviando solicitação para deletar time:', id);
                      
                      const response = await axios({
                        method: 'delete',
                        url: `http://localhost:3001/api/teams/${id}`,
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json'
                        },
                        data: { confirm: true }
                      });
                      
                      console.log('Resposta da exclusão:', response.data);
                      
                      // Mostrar mensagem de sucesso
                      showMessage('Time excluído com sucesso!', 'success');
                      
                      // Aguardar um pouco antes de redirecionar para a lista de times
                      setTimeout(() => {
                        navigate('/teams');
                      }, 1500);
                    } catch (err) {
                      console.error('Erro ao deletar time:', err);
                      setShowDeleteConfirm(false);
                      showMessage('Erro ao deletar time. Tente novamente.', 'error');
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  {loading ? 'Processando...' : 'Sim, excluir time'}
                </button>
                <button 
                  className="cancel-delete-btn"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}