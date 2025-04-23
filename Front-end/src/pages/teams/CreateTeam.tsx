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

interface TeamFormData {
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  playerEmails: string[];
  logo?: File | null;
}

export default function CreateTeam() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastBg, setToastBg] = useState('');
  
  const [formData, setFormData] = useState<TeamFormData>({
    name: '',
    description: '',
    primaryColor: '#1a237e',
    secondaryColor: '#0d47a1',
    playerEmails: ['']
  });
  
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePlayerEmailChange = (index: number, value: string) => {
    const updatedEmails = [...formData.playerEmails];
    updatedEmails[index] = value;
    setFormData({
      ...formData,
      playerEmails: updatedEmails
    });
  };

  const addPlayerEmail = () => {
    setFormData({
      ...formData,
      playerEmails: [...formData.playerEmails, '']
    });
  };

  const removePlayerEmail = (index: number) => {
    if (formData.playerEmails.length > 1) {
      const updatedEmails = [...formData.playerEmails];
      updatedEmails.splice(index, 1);
      setFormData({
        ...formData,
        playerEmails: updatedEmails
      });
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
    const file = e.target.files?.[0];
    if (file) {
      // Preview the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Update form data
      setFormData({
        ...formData,
        logo: file
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Remove empty emails
      const filteredEmails = formData.playerEmails.filter(email => email.trim() !== '');
      
      // Create FormData object to send file
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('primaryColor', formData.primaryColor);
      formDataToSend.append('secondaryColor', formData.secondaryColor);
      
      // Add each email
      filteredEmails.forEach(email => {
        formDataToSend.append('playerEmails', email);
      });
      
      // Add logo if exists
      if (formData.logo) {
        formDataToSend.append('logo', formData.logo);
      }

      const response = await axios.post('http://localhost:3001/teams', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true
      });

      setLoading(false);
      // Show success toast
      setToastMessage('Time criado com sucesso!');
      setToastBg('success');
      setShowToast(true);
      
      // Navigate after a brief delay
      setTimeout(() => {
        navigate('/teams');
      }, 1500);
    } catch (err: any) {
      setLoading(false);
      const errorMsg = err.response?.data?.message || 'Erro ao criar time. Tente novamente.';
      setError(errorMsg);
      
      // Show error toast
      setToastMessage(errorMsg);
      setToastBg('danger');
      setShowToast(true);
    }
  };
  
  // Generate banner style based on selected colors
  const bannerStyle = {
    background: `linear-gradient(135deg, ${formData.primaryColor} 0%, ${formData.secondaryColor} 100%)`,
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
              accept="image/*"
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
              placeholder="Adicione uma descrição para seu time"
              required
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
            <label className="form-label">Convidar Jogadores</label>
            <p className="player-email-help">
              Adicione os emails dos jogadores que deseja convidar para seu time.
            </p>
            
            <div className="player-emails">
              <AnimatePresence>
                {formData.playerEmails.map((email, index) => (
                  <motion.div 
                    key={index} 
                    className="player-email"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <input
                      type="email"
                      placeholder="Email do jogador"
                      value={email}
                      onChange={(e) => handlePlayerEmailChange(index, e.target.value)}
                    />
                    <button 
                      type="button" 
                      className="remove-player-btn"
                      onClick={() => removePlayerEmail(index)}
                    >
                      <RemoveIcon />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            <button 
              type="button" 
              className="add-player-btn"
              onClick={addPlayerEmail}
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