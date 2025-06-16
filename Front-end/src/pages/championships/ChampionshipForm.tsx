import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { api } from '../../services/api';
import trophy from '../../assets/championship-trophy.svg';
import './ChampionshipForm.css';
import { format, parse, isValid, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const initialState = {
  name: '',
  description: '',
  start_date: '',
  end_date: '',
};

const ChampionshipForm: React.FC = () => {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'start_date' || name === 'end_date') {
      // Validar e formatar a data
      const dateRegex = /^(\d{0,2})\/(\d{0,2})\/(\d{0,4})$/;
      let formattedDate = value.replace(/\D/g, '');
      
      if (formattedDate.length <= 8) {
        if (formattedDate.length > 4) {
          formattedDate = formattedDate.replace(/(\d{2})(\d{2})(\d{0,4})/, '$1/$2/$3');
        } else if (formattedDate.length > 2) {
          formattedDate = formattedDate.replace(/(\d{2})(\d{0,2})/, '$1/$2');
        }
        
        if (dateRegex.test(formattedDate) || formattedDate.length < 10) {
          setForm(prev => ({
            ...prev,
            [name]: formattedDate
          }));
        }
      }
      return;
    }

    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validar datas
      if (form.start_date) {
        const parsedStartDate = parse(form.start_date, 'dd/MM/yyyy', new Date());
        if (!isValid(parsedStartDate)) {
          setError('Data de início inválida. Use o formato DD/MM/AAAA');
          setLoading(false);
          return;
        }
      }

      if (form.end_date) {
        const parsedEndDate = parse(form.end_date, 'dd/MM/yyyy', new Date());
        if (!isValid(parsedEndDate)) {
          setError('Data de término inválida. Use o formato DD/MM/AAAA');
          setLoading(false);
          return;
        }
      }

      // Validar se data de término é posterior à data de início
      if (form.start_date && form.end_date) {
        const startDate = parse(form.start_date, 'dd/MM/yyyy', new Date());
        const endDate = parse(form.end_date, 'dd/MM/yyyy', new Date());
        
        if (!isAfter(endDate, startDate)) {
          setError('A data de término deve ser posterior à data de início');
          setLoading(false);
          return;
        }
      }

      // Converter datas para o formato ISO antes de enviar
      const formattedData = {
        ...form,
        start_date: form.start_date ? format(parse(form.start_date, 'dd/MM/yyyy', new Date()), 'yyyy-MM-dd') : '',
        end_date: form.end_date ? format(parse(form.end_date, 'dd/MM/yyyy', new Date()), 'yyyy-MM-dd') : ''
      };

      await api.championships.create(formattedData);
      setSuccess('Campeonato criado com sucesso!');
      setTimeout(() => navigate('/championships'), 1200);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar campeonato');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="championship-form-bg">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <ArrowBackIcon /> Voltar
      </button>
      
      <div className="championship-form-container">
        <div className="championship-form-header">
          <img src={trophy} alt="Troféu" className="championship-form-trophy" />
          <h2>Cadastrar Campeonato</h2>
          <p className="championship-form-subtitle">Preencha os dados para criar um campeonato incrível!</p>
        </div>

        <form className="championship-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome do Campeonato *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Digite o nome do campeonato"
            />
          </div>

          <div className="form-group">
            <label>Descrição</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Descrição, regras, premiação..."
              rows={4}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Data de Início</label>
              <input
                type="text"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
                placeholder="DD/MM/AAAA"
                maxLength={10}
                className="date-input"
              />
            </div>
            <div className="form-group">
              <label>Data de Término</label>
              <input
                type="text"
                name="end_date"
                value={form.end_date}
                onChange={handleChange}
                placeholder="DD/MM/AAAA"
                maxLength={10}
                className="date-input"
              />
            </div>
          </div>

          {error && <div className="form-error">{error}</div>}
          {success && <div className="form-success">{success}</div>}

          <button
            type="submit"
            className="form-btn"
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Cadastrar Campeonato'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChampionshipForm;
