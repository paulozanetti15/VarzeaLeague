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
  idademinima: number;
  idademaxima: number;
  sexo: string;
  primaryColor: string;
  secondaryColor: string;
  playerEmails: string[];
  logo?: File | null;
  quantidadejogadores?: number;
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
    idademinima: 0,
    idademaxima: 0,
    sexo: '',
    primaryColor: '#1a237e',
    secondaryColor: '#0d47a1',
    playerEmails: [''],
    quantidadejogadores: 0,
  });
  
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
    if(formData.quantidadejogadores! == 0) {
      setError('Número máximo de jogadores deve ser maior que 0.');
    }else if (formData.playerEmails.length >= formData.quantidadejogadores!) {
      setError('Número máximo de jogadores atingido.');
      return;
    }
    setFormData({
      ...formData,
      playerEmails: [...formData.playerEmails, '']
    });
    setError('');
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
    if (formData.idademinima <= 0) {
      setError('Idade mínima deve ser maior que 0.');
      return false;
    }
    if (formData.idademaxima <= 0) {
      setError('Idade máxima deve ser maior que 0.');
      return false;
    }
    if (formData.sexo === '') {
      setError('Sexo é obrigatório.');
      return false;
    }
    if (formData.quantidadejogadores! <= 0) {
      setError('Número máximo de jogadores deve ser maior que 0.');
      return false;
    }
    if (formData.playerEmails.length > formData.quantidadejogadores!) {
      setError('Número máximo de jogadores atingido.');
      return false;
    }
    
    // Verifica se todos os emails são válidos
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const email of formData.playerEmails) {
      if (email && !emailRegex.test(email)) {
        setError(`Email inválido: ${email}`);
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
      // Remove empty emails
      const submitFormData = new FormData();
      submitFormData.append('name', formData.name);
      submitFormData.append('description', formData.description);
      submitFormData.append('idademinima', formData.idademinima.toString());
      submitFormData.append('idademaxima', formData.idademaxima.toString());
      submitFormData.append('sexo', formData.sexo);
      submitFormData.append('maxPlayers', formData.quantidadejogadores?.toString() || '0');
      submitFormData.append('primaryColor', formData.primaryColor);
      submitFormData.append('secondaryColor', formData.secondaryColor);
      
      // Append emails
      formData.playerEmails.forEach((email, index) => {
        if (email.trim() !== '') {
          submitFormData.append(`playerEmails[${index}]`, email);
        }
      });
      
      // Append file if exists
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
      // Show success toast
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
              placeholder="Adicione uma descrição para seu time"
              required
            />
          </motion.div>
          <motion.div 
            className="form-group"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <label className="form-label" htmlFor="idademinima">Idade minima</label>
            <input
              type="number"
              id="idademinima"
              name="idademinima"
              className="form-control"
              value={formData.idademinima}
              onChange={handleInputChange}
              placeholder="Adicione uma descrição para seu time"
              required
            />
          </motion.div>
          <motion.div 
            className="form-group"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label className="form-label" htmlFor="idademaxima">Idade maxima</label>
            <input
              type="number"
              id="idademaxima"
              name="idademaxima"
              className="form-control"
              value={formData.idademaxima}
              onChange={handleInputChange}
              placeholder="Adicione uma descrição para seu time"
              required
            />
          </motion.div>
          <motion.div 
            className="form-group"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label className="form-label" htmlFor="sexo">Sexo permitido para inscrição</label>
            <select
              id="sexo"
              name="sexo"
              className="form-control"
              value={formData.sexo}
              onChange={handleInputChange}
              required
            >
              <option value="">Selecione uma opção</option>
              <option value="masculino">Masculino</option>
              <option value="feminino">Feminino</option>
              <option value="ambos">Ambos</option>
            </select>
          </motion.div>
          <motion.div 
            className="form-group"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <label className="form-label" htmlFor="idademinima">Quantidade jogadores permitido</label>
            <input
              type="number"
              id="qtdjogadores"
              name="quantidadejogadores"
              className="form-control"
              value={formData.quantidadejogadores}
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
            <label className="form-label">Convidar Jogadores - 0 {formData.playerEmails.length} / { formData.quantidadejogadores ?? 0} jogadores</label>
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