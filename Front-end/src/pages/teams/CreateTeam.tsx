import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './CreateTeam.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PaletteIcon from '@mui/icons-material/Palette';
import ImageIcon from '@mui/icons-material/Image';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import EditIcon from '@mui/icons-material/Edit';
import ToastComponent from '../../components/Toast/ToastComponent';
import PlayerModal from '../../components/teams/PlayerModal';

interface PlayerData {
  id?: number;
  nome: string;
  sexo: string;
  ano: string;
  posicao: string;
  datanascimento?: string;
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

export default function CreateTeam() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastBg, setToastBg] = useState('');
  const [valido, setValido] = useState(false);
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
    cep: '',
    logo: null,
    jogadores: [],
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleCidadesChange =  async(cep:String) => {
    const response=await axios.get(`http://viacep.com.br/ws/${cep}/json/`);
    setFormData({
      ...formData,
      estado: response.data.uf,
      cidade: response.data.localidade,
    });
    
  }

  const limparCamposRelacionadoCEP =()=>{
    if (formData.cep.length < 8) {
      setFormData({
        ...formData,
        estado: '',
        cidade: '',
      });
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleLogoClick = () => {
    if (logoInputRef.current) {
      logoInputRef.current.click();
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        logo: file
      });
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          setLogoPreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

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
  };

  const removePlayer = (index: number) => {
    const updatedPlayers = [...formData.jogadores];
    updatedPlayers.splice(index, 1);
    setFormData({ ...formData, jogadores: updatedPlayers });
  };

  const valdacaoCampos=()=>{
    if (formData.name.trim() === '') {
      setError('Nome do time é obrigatório.');
      return false;
    }
    if (formData.description.trim() === '') {
      setError('Descrição é obrigatória.');
      return false;
    }
    
    if (formData.jogadores.length === 0) {
      setError('Adicione pelo menos um jogador ao time.');
      return false;
    }
    
    setValido(true);
    return true;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (!valdacaoCampos()) {
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
      submitFormData.append('cep', formData.cep);

      if (formData.logo) {
        submitFormData.append('banner', formData.logo);
      }
      const resposta=await axios.post('http://localhost:3001/api/teams/',
        submitFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      handleSubmitPlayer(resposta.data.plainTeam.id);
      setLoading(false);
      setToastMessage('Time criado com sucesso!');
      setToastBg('success');
      setShowToast(true);
    } catch (err: any) {
      setLoading(false);
      const errorMsg = err.response?.data?.message || 'Erro ao criar time. Tente novamente.';
      setError(errorMsg);
      setToastMessage(errorMsg);
      setToastBg('danger');
      setShowToast(true);
    }
  };

  const handleSubmitPlayer = async (id:number) => {
    try {
      const playersData = formData.jogadores.map(jogador => ({
        Playername: jogador.nome,
        PlayerGender: jogador.sexo,
        Playerdatebirth: jogador.datanascimento, // Format as YYYY-MM-DD
        Playerposition: jogador.posicao,
        teamId: id
      }));
       await axios.post(`http://localhost:3001/api/teamplayers/${id}`,
        playersData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        } 
      );
    } catch (err: any) {
      setLoading(false);
      const errorMsg = err.response?.data?.message || 'Erro adicionando jogadores. Tente novamente.'; 
      setError(errorMsg);
      setToastMessage(errorMsg);
      setToastBg('danger');
      setShowToast(true); 
    }
  }
  const bannerStyle = {
    background: `linear-gradient(135deg, ${formData.primaryColor} 0%, ${formData.secondaryColor} 100%)`,
  };

  // Adicionar estados e cidades (exemplo simples)
  const estadosCidades: {[key: string]: string[]} = {
    'MG': ['Belo Horizonte', 'Ouro Preto', 'Uberlândia'],
    'PR': [
      'Cascavel',
      'Colombo',
      'Curitiba',
      'Foz do Iguaçu',
      'Guarapuava',
      'Londrina',
      'Maringá',
      'Paranaguá',
      'Ponta Grossa',
      'São José dos Pinhais',
      'União da Vitória'
    ],
    'RJ': ['Niterói', 'Petrópolis', 'Rio de Janeiro'],
    'SP': ['Campinas', 'Santos', 'São Paulo'],
    // Adicione mais conforme necessário
  };
  const [cidadesDisponiveis, setCidadesDisponiveis] = useState<string[]>([]);

  const handleEstadoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const estado = e.target.value;
    setFormData({ ...formData, estado, cidade: '' });
    setCidadesDisponiveis(estadosCidades[estado] || []);
  };
  const handleCidadeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, cidade: e.target.value });
  };

  // Ordenar estados e cidades alfabeticamente
  const estadosOrdem = Object.keys(estadosCidades).sort();
  const cidadesDisponiveisOrdenadas = [...cidadesDisponiveis].sort();

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
      
      <div className="top-navigation">
        <button 
          onClick={() => navigate('/teams')} 
          className="back-btn"
        >
          <ArrowBackIcon /> Voltar
        </button>
      </div>
      
      <div className="teams-header">
        <h1 className="teams-title">Criar meu time</h1>
        <p className="teams-subtitle">
          Crie seu time personalizado e convide jogadores para participar
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
            <label className="form-label" htmlFor="name">CEP </label>
            <input
              type="text"
              id="cep"
              name="cep"
              className="form-control"
              value={formData.cep}
              onChange={handleInputChange}
              placeholder="Digite o cep"
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
            <input
              type="text"
              id="estado"
              name="estado"
              className="form-control"
              value={formData.estado}
              onChange={handleInputChange}
              placeholder="Digite o estado"
              disabled>
            </input>
          </motion.div>
          <motion.div 
            className="form-group"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label className="form-label" htmlFor="cidade">Cidade</label>
            <input
              type="text"
              id="cidade"
              name="cidade"
              className="form-control"
              value={formData.cidade}
              onChange={handleInputChange}
              placeholder="Digite a cidade"
              disabled></input>
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
                <span className="loading-text">Criando Time</span>
              ) : (
                'Criar meu time'
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}