import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateMatch.css';
import RegrasFormRegisterModal from '../../components/Modals/Regras/RegrasFormRegisterModal';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import ToastComponent from '../../components/Toast/ToastComponent';
import { format, parse, isValid, isAfter } from 'date-fns';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

interface MatchFormData {
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  duration: string;
  price: string;
  complement: string;
  cep: string;
  UF: string;
  city: string;
  category: string;
  number: string;
  quadra: string;
  modalidade: string;
}

const CreateMatch: React.FC = () => {
  const navigate = useNavigate();
  const titleInputRef = useRef<HTMLInputElement>(null);
  const btnContainerRef = useRef<HTMLDivElement>(null);
  const hiddenDateInputRef = useRef<HTMLInputElement>(null);
  const [showInfoAthleteModal, setShowInfoAthleteModal] = useState(false);
  const [usuario, setUsuario] = useState<any>(null);
  const [dadosPartida, setDadosPartida] = useState<any>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastBg, setToastBg] = useState('');
  const [cepErrorMessage, setCepErrorMessage] = useState<string | null>(null);
  const [enderecoCompleto, setEnderecoCompleto] = useState('');
  
  const [formData, setFormData] = useState<MatchFormData>({
    title: '',
    description: '',
    location: '',
    number: '',
    date: '',
    time: '',
    duration: '',
    price: '',
    complement: '',
    city: '',
    cep: '',
    category: '',
    UF: '',
    modalidade: '',
    quadra: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{[k:string]: string}>({});

  const formatarCep = (cep: string): string => {
    cep = cep.replace(/\D/g, '');
    if (cep.length > 8) cep = cep.slice(0, 8);
    if (cep.length > 5) {
      return `${cep.slice(0, 5)}-${cep.slice(5)}`;
    }
    return cep;
  };

  const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    setFormData(prev => ({
      ...prev,
      modalidade: value
    }));
  };

  const buscarCep = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;

    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = response.data;

      if (data.erro) {
        setCepErrorMessage('CEP não encontrado');
        return;
      }

      setFormData(prev => ({
        ...prev,
        UF: data.uf,
        city: data.localidade,
        location: data.logradouro
      }));

      const endereco = `${data.logradouro}, ${data.localidade} - ${data.uf}`;
      setEnderecoCompleto(endereco);
      setCepErrorMessage(null);
    } catch (error) {
      setCepErrorMessage('Erro ao buscar CEP');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'cep') {
      const cepFormatado = formatarCep(value);
      setFormData(prev => ({ ...prev, [name]: cepFormatado }));
      
      if (cepFormatado.length === 9) {
        buscarCep(cepFormatado);
      } else {
        setCepErrorMessage(null);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors: {[k: string]: string} = {};
    
    if (!formData.title.trim()) errors.title = 'Título é obrigatório';
    if (!formData.date.trim()) errors.date = 'Data é obrigatória';
    if (!formData.time.trim()) errors.time = 'Horário é obrigatório';
    if (!formData.duration.trim()) errors.duration = 'Duração é obrigatória';
    if (!formData.price.trim()) errors.price = 'Preço é obrigatório';
    if (!formData.modalidade.trim()) errors.modalidade = 'Modalidade é obrigatória';
    if (!formData.quadra.trim()) errors.quadra = 'Nome da quadra é obrigatório';
    if (!formData.cep.trim()) errors.cep = 'CEP é obrigatório';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Por favor, corrija os erros no formulário');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const matchData = {
        ...formData,
        date: formatDateISOToBR(formData.date),
        organizerId: usuario?.id
      };

      const response = await axios.post('http://localhost:3001/api/matches', matchData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 201) {
        setDadosPartida(response.data);
        setShowInfoAthleteModal(true);
        setToastMessage('Partida criada com sucesso!');
        setToastBg('success');
        setShowToast(true);
      }
    } catch (error: any) {
      console.error('Erro ao criar partida:', error);
      setError(error.response?.data?.message || 'Erro ao criar partida');
    } finally {
      setLoading(false);
    }
  };

  const formatDateISOToBR = (isoDate: string): string => {
    try {
      const date = new Date(isoDate);
      return format(date, 'dd/MM/yyyy');
    } catch {
      return isoDate;
    }
  };

  const handleOpenDatePicker = () => {
    const el = hiddenDateInputRef.current;
    if (!el) return;
    
    if (typeof el.showPicker === 'function') {
      el.showPicker();
    } else {
      el.click();
    }
  };

  const handleHiddenDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const iso = e.target.value;
    const br = formatDateISOToBR(iso);
    setFormData(prev => ({ ...prev, date: br }));
  };

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setUsuario(JSON.parse(user));
    }
  }, []);

  return (
    <div className="create-match-bg">
      {showToast && (
        <ToastComponent
          message={toastMessage}
          bg={toastBg}
          onClose={() => setShowToast(false)}
        />
      )}
      
      <div className="create-match-container">
        <div className="create-match-header">
          <div className="create-match-icon">
            ⚽
          </div>
          <h1 className="create-match-title">Criar Nova Partida</h1>
          <p className="create-match-subtitle">Organize sua partida e convide outros times</p>
        </div>

        <div className="form-main-grid">
          {/* Seção lateral com ícone */}
          <div className="logo-section">
            <div className="logo-preview-container">
              <span>⚽</span>
              <span>Tipo de Partida</span>
            </div>
            
            <div className="logo-description">
              <h3>Informações da Partida</h3>
              <p>Configure os detalhes da sua partida de futebol</p>
            </div>
          </div>

          {/* Seção de formulário */}
          <div className="form-section">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="create-match-form">
              {/* Campos básicos em grid 2 colunas */}
              <div className="form-basic-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="title">Título da Partida</label>
                  <input
                    ref={titleInputRef}
                    type="text"
                    id="title"
                    name="title"
                    className="form-control"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Digite o título da partida"
                    required
                    style={fieldErrors.title ? { borderColor: '#e53935' } : undefined}
                  />
                  {fieldErrors.title && <span className="field-error">{fieldErrors.title}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="modalidade">Modalidade</label>
                  <select
                    id="modalidade"
                    name="modalidade"
                    className="form-control"
                    value={formData.modalidade}
                    onChange={handleSelect}
                    required
                    style={fieldErrors.modalidade ? { borderColor: '#e53935' } : undefined}
                  >
                    <option value="">Selecione a modalidade</option>
                    <option value="Fut7">Fut7</option>
                    <option value="Futsal">Futsal</option>
                    <option value="Futebol campo">Futebol campo</option>
                  </select>
                  {fieldErrors.modalidade && <span className="field-error">{fieldErrors.modalidade}</span>}
                </div>
              </div>

              {/* Campos de data em grid 2 colunas */}
              <div className="form-basic-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="date">Data</label>
                  <div className="date-input-container">
                    <input
                      type="text"
                      id="date"
                      name="date"
                      className="form-control date-input"
                      value={formData.date}
                      onChange={handleInputChange}
                      placeholder="Selecione a data"
                      required
                      maxLength={10}
                      onFocus={handleOpenDatePicker}
                      style={fieldErrors.date ? { borderColor: '#e53935' } : undefined}
                    />
                    <input
                      ref={hiddenDateInputRef}
                      type="date"
                      onChange={handleHiddenDateChange}
                      style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
                      aria-hidden="true"
                      tabIndex={-1}
                    />
                    <CalendarMonthIcon className="date-icon" onClick={handleOpenDatePicker} />
                  </div>
                  {fieldErrors.date && <span className="field-error">{fieldErrors.date}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="time">Horário</label>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    className="form-control"
                    value={formData.time}
                    onChange={handleInputChange}
                    required
                    style={fieldErrors.time ? { borderColor: '#e53935' } : undefined}
                  />
                  {fieldErrors.time && <span className="field-error">{fieldErrors.time}</span>}
                </div>
              </div>

              {/* Campos de configuração em grid 2 colunas */}
              <div className="form-basic-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="duration">Duração (min)</label>
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    className="form-control"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="90"
                    min="30"
                    max="180"
                    required
                    style={fieldErrors.duration ? { borderColor: '#e53935' } : undefined}
                  />
                  {fieldErrors.duration && <span className="field-error">{fieldErrors.duration}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="quadra">Nome da Quadra</label>
                  <input
                    type="text"
                    id="quadra"
                    name="quadra"
                    className="form-control"
                    value={formData.quadra}
                    onChange={handleInputChange}
                    placeholder="Nome da quadra/campo"
                    required
                    style={fieldErrors.quadra ? { borderColor: '#e53935' } : undefined}
                  />
                  {fieldErrors.quadra && <span className="field-error">{fieldErrors.quadra}</span>}
                </div>
              </div>

              {/* Campos de preço e localização em grid 2 colunas */}
              <div className="form-basic-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="price">Preço por Jogador (R$)</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    className="form-control"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0,00"
                    min="0"
                    step="0.01"
                    required
                    style={fieldErrors.price ? { borderColor: '#e53935' } : undefined}
                  />
                  {fieldErrors.price && <span className="field-error">{fieldErrors.price}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="cep">CEP</label>
                  <input
                    type="text"
                    id="cep"
                    name="cep"
                    pattern='[0-9]{5}-?[0-9]{3}'
                    maxLength={9}
                    value={formData.cep}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="00000-000"
                    required
                    style={fieldErrors.cep ? { borderColor: '#e53935' } : undefined}
                  />
                  {fieldErrors.cep && <span className="field-error">{fieldErrors.cep}</span>}
                  {cepErrorMessage && (
                    <div className="error-message">
                      {cepErrorMessage}
                    </div>
                  )}
                </div>
              </div>

              {/* Campo de descrição */}
              <div className="form-group">
                <label className="form-label" htmlFor="description">Descrição</label>
                <textarea
                  id="description"
                  name="description"
                  className="form-control"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Descreva os detalhes da partida, regras especiais, nível de competição, etc..."
                  rows={4}
                />
              </div>

              <div className="btn-container">
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="loading-text">Criando...</span>
                  ) : (
                    'Criar Partida'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {usuario && (
        <RegrasFormRegisterModal
          userId={usuario.id}
          show={showInfoAthleteModal}
          partidaDados={dadosPartida}
          onHide={() => setShowInfoAthleteModal(false)}
        />
      )}
    </div>
  );
};

export default CreateMatch;