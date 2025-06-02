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

interface MatchFormData {
  title: string;
  description: string;
  location: string;
  number: string;
  date: string;
  time: string;
  price: string;
  complement: string;
  cep: string;
  UF: string;
  city: string;
  category: string;
}

const CreateMatch: React.FC = () => {
  const navigate = useNavigate();
  const titleInputRef = useRef<HTMLInputElement>(null);
  const btnContainerRef = useRef<HTMLDivElement>(null);
  const [showInfoAthleteModal, setShowInfoAthleteModal] = useState(false);
  const [usuario, setUsuario] = useState<any>(null);
  const [dadosPartida, setDadosPartida] = useState<any>(null);	
  const [formData, setFormData] = useState<MatchFormData>({
    title: '',
    description: '',
    location: '',
    number: '',
    date: '',
    time: '',
    price: '',
    complement: '',
    city: '',
    cep: '',
    category: '',
    UF: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cepValido, setCepValido] = useState<boolean | null>(null);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [cepErrorMessage, setCepErrorMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastBg, setToastBg] = useState('success');

  useEffect(() => {
    const user= JSON.parse(localStorage.getItem('user') || '{}');
    setUsuario(user);
    if (titleInputRef.current && btnContainerRef.current) {
      const titleWidth = titleInputRef.current.offsetWidth;
      btnContainerRef.current.style.width = `${titleWidth}px`;
    }
  }, []);
  
  const formatarCep = (cep: string): string => {
    cep = cep.replace(/\D/g, '');
    
    if (cep.length > 5) {
      return `${cep.substring(0, 5)}-${cep.substring(5, 8)}`;
    }
    
    return cep;
  };

  const isValidCep = (cep: string) => {
    const cepRegex = /^[0-9]{5}-?[0-9]{3}$/;
    return cepRegex.test(cep);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'cep') {
      const cepNumerico = value.replace(/\D/g, '');
      
      const cepFormatado = formatarCep(cepNumerico);
      setFormData({
        ...formData,
        cep: cepFormatado
      });
      
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
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const buscarCep = async (cep: string) => {
    setBuscandoCep(true);
    setCepValido(null);
    setCepErrorMessage(null);
    
    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
      
      if (response.data.erro) {
        setCepValido(false);
        setFormData(prev => ({
          ...prev,
          location: '',
          city: '',
          UF: ''
        }));
        setCepErrorMessage('CEP não encontrado na base de dados.');
        setToastMessage('CEP não encontrado');
        setToastBg('danger');
        setShowToast(true);
        return;
      }
      
      setCepValido(true);
      setFormData(prev => ({
        ...prev,
        location: response.data.logradouro || '',
        city: response.data.localidade || '',
        UF: response.data.uf || ''
      }));
      
      setToastMessage('CEP encontrado com sucesso!');
      setToastBg('success');
      setShowToast(true);
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      setCepValido(false);
      setFormData(prev => ({
        ...prev,
        location: '',
        city: '',
        UF: ''
      }));
      setCepErrorMessage('Erro na conexão com o serviço de CEP. Tente novamente.');
      setToastMessage('Erro ao buscar CEP. Verifique sua conexão.');
      setToastBg('danger');
      setShowToast(true);
    } finally {
      setBuscandoCep(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validações do formulário
      if (!formData.title?.trim()) {
        setError('O título da partida é obrigatório');
        setLoading(false);
        return;
      }

      if (!formData.date || !formData.time) {
        setError('Data e hora são obrigatórios');
        setLoading(false);
        return;
      }

      // Validar data futura
      const matchDateTime = new Date(`${formData.date}T${formData.time}`);
      if (matchDateTime <= new Date()) {
        setError('A data da partida deve ser futura');
        setLoading(false);
        return;
      }
    
      // Validar preço
      if (formData.price && parseFloat(formData.price) < 0) {
        setError('O preço não pode ser negativo');
        setLoading(false);
        return;
      }
      
      // Validar CEP
      if (formData.cep.replace(/\D/g, '').length !== 8) {
        setError('CEP inválido. Informe um CEP com 8 dígitos.');
        setLoading(false);
        return;
      }
      
      if (!cepValido) {
        setError('CEP não encontrado. Verifique se o CEP está correto.');
        setLoading(false);
        return;
      }
      
      if (formData.UF.trim() === '' || formData.city.trim() === '') {
        setError('Estado e cidade são obrigatórios.');
        setLoading(false);
        return;
      }
      
      if (!formData.number.trim()) {
        setError('O número do endereço é obrigatório.');
        setLoading(false);
        return;
      }
      
      // Unir o endereço com o número antes de enviar ao backend
      const enderecoCompleto = `${formData.location.trim()}, ${formData.number.trim()}`;
      
      const matchData = {
        title: formData.title.trim(),
        date: matchDateTime.toISOString(),
        location: enderecoCompleto,
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
      
      <div className="top-navigation">
        <button 
          className="back-btn"
          onClick={() => navigate('/matches')} 
        >
          <ArrowBackIcon /> Voltar
        </button>
      </div>

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
            <div className="form-group" style={{ flex: 1 }}>
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
            <div className="form-group" style={{ flex: 1 }}>
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
          <div className="form-group">
            <label htmlFor="cep">CEP *</label>
            <div className={`cep-input-container ${cepValido === true ? 'valid' : cepValido === false ? 'invalid' : ''}`}>
              <input 
                type="text"
                id="cep"
                name="cep"
                className="form-control"
                maxLength={9}
                value={formData.cep}
                onChange={handleInputChange}
                placeholder="00000-000"
                required
              />
              {buscandoCep && (
                <span className="cep-loading">
                  <CircularProgress size={20} />
                </span>
              )}
              {!buscandoCep && cepValido === true && (
                <span className="cep-valid">
                  <CheckCircleIcon style={{ fontSize: 20 }} />
                </span>
              )}
              {!buscandoCep && cepValido === false && (
                <span className="cep-invalid">
                  <ErrorIcon style={{ fontSize: 20 }} />
                </span>
              )}
            </div>
            {cepErrorMessage && (
              <div className="cep-error-message">
                {cepErrorMessage}
              </div>
            )}
          </div>
          
          <div className="form-row">
            <div className="form-group" style={{ flex: 3 }}>
              <label htmlFor="location">Endereço *</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="form-control"
                required
                placeholder="Rua, Avenida, etc."
                disabled={true}
              />
            </div>
            
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="number">Número *</label>
              <input
                type="text"
                id="number"
                name="number"
                value={formData.number}
                onChange={handleInputChange}
                className="form-control"
                required
                placeholder="Nº"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group" style={{ flex: 2 }}>
              <label htmlFor="city">Cidade *</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="form-control"
                required
                placeholder="Cidade"
                disabled={true}
              />
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="UF">Estado *</label>
              <input
                type="text"
                id="UF"
                name="UF"
                value={formData.UF}
                onChange={handleInputChange}
                className="form-control"
                required
                placeholder="UF"
                maxLength={2}
                disabled={true}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="complement">Complemento</label>
            <input
              type="text"
              id="complement"
              name="complement"
              value={formData.complement}
              onChange={handleInputChange}
              className="form-control"
              placeholder="Complemento, referências, etc."
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">Preço por jogador (R$)</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className="form-control"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>

          <div className="form-buttons">
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Criando...' : 'Próximo'}
            </button>
          </div>
        </form>
      </div>
      {showInfoAthleteModal && (
        <RegrasFormRegisterModal 
          show={showInfoAthleteModal}
          onHide={() => setShowInfoAthleteModal(false)}
          partidaDados={dadosPartida}
          userId={usuario?.id || 0}
        />
      )}
    </div>
  );
};

export default CreateMatch;