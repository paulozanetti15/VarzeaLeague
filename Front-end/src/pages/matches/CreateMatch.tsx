import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateMatch.css';
import RegrasFormRegisterModal from '../../components/Modals/Rules/RegrasFormRegisterModal';
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
  modalidade:string;
  quadra: string; // front-end field representing nomequadra backend

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
  // const [cepValido, setCepValido] = useState<boolean | null>(null); // removed unused state
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
    modalidade:'',
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

  // Removed unused helper functions (formatDateToBR, formatDateToISO, formatTime, formatDuration) to clean up file
  const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    setFormData(prev => ({
      ...prev,
      modalidade: value
    }));
  };

  // Removed unused isValidDateBR

  const buscarCep = async (cep: string) => {
    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
      if (response.data.erro) {
  // setCepValido(false); // state removed
        setCepErrorMessage('CEP não encontrado');
        return;
      }

      setFormData(prev => ({
        ...prev,
        location: response.data.logradouro || '',
        city: response.data.localidade || '',
        UF: response.data.uf || ''
      }));

      const endCompleto = `${response.data.logradouro}${formData.number ? `, ${formData.number}` : ''}, ${response.data.localidade} - ${response.data.uf}`;
      setEnderecoCompleto(endCompleto);
      
  // setCepValido(true); // unused
      setCepErrorMessage(null);
    } catch (error) {
  // setCepValido(false); // unused
      setCepErrorMessage('Erro ao buscar CEP');
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userType = Number(user.userTypeId);
    
    // Verifica se o usuário tem permissão (userType 1 ou 2)
    if (userType !== 1 && userType !== 2) {
      setToastMessage('Você não tem permissão para criar partidas.');
      setToastBg('error');
      setShowToast(true);
      setTimeout(() => {
        navigate('/matches');
      }, 2000);
      return;
    }

    setUsuario(user);
    if (titleInputRef.current && btnContainerRef.current) {
      const titleWidth = titleInputRef.current.offsetWidth;
      btnContainerRef.current.style.width = `${titleWidth}px`;
    }
  }, [navigate]);

  const isValidCep = (cep: string): boolean => {
    const cepRegex = /^[0-9]{5}-?[0-9]{3}$/;
    return cepRegex.test(cep);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'number') {
      setFormData(prev => ({
        ...prev,
        number: value
      }));
      
      if (formData.location) {
        const endCompleto = `${formData.location}${value ? `, ${value}` : ''}, ${formData.city} - ${formData.UF}`;
        setEnderecoCompleto(endCompleto);
      }
      return;
    }

    if (name === 'cep') {
      const cepNumerico = value.replace(/\D/g, '');
      const cepFormatado = formatarCep(cepNumerico);
      
      setFormData(prev => ({
        ...prev,
        cep: cepFormatado
      }));
      
      if (cepNumerico.length < 8) {
        setFormData(prev => ({
          ...prev,
          location: '',
          city: '',
          UF: ''
        }));
  // setCepValido(null); // state removed
        setCepErrorMessage(null);
      }
      
      if (cepNumerico.length === 8) {
        buscarCep(cepNumerico);
      }
      return;
    }

    if (name === 'date') {
      const dateRegex = /^(\d{0,2})\/(\d{0,2})\/(\d{0,4})$/;
      let formattedDate = value.replace(/\D/g, '');
      
      if (formattedDate.length <= 8) {
        if (formattedDate.length > 4) {
          formattedDate = formattedDate.replace(/(\d{2})(\d{2})(\d{0,4})/, '$1/$2/$3');
        } else if (formattedDate.length > 2) {
          formattedDate = formattedDate.replace(/(\d{2})(\d{0,2})/, '$1/$2');
        }

        if (dateRegex.test(formattedDate) || formattedDate.length < 10) {
          setFormData(prev => ({
            ...prev,
            [name]: formattedDate
          }));
        }
      }
      return;
    }

    if (name === 'time') {
      const timeRegex = /^(\d{0,2}):?(\d{0,2})$/;
      let formattedTime = value.replace(/\D/g, '');
      
      if (formattedTime.length <= 4) {
        if (formattedTime.length > 2) {
          formattedTime = formattedTime.replace(/(\d{2})(\d{0,2})/, '$1:$2');
        }
        
        if (timeRegex.test(formattedTime)) {
          const [hours, minutes] = formattedTime.split(':').map(Number);
          if ((!hours || hours < 24) && (!minutes || minutes < 60)) {
            setFormData(prev => ({
              ...prev,
              [name]: formattedTime
            }));
          }
        }
      }
      return;
    }

    if (name === 'duration') {
      const durationRegex = /^(\d{0,2}):?(\d{0,2})$/;
      let formattedDuration = value.replace(/\D/g, '');
      
      if (formattedDuration.length <= 4) {
        if (formattedDuration.length > 2) {
          formattedDuration = formattedDuration.replace(/(\d{2})(\d{0,2})/, '$1:$2');
        }
        
        if (durationRegex.test(formattedDuration)) {
          const [hours, minutes] = formattedDuration.split(':').map(Number);
          if ((!hours || hours < 24) && (!minutes || minutes < 60)) {
            setFormData(prev => ({
              ...prev,
              [name]: formattedDuration
            }));
          }
        }
      }
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});

    try {
      const newFieldErrors: {[k:string]: string} = {};

      // Title
      if (!formData.title?.trim()) {
        newFieldErrors.title = 'Informe um título';
      }
      // Date
      if (!formData.date) {
        newFieldErrors.date = 'Informe a data';
      } else {
        const parsedDate = parse(formData.date, 'dd/MM/yyyy', new Date());
        if (!isValid(parsedDate)) {
          newFieldErrors.date = 'Data inválida';
        } else if (!isAfter(parsedDate, new Date())) {
          newFieldErrors.date = 'Data deve ser futura';
        }
      }
      // Time
      if (!formData.time) {
        newFieldErrors.time = 'Informe o horário';
      } else {
        const [hours, minutes] = formData.time.split(':').map(Number);
        if (isNaN(hours) || isNaN(minutes) || hours > 23 || minutes > 59) {
          newFieldErrors.time = 'Horário inválido';
        }
      }
      // CEP / Location dependencies
      if (!formData.cep) {
        newFieldErrors.cep = 'Informe o CEP';
      } else if (!isValidCep(formData.cep)) {
        newFieldErrors.cep = 'CEP inválido';
      }
      // Location (logradouro preenchido após CEP)
      if (!formData.location) {
        newFieldErrors.location = 'Endereço não resolvido pelo CEP';
      }
      // Cidade / UF (derivados do CEP)
      if (!formData.city) newFieldErrors.city = 'Cidade ausente';
      if (!formData.UF) newFieldErrors.UF = 'UF ausente';
      // Modalidade (backend armazena)
      if (!formData.modalidade) newFieldErrors.modalidade = 'Selecione a modalidade';
      // Quadra (nomequadra) obrigatório no backend
      if (!formData.quadra?.trim()) {
        newFieldErrors.quadra = 'Informe o nome da quadra';
      }
      // Duração (se houver validação de formato)
      if (formData.duration) {
        const durRegex = /^([0-9]{1,2}):([0-5][0-9])$/;
        if (!durRegex.test(formData.duration)) {
          newFieldErrors.duration = 'Duração inválida (HH:MM)';
        }
      }
      // Preço (não negativo)
      if (formData.price && parseFloat(formData.price) < 0) {
        newFieldErrors.price = 'Preço não pode ser negativo';
      }

      if (Object.keys(newFieldErrors).length > 0) {
        setFieldErrors(newFieldErrors);
        setError('Corrija os campos destacados antes de continuar.');
        return;
      }

  // Data já validada anteriormente; reutilizamos apenas para montar matchDateTime abaixo.

      // Gambiarra: normalizar duração (vazia ou inválida vira 00:00)
      const normalizeDuration = (d: string | undefined): string => {
        if (!d || !d.trim()) return '00:00';
        const parts = d.split(':');
        if (parts.length !== 2) return '00:00';
        let [h, m] = parts;
        // Garantir apenas números
        if (!/^\d{1,2}$/.test(h)) h = '0';
        if (!/^\d{1,2}$/.test(m)) m = '0';
        let hn = parseInt(h, 10);
        let mn = parseInt(m, 10);
        if (isNaN(hn) || hn > 23) hn = 0;
        if (isNaN(mn) || mn > 59) mn = 0;
        const hh = hn.toString().padStart(2, '0');
        const mm = mn.toString().padStart(2, '0');
        return `${hh}:${mm}`;
      };
      const durationNormalized = normalizeDuration(formData.duration);

      const matchDateTime = parse(
        `${formData.date} ${formData.time}`,
        'dd/MM/yyyy HH:mm',
        new Date()
      );
      
      // Essas validações já cobertas individualmente acima

      const matchData = {
        title: formData.title.trim(),
        date: format(matchDateTime, "yyyy-MM-dd'T'HH:mm:ss"),
        location: enderecoCompleto,
        number: formData.number.trim(),
        description: formData.description?.trim(),
        duration: durationNormalized,
        price: formData.price ? parseFloat(formData.price) : 0.00,
        city: formData.city.trim(),
        complement: formData.complement?.trim(),
        namequadra: formData.quadra.trim(), // controller receives namequadra then maps to nomequadra
        modalidade: formData.modalidade.trim(),
        Uf: formData.UF.trim(),
        Cep: formData.cep.trim(),
      };
       
      setDadosPartida(matchData);
      setShowInfoAthleteModal(true);
    } catch (err: any) {
      console.error('Erro ao criar partida:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Erro ao criar partida. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDateISOToBR = (iso: string): string => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  };

  const handleOpenDatePicker = () => {
    const el = hiddenDateInputRef.current;
    if (!el) return;
    const current = (document.getElementById('date') as HTMLInputElement | null)?.value || '';
    if (current && current.length === 10) {
      const [d, m, y] = current.split('/');
      el.value = `${y}-${m}-${d}`;
    }
    const anyEl = el as any;
    if (typeof anyEl.showPicker === 'function') {
      anyEl.showPicker();
    } else {
      el.click();
    }
  };

  const handleHiddenDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const iso = e.target.value;
    const br = formatDateISOToBR(iso);
    setFormData(prev => ({ ...prev, date: br }));
  };

  return (
    <div className="create-match-container">
      {showToast && (
        <ToastComponent
          message={toastMessage}
          bg={toastBg}
          onClose={() => setShowToast(false)}
        />
      )}
      

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
            <label>Título da Partida <span className="required-asterisk" aria-hidden="true">*</span></label>
            <input
              ref={titleInputRef}
              type="text"
              className="form-control"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="Ex: Pelada de Domingo"
              style={fieldErrors.title ? { borderColor: '#e53935' } : undefined}
            />
            {fieldErrors.title && <small style={{ color:'#e53935' }}>{fieldErrors.title}</small>}
          </div>

          <div className="form-group">
            <label>Descrição</label>
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
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="date">Data <span className="required-asterisk" aria-hidden="true">*</span></label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    type="text"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    className="form-control"
                    placeholder="DD/MM/AAAA"
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
                </div>
                <button
                  type="button"
                  aria-label="Abrir calendário"
                  onClick={handleOpenDatePicker}
                  style={{
                    border: 'none',
                    background: '#0d47a1',
                    padding: 0,
                    cursor: 'pointer',
                    color: '#fff',
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 44,
                    height: 44,
                    minWidth: 44
                  }}
                >
                  <CalendarMonthIcon fontSize="medium" style={{ marginRight: 0 }} />
                </button>
              </div>
              {fieldErrors.date && <small style={{ color:'#e53935' }}>{fieldErrors.date}</small>}
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="time">Horário <span className="required-asterisk" aria-hidden="true">*</span></label>
              <input
                type="text"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                required
                className="form-control"
                placeholder="HH:MM"
                maxLength={5}
                style={fieldErrors.time ? { borderColor: '#e53935' } : undefined}
              />
              {fieldErrors.time && <small style={{ color:'#e53935' }}>{fieldErrors.time}</small>}
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="duration">Duração</label>
              <input
                type="text"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className="form-control"
                placeholder="HH:MM"
                maxLength={5}
                style={fieldErrors.duration ? { borderColor: '#e53935' } : undefined}
              />
              {fieldErrors.duration && <small style={{ color:'#e53935' }}>{fieldErrors.duration}</small>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="cep">CEP <span className="required-asterisk" aria-hidden="true">*</span></label>
            <input 
              type="text"
              id="cep"
              name="cep"
              pattern='[0-9]{5}-?[0-9]{3}'
              maxLength={9}
              value={formData.cep}
              onChange={handleInputChange}
              className="form-control"
              required
              style={fieldErrors.cep ? { borderColor: '#e53935' } : undefined}
            />
            {cepErrorMessage && (
              <div className="error-message">
                {cepErrorMessage}
              </div>
            )}
            {fieldErrors.cep && <small style={{ color:'#e53935' }}>{fieldErrors.cep}</small>}
          </div>

          <div className="form-group">
            <label htmlFor="location">Endereço</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              disabled
              placeholder="Ex: Rua das Flores, 123"
              className="form-control"
              style={fieldErrors.location ? { borderColor: '#e53935' } : undefined}
            />
            {fieldErrors.location && <small style={{ color:'#e53935' }}>{fieldErrors.location}</small>}
          </div>

          <div className="form-row">
            <div className="form-col number-col">
              <div className="form-group">
                <label htmlFor="number">Número</label>
                <input
                  type="text"
                  id="number"
                  name="number"
                  value={formData.number}
                  onChange={handleInputChange}
                  placeholder="123"
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-col">
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
            </div>
          </div>

          <div className="form-row">
            <div className="form-group" style={{ flex: 2 }}>
              <label htmlFor="city">Cidade</label>
              <input 
                type="text"
                id="city"
                name="city"
                value={formData.city}
                disabled
                className="form-control"
                style={fieldErrors.city ? { borderColor: '#e53935' } : undefined}
              />
              {fieldErrors.city && <small style={{ color:'#e53935' }}>{fieldErrors.city}</small>}
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="UF">UF</label>
              <input
                type="text"
                id="UF"
                name="UF"
                value={formData.UF}
                disabled
                className="form-control"
                style={fieldErrors.UF ? { borderColor: '#e53935' } : undefined}
              />
              {fieldErrors.UF && <small style={{ color:'#e53935' }}>{fieldErrors.UF}</small>}
            </div>
          </div>
          
          <div className="form-group">
            <label>Valor da quadra (opcional)</label>
            <input
              type="number"
              className="form-control"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="R$"
              min="0"
              step="0.01"
              style={fieldErrors.price ? { borderColor: '#e53935' } : undefined}
            />
            {fieldErrors.price && <small style={{ color:'#e53935' }}>{fieldErrors.price}</small>}
          </div>
          <div className="form-group">
            <label>Nome da Quadra <span className="required-asterisk" aria-hidden="true">*</span></label>
            <input 
              name="quadra" 
              type='text' 
              className='form-control' 
              onChange={handleInputChange} 
              value={formData.quadra}
              style={fieldErrors.quadra ? { borderColor: '#e53935' } : undefined}
              placeholder="Ex: Arena Central"
              required
            />
            {fieldErrors.quadra && <small style={{ color:'#e53935' }}>{fieldErrors.quadra}</small>}
          </div>
          <div className="form-group">
            <label>Modalidade <span className="required-asterisk" aria-hidden="true">*</span></label>
            <select 
              style={{            
                color: '#0e0202ff',
                WebkitTextFillColor: '#f7f6f6ff',
                fontSize: '1rem',
              }}
              name="modalidade"
              onChange={handleSelect}
              value={formData.modalidade}
              className={fieldErrors.modalidade ? 'form-control error-select' : undefined}
            >
              <option value="">Selecione a modalidade</option>
              <option value="Fut7">Fut7</option>
              <option value="Futsal">Futsal</option>
              <option value="Futebol campo">Futebol campo</option>
            </select> 
            {fieldErrors.modalidade && <small style={{ color:'#e53935' }}>{fieldErrors.modalidade}</small>}
          </div>
          <div className="btn-container" ref={btnContainerRef}>
            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Continuar para criar partida'
              )}
            </button>
          </div>
        </form>
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
