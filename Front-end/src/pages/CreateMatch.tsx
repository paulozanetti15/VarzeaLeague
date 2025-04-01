import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DateTimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GroupsIcon from '@mui/icons-material/Groups';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DescriptionIcon from '@mui/icons-material/Description';
import TitleIcon from '@mui/icons-material/Title';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import './CreateMatch.css';
import { api } from '../services/api';

const CreateMatch: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: new Date(),
    location: '',
    maxPlayers: 10,
    description: '',
    price: '',
  });

  // Animação para a bola de futebol
  const ballVariants = {
    hover: { rotate: 360, scale: 1.2, transition: { duration: 0.8 } },
  };

  // Variantes para animações
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.3,
        duration: 0.5
      }
    },
    exit: {
      opacity: 0,
      y: 20,
      transition: { duration: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const dataToSend = {
        ...formData,
        date: formData.date.toISOString(),
        price: formData.price ? parseFloat(formData.price) : null
      };

      await api.matches.create(dataToSend);
      setSuccess(true);
      
      // Redireciona após alguns segundos
      setTimeout(() => {
        navigate('/matches');
      }, 2000);
    } catch (err: any) {
      console.error('Erro ao criar partida:', err);
      setError(err.message || 'Erro ao criar partida. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Efeito de partículas para o fundo (simulado com divs)
  const renderParticles = () => {
    const particles = [];
    for (let i = 0; i < 20; i++) {
      const style = {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDuration: `${5 + Math.random() * 10}s`,
        animationDelay: `${Math.random() * 5}s`,
      };
      particles.push(
        <div
          key={i}
          className="particle"
          style={style}
        />
      );
    }
    return particles;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <div className="create-match-container">
        {renderParticles()}
        
        <motion.button 
          className="back-btn"
          onClick={() => navigate(-1)}
          aria-label="Voltar"
          whileHover={{ scale: 1.1, rotate: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowBackIcon />
        </motion.button>

        <motion.div 
          className="soccer-ball-container"
          variants={ballVariants}
          whileHover="hover"
        >
          <SportsSoccerIcon sx={{ fontSize: 36, color: '#fff' }} />
        </motion.div>

        <AnimatePresence>
          {success ? (
            <motion.div 
              className="success-message"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <CheckCircleIcon sx={{ fontSize: 60, color: '#4CAF50', marginBottom: 2 }} />
              <h2>Partida criada com sucesso!</h2>
              <p>Redirecionando para a lista de partidas...</p>
            </motion.div>
          ) : (
            <motion.div 
              className="form-container"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.h1 
                className="form-title"
                variants={itemVariants}
              >
                Organizar Nova Partida
              </motion.h1>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="error-message"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit}>
                <motion.div
                  variants={itemVariants}
                  className="form-group"
                >
                  <label className="form-label">
                    <TitleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Título da Partida
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Digite o título da partida"
                    required
                  />
                </motion.div>

                <div className="form-row">
                  <motion.div
                    variants={itemVariants}
                    className="form-group"
                  >
                    <label className="form-label">
                      <EventIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Data e Hora
                    </label>
                    <DateTimePicker
                      value={formData.date}
                      onChange={(newValue) => setFormData({ ...formData, date: newValue || new Date() })}
                      className="date-picker"
                      sx={{
                        width: '100%',
                        '& .MuiInputBase-root': {
                          color: 'white',
                          '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                          },
                        },
                        '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.5)',
                        },
                        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#2196F3',
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255, 255, 255, 0.7)',
                        },
                        '& .MuiSvgIcon-root': {
                          color: 'rgba(255, 255, 255, 0.7)',
                        }
                      }}
                    />
                  </motion.div>

                  <motion.div
                    variants={itemVariants}
                    className="form-group"
                  >
                    <label className="form-label">
                      <LocationOnIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Local
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Digite o local da partida"
                      required
                    />
                  </motion.div>
                </div>

                <div className="form-row">
                  <motion.div
                    variants={itemVariants}
                    className="form-group"
                  >
                    <label className="form-label">
                      <GroupsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Número de Jogadores
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.maxPlayers}
                      onChange={(e) => setFormData({ ...formData, maxPlayers: parseInt(e.target.value) })}
                      placeholder="Digite o número máximo de jogadores"
                      required
                      min="2"
                    />
                  </motion.div>

                  <motion.div
                    variants={itemVariants}
                    className="form-group"
                  >
                    <label className="form-label">
                      <AttachMoneyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Preço por Jogador
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="Digite o preço por jogador (opcional)"
                    />
                  </motion.div>
                </div>

                <motion.div
                  variants={itemVariants}
                  className="form-group"
                >
                  <label className="form-label">
                    <DescriptionIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Descrição
                  </label>
                  <textarea
                    className="form-control"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descreva detalhes adicionais da partida"
                    rows={4}
                  />
                </motion.div>

                <motion.button
                  variants={itemVariants}
                  whileHover={{ scale: 1.03, letterSpacing: "2px" }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? 'Criando...' : 'Criar Partida'}
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </LocalizationProvider>
  );
};

export default CreateMatch; 