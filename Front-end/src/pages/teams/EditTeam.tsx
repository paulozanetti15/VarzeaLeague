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
import ToastComponent from '../../components/Toast/ToastComponent';
import BackButton from '../../components/BackButton';

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
  cep: string;
}

export default function EditTeam() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeletePlayerConfirm, setShowDeletePlayerConfirm] = useState<{show: boolean, playerId?: number, playerName?: string, index?: number}>({
    show: false,
    playerId: undefined,
    playerName: undefined,
    index: undefined
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [showPlayersList, setShowPlayersList] = useState(false);
  const [existingPlayers, setExistingPlayers] = useState<ExistingPlayer[]>([]);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<PlayerData | null>(null);
  const [editingPlayerIndex, setEditingPlayerIndex] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastBg, setToastBg] = useState('');
  const [formData, setFormData] = useState<TeamFormData>({
    name: '',
    description: '',
    primaryColor: '#1a237e',
    secondaryColor: '#0d47a1',
    estado: '',
    cidade: '',
    cep: '',
    logo: null,
    jogadores: [],
  });
  const [cidadesDisponiveis, setCidadesDisponiveis] = useState<string[]>([]);
  const [cepValido, setCepValido] = useState<boolean | null>(null);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [cepErrorMessage, setCepErrorMessage] = useState<string | null>(null);
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
        
        // Buscar explicitamente os jogadores do time
        const responsePlayer = await axios.get(`http://localhost:3001/api/teamplayers/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        console.log('Dados do time:', response.data);
        console.log('Jogadores do time:', responsePlayer.data);
        
        const teamData = response.data;
        setTeamId(id);
        
        // Formatar os jogadores para o formato esperado pelo componente
        let formattedJogadores = [];
        if (responsePlayer.data && responsePlayer.data.length > 0) {
          formattedJogadores = responsePlayer.data.map((player: any) => ({
            id: player.id,
            nome: player.nome,
            sexo: player.sexo,
            ano: player.ano,
            posicao: player.posicao
          }));
          setExistingPlayers(responsePlayer.data);
        } else if (teamData.players && teamData.players.length > 0) {
          // Fallback para usar jogadores da resposta do time se existirem
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
          cep: teamData.cep || '',
          logo: null,
          jogadores: formattedJogadores
        });
        
        // Definir o CEP como válido se já estiver preenchido
        if (teamData.cep) {
          setCepValido(true);
        }
        
        if (teamData.banner) {
          setLogoPreview(`http://localhost:3001${teamData.banner}`);
        }
      } catch (err: any) {
        console.error('Erro ao carregar o time:', err);
        setError('Erro ao carregar o time.');
      }
    };
    fetchTeam();
  }, [id]);

  // Função para aplicar máscara ao CEP
  const formatarCep = (cep: string): string => {
    // Remove qualquer caractere não numérico
    cep = cep.replace(/\D/g, '');
    
    // Aplica a máscara 00000-000
    if (cep.length > 5) {
      return `${cep.substring(0, 5)}-${cep.substring(5, 8)}`;
    }
    
    return cep;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Caso especial para CEP - aplica máscara
    if (name === 'cep') {
      const cepNumerico = value.replace(/\D/g, '');
      
      // Aplica a máscara e atualiza o formData
      const cepFormatado = formatarCep(cepNumerico);
      setFormData({
        ...formData,
        cep: cepFormatado
      });
      
      // Limpa os campos se o CEP for apagado
      if (cepNumerico.length < 8) {
        setFormData(prev => ({
          ...prev,
          estado: '',
          cidade: ''
        }));
        setCepValido(null);
        setCepErrorMessage(null);
      }
      
      // Busca CEP quando tiver 8 dígitos e for diferente do atual
      if (cepNumerico.length === 8) {
        buscarCep(cepNumerico);
      }
      
      return;
    }
    
    // Para outros campos, atualiza normalmente
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const buscarCep = async (cep: string) => {
    // Se o CEP sendo verificado é igual ao CEP original e já temos estado e cidade preenchidos,
    // não precisamos fazer a busca novamente
    const cepOriginal = formData.cep.replace(/\D/g, '');
    if (cep === cepOriginal && formData.estado && formData.cidade) {
      setCepValido(true);
      return;
    }
    
    setBuscandoCep(true);
    setCepValido(null);
    setCepErrorMessage(null);
    
    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
      
      if (response.data.erro) {
        setCepValido(false);
        setFormData(prev => ({
          ...prev,
          estado: '',
          cidade: ''
        }));
        setCepErrorMessage('CEP não encontrado na base de dados.');
        setToastMessage('CEP não encontrado');
        setToastBg('danger');
        setShowToast(true);
        return;
      }
      
      setCepValido(true);
      setFormData(prev => ({
        ...prev,
        estado: response.data.uf,
        cidade: response.data.localidade
      }));
      
      setToastMessage('CEP encontrado com sucesso!');
      setToastBg('success');
      setShowToast(true);
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      setCepValido(false);
      setFormData(prev => ({
        ...prev,
        estado: '',
        cidade: ''
      }));
      setCepErrorMessage('Erro na conexão com o serviço de CEP. Tente novamente.');
      setToastMessage('Erro ao buscar CEP. Verifique sua conexão.');
      setToastBg('danger');
      setShowToast(true);
    } finally {
      setBuscandoCep(false);
    }
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
      // Mostrar modal de confirmação antes de remover
      setShowDeletePlayerConfirm({
        show: true,
        playerId: player.id,
        playerName: player.nome,
        index: index
      });
    } else {
      // Se for um jogador novo, apenas remover localmente
      updatedPlayers.splice(index, 1);
      setFormData({ ...formData, jogadores: updatedPlayers });
    }
  };

  const confirmRemovePlayer = () => {
    const { playerId, index } = showDeletePlayerConfirm;
    
    if (playerId && index !== undefined) {
      handleRemoveExistingPlayer(playerId);
    } else if (index !== undefined) {
      // Remoção local de jogador novo
      const updatedPlayers = [...formData.jogadores];
      updatedPlayers.splice(index, 1);
      setFormData({ ...formData, jogadores: updatedPlayers });
    }
    
    // Fechar o modal
    setShowDeletePlayerConfirm({
      show: false,
      playerId: undefined,
      playerName: undefined,
      index: undefined
    });
  };

  const cancelRemovePlayer = () => {
    // Apenas fechar o modal
    setShowDeletePlayerConfirm({
      show: false,
      playerId: undefined,
      playerName: undefined,
      index: undefined
    });
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
    
    if (formData.cep.replace(/\D/g, '').length !== 8) {
      setError('CEP inválido. Informe um CEP com 8 dígitos.');
      return false;
    }
    
    // Se estamos editando um time existente e o CEP não foi alterado, 
    // consideramos válido independentemente do estado de cepValido
    const isExistingTeam = !!id;
    
    // Se temos estado e cidade preenchidos, consideramos o CEP válido para edição
    if (isExistingTeam && formData.estado && formData.cidade) {
      // É válido, não precisamos fazer mais validações de CEP
    }
    // Caso contrário, verificamos se o CEP foi validado
    else if (!cepValido && formData.cep !== '') {
      setError('CEP não encontrado. Verifique se o CEP está correto.');
      return false;
    }
    
    if (formData.estado.trim() === '' || formData.cidade.trim() === '') {
      setError('Estado e cidade são obrigatórios.');
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
    
    if (!validateFields()) {
      setLoading(false);
      return;
    }

    try {
      // Execute both API calls in parallel instead of sequentially
      const submitFormData = new FormData();
      submitFormData.append('name', formData.name);
      submitFormData.append('description', formData.description);
      submitFormData.append('primaryColor', formData.primaryColor);
      submitFormData.append('secondaryColor', formData.secondaryColor);
      submitFormData.append('estado', formData.estado);
      submitFormData.append('cidade', formData.cidade);
      submitFormData.append('cep', formData.cep);
      
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
      });
      
      console.log('Resposta da API (atualização):', response.data);
       
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
      setToastMessage('Time atualizado com sucesso!');
      setToastBg('success');
      setShowToast(true);
      
      setTimeout(() => {
        navigate('/teams');
      }, 1500);
    } catch (err: any) {
      console.error('Erro completo na atualização:', err);
      setLoading(false);
      
      let errorMsg = 'Erro ao atualizar time. Tente novamente.';
      
      if (err.response && err.response.data) {
        if (typeof err.response.data.error === 'string') {
          errorMsg = err.response.data.error;
        } else if (typeof err.response.data.message === 'string') {
          errorMsg = err.response.data.message;
        }
      }
      
      setError(errorMsg);
      setToastMessage(errorMsg);
      setToastBg('danger');
      setShowToast(true);
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
        setError('ID do jogador inválido');
        setToastMessage('ID do jogador inválido');
        setToastBg('danger');
        setShowToast(true);
        setLoading(false);
        return;
      }
      
      // Chamar o endpoint para remover o jogador do time
      await axios.delete(`http://localhost:3001/api/teamplayers/${teamId}/player/${playerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Atualizar a lista de jogadores localmente
      const updatedExistingPlayers = existingPlayers.filter(player => player.id !== playerId);
      setExistingPlayers(updatedExistingPlayers);
      
      // Atualizar também a lista no formData
      const updatedFormDataPlayers = formData.jogadores.filter(player => player.id !== playerId);
      setFormData({ ...formData, jogadores: updatedFormDataPlayers });
      
      setLoading(false);
      setToastMessage('Jogador removido com sucesso!');
      setToastBg('success');
      setShowToast(true);
    } catch (err: any) {
      setLoading(false);
      console.error('Erro ao remover jogador:', err);
      setError('Erro ao remover jogador do time.');
      setToastMessage('Erro ao remover jogador do time.');
      setToastBg('danger');
      setShowToast(true);
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
      {showToast && (
        <ToastComponent
          message={toastMessage}
          bg={toastBg}
          onClose={() => setShowToast(false)}
        />
      )}
      
      <PlayerModal 
        isOpen={isPlayerModalOpen}
        onClose={() => setIsPlayerModalOpen(false)}
        onSave={handleSavePlayer}
        editingPlayer={editingPlayer}
      />
      
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
          <div className="error-message">
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
            <label className="form-label" htmlFor="cep">CEP</label>
            <div className={`cep-input-container ${cepValido === true ? 'valid' : cepValido === false ? 'invalid' : ''}`}>
              <input
                id="cep"
                name="cep"
                className="form-control"
                value={formData.cep}
                onChange={handleInputChange}
                placeholder="00000-000"
                maxLength={9}
              />
              {buscandoCep && <span className="cep-loading">Buscando...</span>}
              {cepValido === true && <span className="cep-valid">✓</span>}
              {cepValido === false && <span className="cep-invalid">✗</span>}
            </div>
            {cepErrorMessage && (
              <div className="cep-error-message">
                {cepErrorMessage}
              </div>
            )}
          </motion.div>
          <motion.div 
            className="form-group"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <label className="form-label" htmlFor="estado">Estado</label>
            <input
              id="estado"
              name="estado"
              className="form-control"
              value={formData.estado}
              disabled
            />
          </motion.div>
          <motion.div 
            className="form-group"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label className="form-label" htmlFor="cidade">Cidade</label>
            <input
              id="cidade"
              name="cidade"
              className="form-control"
              value={formData.cidade}
              onChange={handleInputChange}
              required
              disabled
            />
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
                      
                      setShowDeleteConfirm(false);
                      setToastMessage('Time excluído com sucesso!');
                      setToastBg('success');
                      setShowToast(true);
                      
                      // Aguardar um pouco antes de redirecionar para a lista de times
                      setTimeout(() => {
                        navigate('/teams');
                      }, 1500);
                    } catch (err) {
                      console.error('Erro ao deletar time:', err);
                      setShowDeleteConfirm(false);
                      setToastMessage('Erro ao deletar time. Tente novamente.');
                      setToastBg('danger');
                      setShowToast(true);
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
        
        {/* Modal de confirmação para remoção de jogador */}
        {showDeletePlayerConfirm.show && (
          <div className="delete-modal">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="delete-modal-content"
            >
              <div className="warning-icon-container">
                <WarningIcon className="large-warning-icon" style={{ fontSize: 48, color: '#dc3545' }} />
              </div>
              <h2 style={{ color: '#dc3545', fontWeight: 800, fontSize: '1.8rem', marginBottom: 8 }}>Confirmar exclusão de jogador</h2>
              <p style={{ color: '#fff', fontSize: '1.1rem', marginBottom: 8 }}>
                Tem certeza que deseja remover o jogador <strong style={{ color: '#ffc107' }}>{showDeletePlayerConfirm.playerName}</strong> do time?
              </p>
              <p className="warning-text" style={{ color: '#fff', opacity: 0.7, marginBottom: 24 }}>Esta ação não pode ser desfeita!</p>
              <div className="delete-modal-actions">
                <button 
                  className="confirm-delete-btn"
                  onClick={confirmRemovePlayer}
                >
                  {loading ? 'Processando...' : 'Sim, remover jogador'}
                </button>
                <button 
                  className="cancel-delete-btn"
                  onClick={cancelRemovePlayer}
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