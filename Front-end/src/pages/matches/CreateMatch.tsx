import React, { useState, useRef, useEffect } from 'react';
import { format, parse } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import './CreateMatch.css';
import RegrasFormRegisterModal from '../../components/Modals/Rules/RegrasFormRegisterModal';
import ToastComponent from '../../components/Toast/ToastComponent';
import { createMatch, searchCEP } from '../../services/matchesFriendlyServices';
import {
  BasicFields,
  DateTimeFields,
  ConfigFields,
  PriceLocationFields
} from '../../features/matches/CreateMatch';
import { CalendarMonth } from '@mui/icons-material';
import { openDatePicker } from '../../utils/formUtils';

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
  const [pendingMatchData, setPendingMatchData] = useState<any>(null);

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
      const data = await searchCEP(cepLimpo);

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

    setError('');

    // Preparar dados da partida e abrir modal de regras antes de criar no backend.
    try {
      // Converter duração de HH:MM para minutos
      const durationInMinutes = formData.duration ? convertHHMMToMinutes(formData.duration) : 90;

      const matchDataToCreate = {
        title: formData.title,
        description: formData.description,
        location: formData.location || formData.location,
        date: formatBRToISO(formData.date),
        time: formData.time || '00:00',
        duration: durationInMinutes,
        price: formData.price || '0',
        modalidade: formData.modalidade,
        quadraNome: formData.quadra,
        userId: usuario?.id
      };

      setPendingMatchData(matchDataToCreate);
      setShowInfoAthleteModal(true);
    } catch (err) {
      setError('Erro ao preparar dados da partida');
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

  const formatBRToISO = (brDate: string): string => {
    try {
      const parsed = parse(brDate, 'dd/MM/yyyy', new Date());
      return format(parsed, 'yyyy-MM-dd');
    } catch {
      return brDate;
    }
  };

  const convertHHMMToMinutes = (hhmm: string): number => {
    if (!hhmm || !hhmm.includes(':')) return 90;
    const [hours, minutes] = hhmm.split(':').map(Number);
    return (hours * 60) + minutes;
  };

  const handleOpenDatePicker = () => {
    openDatePicker(hiddenDateInputRef, formData.date);
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
          <h1 className="create-match-title" style={{ color: '#000000' }}>Criar Nova Partida</h1>
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
                  <label className="form-label" htmlFor="title">
                    Título da Partida
                    <span style={{
                      color: '#dc3545',
                      fontSize: '1.2em',
                      fontWeight: 'bold',
                      marginLeft: '0.25rem'
                    }}>*</span>
                  </label>
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
                  <label className="form-label" htmlFor="modalidade">
                    Modalidade
                    <span style={{
                      color: '#dc3545',
                      fontSize: '1.2em',
                      fontWeight: 'bold',
                      marginLeft: '0.25rem'
                    }}>*</span>
                  </label>
                  <select
                    id="modalidade"
                    name="modalidade"
                    className="form-control modalidade-select"
                    value={formData.modalidade}
                    onChange={handleSelect}
                    required
                    style={{
                      width: '100%',
                      padding: '1.2rem 1.5rem',
                      border: '2px solid #e2e8f0',
                      borderRadius: '15px',
                      background: '#ffffff',
                      color: '#2d3748',
                      fontSize: '1rem',
                      fontWeight: '500',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
                      cursor: 'pointer',
                      backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3e%3c/svg%3e")',
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem',
                      WebkitAppearance: 'none',
                      MozAppearance: 'none',
                      appearance: 'none',
                      ...(fieldErrors.modalidade ? { borderColor: '#e53935' } : {})
                    }}
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
                  <label className="form-label" htmlFor="date">
                    Data
                    <span style={{
                      color: '#dc3545',
                      fontSize: '1.2em',
                      fontWeight: 'bold',
                      marginLeft: '0.25rem'
                    }}>*</span>
                  </label>
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
                      lang="pt-BR"
                      onChange={handleHiddenDateChange}
                      style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
                      aria-hidden="true"
                      tabIndex={-1}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <CalendarMonth className="date-icon" onClick={handleOpenDatePicker} />
                  </div>
                  {fieldErrors.date && <span className="field-error">{fieldErrors.date}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="time">
                    Horário
                    <span style={{
                      color: '#dc3545',
                      fontSize: '1.2em',
                      fontWeight: 'bold',
                      marginLeft: '0.25rem'
                    }}>*</span>
                  </label>
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
                  <label className="form-label" htmlFor="duration">
                    Duração
                    <span style={{
                      color: '#dc3545',
                      fontSize: '1.2em',
                      fontWeight: 'bold',
                      marginLeft: '0.25rem'
                    }}>*</span>
                  </label>
                  <input
                    type="time"
                    id="duration"
                    name="duration"
                    className="form-control"
                    value={formData.duration}
                    onChange={handleInputChange}
                    required
                    style={{
                      fontSize: '1rem',
                      fontWeight: '500',
                      color: '#2d3748',
                      ...(fieldErrors.duration ? { borderColor: '#e53935' } : {})
                    }}
                  />
                  {fieldErrors.duration && <span className="field-error">{fieldErrors.duration}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="quadra">
                    Nome da Quadra
                    <span style={{
                      color: '#dc3545',
                      fontSize: '1.2em',
                      fontWeight: 'bold',
                      marginLeft: '0.25rem'
                    }}>*</span>
                  </label>
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
                  <label className="form-label" htmlFor="price">
                    Preço por Jogador (R$)
                    <span style={{
                      color: '#dc3545',
                      fontSize: '1.2em',
                      fontWeight: 'bold',
                      marginLeft: '0.25rem'
                    }}>*</span>
                  </label>
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
                  <label className="form-label" htmlFor="cep">
                    CEP
                    <span style={{
                      color: '#dc3545',
                      fontSize: '1.2em',
                      fontWeight: 'bold',
                      marginLeft: '0.25rem'
                    }}>*</span>
                  </label>
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
          matchToCreate={pendingMatchData}
          onHide={() => {
            setShowInfoAthleteModal(false);
            setPendingMatchData(null);
          }}
        />
      )}
    </div>
  );
};

export default CreateMatch;