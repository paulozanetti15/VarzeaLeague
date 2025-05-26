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
import toast from 'react-hot-toast';

interface PlayerData {
  Playername: string;
  PlayerGender: string;
  Playerdatebirth: string;
  Playerposition: string;
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
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<TeamFormData>({
    name: '',
    description: '',
    primaryColor: '#1a237e',
    secondaryColor: '#0d47a1',
    estado: '',
    cidade: '',
    cep: '',
    logo: null,
    jogadores: [{ Playername: '', PlayerGender: '', Playerdatebirth:'', Playerposition: '' }],
  });
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
         const responsePlayer = await axios.get(`http://localhost:3001/api/teamplayers/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(responsePlayer.data);
        const teamData = response.data;
        const teamPlayerData = responsePlayer.data;
        
        setFormData({
          name: teamData.name || '',
          description: teamData.description || '',
          primaryColor: teamData.primaryColor || '#1a237e',
          secondaryColor: teamData.secondaryColor || '#0d47a1',
          estado: teamData.estado || '',
          cidade: teamData.cidade || '',
          cep: teamData.cep || '',
          logo: null,
          jogadores:teamPlayerData
        });
        if (teamData.banner) {
          setLogoPreview(`http://localhost:3001${teamData.banner}`);
        }
      } catch (err: any) {
        setError('Erro ao carregar o time.');
      }
    };
    fetchTeam();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleCidadesChange =  async(cep:String) => {
    const response=await axios.get(`http://viacep.com.br/ws/${cep}/json/`);
    setFormData({
      ...formData,
      estado: response.data.uf,
      cidade: response.data.localidade,
    });
  }
  useEffect(() => {
     if (/^[0-9]{8}$/.test(formData.cep) || /^[0-9]{5}-?[0-9]{3}$/.test(formData.cep)) {
      handleCidadesChange(formData.cep.replace('-', ''));
     } else{
      setFormData({
        ...formData,
        estado: '',
        cidade: '',
      });
     }    
  },[formData.cep]);
    
  const handlePlayerChange = (index: number, field: keyof PlayerData, value: string) => {
    const updated = [...formData.jogadores];
    if (!updated[index]) {
      updated[index] = { Playername: '', PlayerGender: '', Playerdatebirth:'', Playerposition: '' };
    }
    
    updated[index][field] = value;
    setFormData({ ...formData, jogadores: updated });
  };

  const addPlayer = () => {
    setFormData({
      ...formData,
      jogadores: [...formData.jogadores, { Playername: '', PlayerGender: '', Playerdatebirth:'', Playerposition: '' }],
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
      if (!jogador.Playername.trim()) {
        setError('Nome do jogador é obrigatório.');
        return false;
      }
      if (!jogador.PlayerGender) {
        setError('Sexo do jogador é obrigatório.');
        return false;
      }
      
      if (!jogador.Playerdatebirth) {
        setError('Data nascimento do jogador é obrigatória e deve ser um número entre 0 e 120.');
        return false;
      }
      if (!jogador.Playerposition) {
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
      // Execute both API calls in parallel instead of sequentially
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

      // Fix date format for players before sending
      const playersWithFixedDates = formData.jogadores.map(jogador => ({
        ...jogador,
        Playerdatebirth: jogador.Playerdatebirth ? 
          new Date(jogador.Playerdatebirth).toISOString().split('T')[0] : 
          jogador.Playerdatebirth
      }));
      const teamResponse= await axios.put(`http://localhost:3001/api/teams/${id}`, submitFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
      });
       
      if (teamResponse.data.banner) {
        setLogoPreview(`http://localhost:3001${teamResponse.data.banner}`);
      }
      if(teamResponse.status === 200){
        axios.put(`http://localhost:3001/api/teamplayers/${id}`, playersWithFixedDates, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })
      }
      toast.success('Time atualizado com sucesso!');
      setLoading(false);
      
    } catch (err: any) {
      setLoading(true);
      console.error('Erro ao atualizar time:', err);
      
      // Better error handling
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(`Erro de conexão: ${err.message}`);
      } else {
        setError('Erro ao atualizar time. Tente novamente.');
      }
      
      // Better error handling
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(`Erro de conexão: ${err.message}`);
      } else {
        setError('Erro ao atualizar time. Tente novamente.');
      }
    }
  };
  const bannerStyle = {
    background: `linear-gradient(135deg, ${formData.primaryColor} 0%, ${formData.secondaryColor} 100%)`,
  };

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
            <label className="form-label" htmlFor="estado">cep</label>
            <input
              id="cep"
              name="cep"
              className="form-control"
              value={formData.cep}
              onChange={handleInputChange}
              placeholder="Digite o CEP do time"
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
                    value={jogador.Playername}
                    onChange={e => handlePlayerChange(index, 'Playername', e.target.value)}
                    className="form-control nome-jogador"
                    required
                  />
                  <select
                    value={jogador.PlayerGender}
                    onChange={e => handlePlayerChange(index, 'PlayerGender', e.target.value)}
                    className="form-control nome-jogador"
                    required
                  >
                    <option value="">Sexo</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                  </select>
                  <input
                    type="date"
                    placeholder="Data de Nascimento"
                    value={jogador.Playerdatebirth ? jogador.Playerdatebirth.slice(0, 10) : ''} // Format date to YYYY-MM-DD
                    onChange={e => handlePlayerChange(index, 'Playerdatebirth', e.target.value)}
                    className="form-control nome-jogador"
                    required
                  />
                  <select
                    value={jogador.Playerposition}  
                    onChange={e => handlePlayerChange(index, 'Playerposition', e.target.value)}
                    className="form-control nome-jogador"
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