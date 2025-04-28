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

export default function EditTeam() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
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
  const [cidadesDisponiveis, setCidadesDisponiveis] = useState<string[]>([]);
  const estadosCidades = {
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
        const teamData = response.data;
        setFormData({
          name: teamData.name || '',
          description: teamData.description || '',
          primaryColor: teamData.primaryColor || '#1a237e',
          secondaryColor: teamData.secondaryColor || '#0d47a1',
          estado: teamData.estado || '',
          cidade: teamData.cidade || '',
          logo: null,
          jogadores: Array.isArray(teamData.jogadores) && teamData.jogadores.length > 0
            ? teamData.jogadores
            : [{ nome: '', sexo: '', idade: '', posicao: '' }],
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
    return true;
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
      
      console.log('Enviando dados para atualização:', {
        name: formData.name,
        description: formData.description,
        logo: formData.logo ? 'Nova imagem selecionada' : 'Nenhuma nova imagem'
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
      
      setLoading(false);
      setTimeout(() => {
        navigate('/teams');
      }, 1200);
    } catch (err: any) {
      setLoading(false);
      console.error('Erro ao atualizar time:', err);
      const errorMsg = err.response?.data?.message || 'Erro ao atualizar time. Tente novamente.';
      setError(errorMsg);
    }
  };

  const bannerStyle = {
    background: `linear-gradient(135deg, ${formData.primaryColor} 0%, ${formData.secondaryColor} 100%)`,
  };

  const cidadesDisponiveisOrdenadas = [...cidadesDisponiveis].sort();

  return (
    <div className="create-team-container">
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
          <div className="delete-modal" style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: '2.5rem',
            width: '100%',
            background: 'rgba(0,0,0,0.18)',
            zIndex: 99,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="delete-modal-content"
              style={{
                background: 'rgba(20, 20, 40, 0.98)',
                borderRadius: 18,
                padding: '2.5rem 2rem 2rem 2rem',
                boxShadow: '0 8px 32px rgba(220,53,69,0.18)',
                minWidth: 340,
                maxWidth: 420,
                textAlign: 'center',
                color: '#fff',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div className="warning-icon-container" style={{ marginBottom: 16 }}>
                <WarningIcon className="large-warning-icon" style={{ fontSize: 48, color: '#dc3545' }} />
              </div>
              <h2 style={{ color: '#dc3545', fontWeight: 800, fontSize: '2rem', marginBottom: 8 }}>Confirmar exclusão de time</h2>
              <p style={{ color: '#fff', fontSize: '1.1rem', marginBottom: 8 }}>
                Tem certeza que deseja excluir o time <strong style={{ color: '#ffc107' }}>{formData.name}</strong>?
              </p>
              <p className="warning-text" style={{ color: '#fff', opacity: 0.7, marginBottom: 24 }}>Esta ação não pode ser desfeita!</p>
              <div className="delete-modal-actions" style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16 }}>
                <button 
                  className="confirm-delete-btn"
                  style={{
                    background: 'linear-gradient(90deg, #dc3545 60%, #ff6f61 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 30,
                    padding: '0.8rem 2.2rem',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    boxShadow: '0 4px 15px rgba(220, 53, 69, 0.18)',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const token = localStorage.getItem('token');
                      if (!token) {
                        navigate('/login');
                        return;
                      }
                      await axios({
                        method: 'delete',
                        url: `http://localhost:3001/api/teams/${id}`,
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json'
                        },
                        data: { confirm: true }
                      });
                      navigate('/teams');
                    } catch (err) {
                      setError('Erro ao deletar time.');
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  Sim, excluir time
                </button>
                <button 
                  className="cancel-delete-btn"
                  style={{
                    background: 'linear-gradient(90deg, #444 60%, #666 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 30,
                    padding: '0.8rem 2.2rem',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
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