import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './CreateTeam.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PaletteIcon from '@mui/icons-material/Palette';
import ImageIcon from '@mui/icons-material/Image';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ToastComponent from '../../components/Toast/ToastComponent';

interface PlayerData {
  nome: string;
  sexo: string;
  idade: string;
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

export default function CreateTeam() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastBg, setToastBg] = useState('');
  const [valido, setValido] = useState(false);

  const [formData, setFormData] = useState<TeamFormData>({
    name: '',
    description: '',
    primaryColor: '#1a237e',
    secondaryColor: '#0d47a1',
    estado: '',
    cidade: '',
    logo: null,
    jogadores: [{ nome: '', sexo: '', idade: '', posicao: '' }],
  });
  
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePlayerChange = (index: number, field: keyof PlayerData, value: string) => {
    const updated = [...formData.jogadores];
    updated[index][field] = value;
    setFormData({ ...formData, jogadores: updated });
  };

  const addPlayer = () => {
    setFormData({
      ...formData,
      jogadores: [...formData.jogadores, { nome: '', sexo: '', idade: '', posicao: '' }],
    });
  };

  const removePlayer = (index: number) => {
    if (formData.jogadores.length > 1) {
      const updated = [...formData.jogadores];
      updated.splice(index, 1);
      setFormData({ ...formData, jogadores: updated });
    }
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
      
      // Armazenar o arquivo real, não apenas o nome
      setFormData({
        ...formData,
        logo: file
      });
      
      // Criar URL para preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          setLogoPreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
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
    for (const jogador of formData.jogadores) {
      if (!jogador.nome.trim()) {
        setError('Nome do jogador é obrigatório.');
        return false;
      }
      if (!jogador.sexo) {
        setError('Sexo do jogador é obrigatório.');
        return false;
      }
      if (!jogador.idade || isNaN(Number(jogador.idade))) {
        setError('Idade do jogador é obrigatória e deve ser um número.');
        return false;
      }
      if (!jogador.posicao) {
        setError('Posição do jogador é obrigatória.');
        return false;
      }
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
      submitFormData.append('jogadores', JSON.stringify(formData.jogadores));
      if (formData.logo) {
        submitFormData.append('banner', formData.logo);
      }
      await axios.post('http://localhost:3001/api/teams/',
        submitFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setLoading(false);
      setToastMessage('Time criado com sucesso!');
      setToastBg('success');
      setShowToast(true);
      setTimeout(() => {
        navigate('/teams');
      }, 1500);
    } catch (err: any) {
      setLoading(false);
      const errorMsg = err.response?.data?.message || 'Erro ao criar time. Tente novamente.';
      setError(errorMsg);
      setToastMessage(errorMsg);
      setToastBg('danger');
      setShowToast(true);
    }
  };
  
  // Generate banner style based on selected colors
  const bannerStyle = {
    background: `linear-gradient(135deg, ${formData.primaryColor} 0%, ${formData.secondaryColor} 100%)`,
  };

  // Adicionar estados e cidades (exemplo simples)
  const estadosCidades = {
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
            <label className="form-label" htmlFor="estado">Estado</label>
            <select
              id="estado"
              name="estado"
              className="form-control"
              value={formData.estado}
              onChange={handleEstadoChange}
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
              onChange={handleCidadeChange}
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
            <label className="form-label">Gerenciar Jogadores ({formData.jogadores.length})</label>
            <AnimatePresence>
              {formData.jogadores.map((jogador, index) => (
                <motion.div 
                  key={index} 
                  className="player-email"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <input
                    type="text"
                    placeholder="Nome do jogador"
                    value={jogador.nome}
                    onChange={e => handlePlayerChange(index, 'nome', e.target.value)}
                    className="form-control nome-jogador"
                    required
                  />
                  <select
                    value={jogador.sexo}
                    onChange={e => handlePlayerChange(index, 'sexo', e.target.value)}
                    className="form-control"
                    required
                  >
                    <option value="">Sexo</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Idade"
                    value={jogador.idade}
                    onChange={e => handlePlayerChange(index, 'idade', e.target.value)}
                    className="form-control"
                    required
                  />
                  <select
                    value={jogador.posicao}
                    onChange={e => handlePlayerChange(index, 'posicao', e.target.value)}
                    className="form-control"
                    required
                  >
                    <option value="">Posição</option>
                    <option value="Goleiro">Goleiro</option>
                    <option value="Defensor">Defensor</option>
                    <option value="Meio Campo">Meio Campo</option>
                    <option value="Atacante">Atacante</option>
                  </select>
                  <button 
                    type="button" 
                    className="remove-player-btn"
                    onClick={() => removePlayer(index)}
                  >
                    <RemoveIcon />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            <button 
              type="button" 
              className="add-player-btn"
              onClick={addPlayer}
            >
              <AddIcon style={{ marginRight: '5px' }} /> Adicionar Jogador
            </button>
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