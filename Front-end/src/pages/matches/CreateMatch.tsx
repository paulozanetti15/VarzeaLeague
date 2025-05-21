import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import './CreateMatch.css';
import { toast } from 'react-hot-toast';
import RegrasFormRegisterModal from '../../components/Modals/Regras/RegrasFormRegisterModal';
import { ca } from 'date-fns/locale';
import axios from 'axios';
import { u } from 'framer-motion/dist/types.d-B50aGbjN';

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
  category: string; // Added category property
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
  useEffect(() => {
    const fetchCEPData = async ()=>{
      try{
        axios.get(`https://viacep.com.br/ws/${formData.cep}/json/`)
        .then((response) => {
           formData.city = response.data.localidade;
           formData.location = response.data.logradouro;
           formData.UF= response.data.uf;

        })
      }
      catch (error) {
        setError('Erro ao buscar dados do CEP. Verifique o número e tente novamente.');
      }
    }
    fetchCEPData();
  }, [formData.cep]);

  useEffect(() => {
    const user= JSON.parse(localStorage.getItem('user') || '{}');
    setUsuario(user);
    if (titleInputRef.current && btnContainerRef.current) {
      const titleWidth = titleInputRef.current.offsetWidth;
      btnContainerRef.current.style.width = `${titleWidth}px`;
    }
  }, []);
  const isValidCep = (cep: string) => {
    const cepRegex = /^[0-9]{5}-?[0-9]{3}$/;
    return cepRegex.test(cep) ? true : false;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearCep = () => {
    if(formData.cep.length < 8 ){
      setFormData(prev => ({
        ...prev,
        location: '',
        city: '',
        UF: ''
      }));
  }

  };

  useEffect(() => {
    clearCep();
  },[formData.cep]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validações do formulário
      if (!formData.title?.trim()) {
        setError('O título da partida é obrigatório');
        return;
      }

      if (!formData.date || !formData.time) {
        setError('Data e hora são obrigatórios');
        return;
      }

      // Validar data futura
      const matchDateTime = new Date(`${formData.date}T${formData.time}`);
      if (matchDateTime <= new Date()) {
        setError('A data da partida deve ser futura');
        return;
      }
    
      // Validar preço
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
        date: matchDateTime.toISOString(),
        location: formData.location.trim(),
        description: formData.description?.trim(),
        price: formData.price ? parseFloat(formData.price) : null,
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
          <div className="form-col">
            <div className='form-row'>
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
            <div className="form-col">
              <div className="form-group">
                <label htmlFor="time">Horário </label>
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
        </div>  
          <div className="form-group">
            <label htmlFor="cep">CEP </label>
            <input type="text"
              id="cep"
              name="cep"
              pattern='[0-9]{5}-?[0-9]{3}'
              maxLength={9}
              value={formData.cep}
              onChange={handleInputChange}
              ></input>
          </div>
           <div className="form-group">
            <label htmlFor="location">Endereço </label>
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
          <div className="form-group">
            <label htmlFor="city">Cidade </label>
             <input type="text"
              id="city"
              name="city"
              value={formData.city}
              disabled></input>
          </div>
          <div className="form-col">
              <div className="form-group">
                <label htmlFor="UF"> UF</label>
                <input
                  type="text"
                  id="UF"
                  name="UF"
                  value={formData.UF}
                  onChange={handleInputChange}
                  disabled
                  className="form-control"
                />
              </div>
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
               Continuar para criar partida
            </button>
          </div>
        </form>
      </div> 
      {usuario && (
      <>
        <RegrasFormRegisterModal
            userId={usuario.id} 
            show={showInfoAthleteModal}
            partidaDados={dadosPartida}
            onHide={() => setShowInfoAthleteModal(false)}
        />
      </>
    )} 
    </div>
  );
};
 
export default CreateMatch; 