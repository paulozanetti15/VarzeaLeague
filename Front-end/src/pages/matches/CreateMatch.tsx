import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { IconButton, Typography, TextField, Button, Box, Divider, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { api } from '../../services/api';
import './CreateMatch.css';

interface MatchFormData {
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  maxPlayers: number;
  price: string;
  complement: string;
}

const CreateMatch: React.FC = () => {
  const navigate = useNavigate();
  const titleInputRef = useRef<HTMLInputElement>(null);
  const btnContainerRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<MatchFormData>({
    title: '',
    description: '',
    location: '',
    date: '',
    time: '',
    maxPlayers: 10,
    price: '',
    complement: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Ajustar largura do botão para combinar com o campo de título
  useEffect(() => {
    if (titleInputRef.current && btnContainerRef.current) {
      const titleWidth = titleInputRef.current.offsetWidth;
      btnContainerRef.current.style.width = `${titleWidth}px`;
    }
  }, []);

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
      // Concatena o endereço com o complemento se existir
      const fullLocation = formData.complement 
        ? `${formData.location} - ${formData.complement}`
        : formData.location;

      const response = await api.matches.create({
        title: formData.title,
        date: `${formData.date}T${formData.time}:00`,
        location: fullLocation,
        maxPlayers: formData.maxPlayers,
        description: formData.description,
        price: formData.price ? parseFloat(formData.price) : undefined
      });

      navigate('/matches');
    } catch (err) {
      setError('Erro ao criar partida. Tente novamente.');
      console.error('Erro ao criar partida:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-match-container">
      <button 
        className="back-button"
        onClick={() => navigate(-1)}
      >
        <ArrowBackIcon />
      </button>

      <div className="form-container">
        <h1 className="form-title">
          Criar Nova Partida
        </h1>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{width: '100%'}}>
          <div className="form-group">
            <label className="form-label">Título da Partida</label>
            <input
              ref={titleInputRef}
              type="text"
              className="form-control"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="Ex: Pelada de Domingo"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Descrição</label>
            <textarea
              className="form-control"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="Descreva os detalhes da partida..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Local</label>
            <input
              type="text"
              className="form-control"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
              placeholder="Ex: Quadra do Parque Municipal"
            />
          </div>

          <div className="form-group">
            <label htmlFor="complement">Complemento</label>
            <input
              type="text"
              id="complement"
              name="complement"
              value={formData.complement}
              onChange={handleInputChange}
              placeholder="Ex: Quadra 2, Campo de futebol, etc."
            />
          </div>

          <div className="form-row">
            <div className="form-col">
              <div className="form-group">
                <label className="form-label">Data</label>
                <input
                  type="date"
                  className="form-control"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="form-col">
              <div className="form-group">
                <label className="form-label">Horário</label>
                <input
                  type="time"
                  className="form-control"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-col">
              <div className="form-group">
                <label className="form-label">Máximo de Jogadores</label>
                <input
                  type="number"
                  className="form-control"
                  name="maxPlayers"
                  value={formData.maxPlayers}
                  onChange={handleInputChange}
                  required
                  min="2"
                  max="50"
                />
              </div>
            </div>
            <div className="form-col">
              <div className="form-group">
                <label className="form-label">Preço (opcional)</label>
                <input
                  type="number"
                  className="form-control"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="R$"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          <div className="btn-container" ref={btnContainerRef}>
            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Criando...' : 'Criar Partida'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMatch; 