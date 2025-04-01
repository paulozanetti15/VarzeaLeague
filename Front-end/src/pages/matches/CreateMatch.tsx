import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { IconButton, Container, Paper, Typography, TextField, Button, Box, Divider, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import './CreateMatch.css';

interface MatchFormData {
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  maxPlayers: number;
  teamId: string;
}

const CreateMatch: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<MatchFormData>({
    title: '',
    description: '',
    location: '',
    date: '',
    time: '',
    maxPlayers: 10,
    teamId: ''
  });
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    const fetchTeams = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:3001/api/teams', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setTeams(response.data);
      } catch (err) {
        console.error('Erro ao buscar times:', err);
      }
    };

    fetchTeams();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.post('http://localhost:3001/api/matches', formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      navigate('/matches');
    } catch (err) {
      console.error('Erro ao criar partida:', err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Erro ao criar partida');
      } else {
        setError('Erro ao criar partida. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-match-container">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'absolute',
          left: 32,
          top: 32,
        }}
      >
        <IconButton
          onClick={() => navigate(-1)}
          className="back-button"
        >
          <ArrowBackIcon />
        </IconButton>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper className="form-container">
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <SportsSoccerIcon sx={{ fontSize: 60, color: '#2196F3', mb: 2 }} />
            </motion.div>
            <Typography variant="h4" component="h1" className="form-title">
              Criar Nova Partida
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Organize uma partida e convide seus amigos!
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EmojiEventsIcon sx={{ mr: 1, color: '#2196F3' }} />
                <Typography variant="h6">Informações da Partida</Typography>
              </Box>
              <TextField
                fullWidth
                label="Título da Partida"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: <SportsSoccerIcon sx={{ mr: 1, color: '#2196F3' }} />
                }}
              />

              <TextField
                fullWidth
                label="Descrição"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={4}
                sx={{ mb: 3 }}
                placeholder="Descreva os detalhes da partida, regras especiais..."
              />

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Time</InputLabel>
                <Select
                  name="teamId"
                  value={formData.teamId}
                  onChange={handleSelectChange}
                  required
                  label="Time"
                  startAdornment={<GroupIcon sx={{ mr: 1, color: '#2196F3' }} />}
                >
                  {teams.map((team) => (
                    <MenuItem key={team.id} value={team.id}>
                      {team.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocationOnIcon sx={{ mr: 1, color: '#2196F3' }} />
                <Typography variant="h6">Local e Data</Typography>
              </Box>
              <TextField
                fullWidth
                label="Local"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: <LocationOnIcon sx={{ mr: 1, color: '#2196F3' }} />
                }}
              />

              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField
                  fullWidth
                  label="Data"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  label="Horário"
                  name="time"
                  type="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Box>

              <TextField
                fullWidth
                label="Número Máximo de Jogadores"
                name="maxPlayers"
                type="number"
                value={formData.maxPlayers}
                onChange={handleInputChange}
                required
                InputProps={{
                  startAdornment: <GroupIcon sx={{ mr: 1, color: '#2196F3' }} />
                }}
              />
            </Box>

            {error && (
              <Typography color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              className="submit-btn"
              startIcon={<SportsSoccerIcon />}
            >
              {loading ? 'Criando...' : 'Criar Partida'}
            </Button>
          </form>
        </Paper>
      </motion.div>
    </div>
  );
};

export default CreateMatch; 