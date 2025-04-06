import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { IconButton, Typography, TextField, Button, Box, Divider, FormControl, InputLabel, Select, MenuItem, Autocomplete } from '@mui/material';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { api } from '../../services/api';
import './CreateMatch.css';
import { toast } from 'react-hot-toast';

interface MatchFormData {
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  maxPlayers: number;
  price: string;
  complement: string;
  city: string;
}

const cities = [
  // Capitais
  'São Paulo - SP',
  'Rio de Janeiro - RJ',
  'Brasília - DF',
  'Salvador - BA',
  'Fortaleza - CE',
  'Belo Horizonte - MG',
  'Manaus - AM',
  'Curitiba - PR',
  'Recife - PE',
  'Porto Alegre - RS',
  'Belém - PA',
  'Goiânia - GO',
  'Guarulhos - SP',
  'Campinas - SP',
  'São Luís - MA',
  'São Gonçalo - RJ',
  'Maceió - AL',
  'Duque de Caxias - RJ',
  'Natal - RN',
  'Campo Grande - MS',
  'Teresina - PI',
  'São Bernardo do Campo - SP',
  'Nova Iguaçu - RJ',
  'João Pessoa - PB',
  'Santo André - SP',
  'Osasco - SP',
  'Jaboatão dos Guararapes - PE',
  'Ribeirão Preto - SP',
  'Uberlândia - MG',
  'Sorocaba - SP',
  'Contagem - MG',
  'Aracaju - SE',
  'Feira de Santana - BA',
  'Cuiabá - MT',
  'Joinville - SC',
  'Juiz de Fora - MG',
  'Londrina - PR',
  'Aparecida de Goiânia - GO',
  'Ananindeua - PA',
  'Niterói - RJ',
  'Porto Velho - RO',
  'Campos dos Goytacazes - RJ',
  'Belford Roxo - RJ',
  'Serra - ES',
  'Caxias do Sul - RS',
  'Vila Velha - ES',
  'Florianópolis - SC',
  'São José do Rio Preto - SP',
  'Macapá - AP',
  'Mauá - SP',
  'São João de Meriti - RJ',
  'Santos - SP',
  'Mogi das Cruzes - SP',
  'Betim - MG',
  'Diadema - SP',
  'Campina Grande - PB',
  'Jundiaí - SP',
  'Olinda - PE',
  'Carapicuíba - SP',
  'Piracicaba - SP',
  'Montes Claros - MG',
  'Maringá - PR',
  'Cariacica - ES',
  'Barueri - SP',
  'Rio Branco - AC',
  'Anápolis - GO',
  'São Vicente - SP',
  'Vitória - ES',
  'Caucaia - CE',
  'Itaquaquecetuba - SP',
  'Pelotas - RS',
  'Canoas - RS',
  'Caruaru - PE',
  'Vitória da Conquista - BA',
  'Blumenau - SC',
  'Franca - SP',
  'Ponta Grossa - PR',
  'Petrolina - PE',
  'Boa Vista - RR',
  'Paulista - PE',
  'Uberaba - MG',
  'Cascavel - PR',
  'Guarujá - SP',
  'Praia Grande - SP',
  'Taubaté - SP',
  'Petrópolis - RJ',
  'Limeira - SP',
  'Santarém - PA',
  'Palmas - TO',
  // Outras cidades importantes
  'Londrina - PR',
  'Juiz de Fora - MG',
  'Foz do Iguaçu - PR',
  'Bauru - SP',
  'São José dos Campos - SP',
  'Maringá - PR',
  'Presidente Prudente - SP',
  'Araçatuba - SP',
  'Divinópolis - MG',
  'Governador Valadares - MG',
  'Volta Redonda - RJ',
  'Ipatinga - MG',
  'Santa Maria - RS',
  'Rio Grande - RS',
  'Criciúma - SC',
  'Chapecó - SC',
  'Itajaí - SC',
  'Dourados - MS',
  'Imperatriz - MA',
  'Macaé - RJ',
  'Ilhéus - BA',
  'Juazeiro do Norte - CE',
  'Mossoró - RN',
  'Parnaíba - PI',
  'Passo Fundo - RS',
  'Marabá - PA',
  'Araraquara - SP',
  'São Carlos - SP',
  'Rondonópolis - MT',
  'Várzea Grande - MT',
  'Palhoça - SC',
  'São José - SC',
];

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
    complement: '',
    city: ''
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
      // Cria o endereço completo incluindo cidade, local e complemento
      let fullLocation = formData.city;
      
      // Adiciona o endereço específico
      if (formData.location) {
        fullLocation += `, ${formData.location}`;
      }
      
      // Adiciona o complemento se existir
      if (formData.complement) {
        fullLocation += ` - ${formData.complement}`;
      }

      const response = await api.matches.create({
        title: formData.title,
        date: `${formData.date}T${formData.time}:00`,
        location: fullLocation,
        maxPlayers: formData.maxPlayers,
        description: formData.description,
        price: formData.price ? parseFloat(formData.price) : undefined,
        city: formData.city
      });

      toast.success('Partida criada com sucesso!');
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
              rows={2}
              placeholder="Descreva os detalhes da partida..."
            />
          </div>

          <div className="form-row">
            <div className="form-col">
              <div className="form-group">
                <label htmlFor="date">Data *</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                />
              </div>
            </div>
            <div className="form-col">
              <div className="form-group">
                <label htmlFor="time">Horário *</label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="city">Cidade *</label>
            <Autocomplete
              id="city"
              options={cities}
              value={formData.city}
              onChange={(event, newValue) => {
                setFormData(prev => ({
                  ...prev,
                  city: newValue || ''
                }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  required
                  placeholder="Ex: Curitiba - PR, São Paulo - SP"
                  error={!formData.city}
                  helperText={!formData.city ? "Cidade é obrigatória" : ""}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <LocationOnIcon sx={{ color: '#1e3c72', mr: 1 }} />
                    ),
                  }}
                  fullWidth
                />
              )}
              freeSolo
              disableClearable
              sx={{
                width: '100%',
                '& .MuiOutlinedInput-root': {
                  background: 'white',
                  borderRadius: '8px',
                  padding: '4px 8px',
                  border: '1px solid #ccc',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  '&:hover': {
                    border: '1px solid #2196F3',
                    boxShadow: '0 1px 4px rgba(33,150,243,0.2)',
                  },
                  '&.Mui-focused': {
                    border: '1px solid #2196F3',
                    boxShadow: '0 0 0 2px rgba(33,150,243,0.2)',
                  }
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none'
                },
                '& .MuiAutocomplete-endAdornment': {
                  right: '8px'
                }
              }}
              className="form-control"
              ListboxProps={{
                style: { 
                  maxHeight: '200px',
                  padding: '4px 0'
                }
              }}
              slotProps={{
                popper: {
                  sx: {
                    '& .MuiAutocomplete-listbox': {
                      '& .MuiAutocomplete-option': {
                        padding: '8px 16px',
                        borderBottom: '1px solid #f0f0f0',
                        '&:last-child': {
                          borderBottom: 'none'
                        },
                        '&:hover': {
                          backgroundColor: 'rgba(33,150,243,0.1)'
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'rgba(33,150,243,0.2)'
                        }
                      }
                    }
                  }
                }
              }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Endereço *</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
              placeholder="Ex: Rua das Flores, 123"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="complement">Complemento (opcional)</label>
            <input
              type="text"
              id="complement"
              name="complement"
              value={formData.complement}
              onChange={handleInputChange}
              placeholder="Ex: Quadra 2, Campo de futebol, Portão lateral"
              className="form-control"
            />
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