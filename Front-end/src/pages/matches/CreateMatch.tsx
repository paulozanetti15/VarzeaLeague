import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import './CreateMatch.css';
import RegrasFormRegisterModal from '../../components/Modals/Regras/RegrasFormRegisterModal';
import axios from 'axios';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import CircularProgress from '@mui/material/CircularProgress';
import ToastComponent from '../../components/Toast/ToastComponent';
import { format, parse, isValid, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MatchFormData {
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  price: string;
  complement: string;
  cep: string;
  UF: string;
  city: string;
  category: string;
  number: string;
}

const CreateMatch: React.FC = () => {
  const navigate = useNavigate();
  const titleInputRef = useRef<HTMLInputElement>(null);
  const btnContainerRef = useRef<HTMLDivElement>(null);
  const [showInfoAthleteModal, setShowInfoAthleteModal] = useState(false);
  const [usuario, setUsuario] = useState<any>(null);
  const [dadosPartida, setDadosPartida] = useState<any>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastBg, setToastBg] = useState('');
  const [cepValido, setCepValido] = useState<boolean | null>(null);
  const [cepErrorMessage, setCepErrorMessage] = useState<string | null>(null);
  const [enderecoCompleto, setEnderecoCompleto] = useState('');
  
  const [formData, setFormData] = useState<MatchFormData>({
    title: '',
    description: '',
    location: '',
    number: '',
    date: format(new Date(), 'dd/MM/yyyy'),
    time: format(new Date(), 'HH:mm'),
    price: '',
    complement: '',
    city: '',
    cep: '',
    category: '',
    UF: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatarCep = (cep: string): string => {
    cep = cep.replace(/\D/g, '');
    if (cep.length > 8) cep = cep.slice(0, 8);
    if (cep.length > 5) {
      return `${cep.slice(0, 5)}-${cep.slice(5)}`;
    }
    return cep;
  };

  const formatDateToBR = (date: string): string => {
    if (!date) return '';
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  };

  const formatDateToISO = (date: string): string => {
    if (!date) return '';
    const [day, month, year] = date.split('/');
    return `${year}-${month}-${day}`;
  };

  const formatTime = (value: string): string => {
    let time = value.replace(/[^\d:]/g, '');
    
    if (time.length > 2 && time.charAt(2) !== ':') {
      time = time.slice(0, 2) + ':' + time.slice(2);
    }
    
    time = time.slice(0, 5);
    
    const hours = parseInt(time.split(':')[0] || '0');
    if (hours > 23) {
      time = '23' + time.slice(2);
    }
    
    if (time.length > 2) {
      const minutes = parseInt(time.split(':')[1] || '0');
      if (minutes > 59) {
        time = time.slice(0, 3) + '59';
      }
    }
    
    return time;
  };

  const isValidDateBR = (date: string): boolean => {
    const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/(19|20)\d\d$/;
    if (!regex.test(date)) return false;
    
    const [day, month, year] = date.split('/').map(Number);
    const d = new Date(year, month - 1, day);
    
    return d.getDate() === day && 
           d.getMonth() === month - 1 && 
           d.getFullYear() === year;
  };

  const buscarCep = async (cep: string) => {
    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
      if (response.data.erro) {
        setCepValido(false);
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
      
      setCepValido(true);
      setCepErrorMessage(null);
    } catch (error) {
      setCepValido(false);
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
        setCepValido(null);
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
      if (!formData.title?.trim()) {
        setError('O título da partida é obrigatório');
        return;
      }

      if (!formData.date || !formData.time) {
        setError('Data e hora são obrigatórios');
        return;
      }

      const parsedDate = parse(formData.date, 'dd/MM/yyyy', new Date());
      if (!isValid(parsedDate)) {
        setError('Data inválida. Use o formato DD/MM/AAAA');
        setLoading(false);
        return;
      }

      const [hours, minutes] = formData.time.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes) || hours > 23 || minutes > 59) {
        setError('Hora inválida. Use o formato HH:MM');
        setLoading(false);
        return;
      }

      const matchDateTime = parse(
        `${formData.date} ${formData.time}`,
        'dd/MM/yyyy HH:mm',
        new Date()
      );
      
      if (!isAfter(matchDateTime, new Date())) {
        setError('A data da partida deve ser futura');
        return;
      }
    
      if (formData.price && parseFloat(formData.price) < 0) {
        setError('O preço não pode ser negativo');
        return;
      }

      if (!formData.cep || !isValidCep(formData.cep)) {
        setError('CEP inválido');
        return;
      }

      const matchData = {
        title: formData.title.trim(),
        date: format(matchDateTime, "yyyy-MM-dd'T'HH:mm:ss"),
        location: enderecoCompleto,
        number: formData.number.trim(),
        description: formData.description?.trim(),
        price: formData.price ? parseFloat(formData.price) : 0.00,
        city: formData.city.trim(),
        complement: formData.complement?.trim(),
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
            <label>Título da Partida</label>
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
              <label htmlFor="date">Data *</label>
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
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="time">Horário *</label>
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
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="cep">CEP *</label>
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
            />
            {cepErrorMessage && (
              <div className="error-message">
                {cepErrorMessage}
              </div>
            )}
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
            />
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
              />
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
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Preço (opcional)</label>
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
