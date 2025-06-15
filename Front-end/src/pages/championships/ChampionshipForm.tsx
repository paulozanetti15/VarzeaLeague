import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { api } from '../../services/api';
import trophy from '../../assets/championship-trophy.svg';
import './ChampionshipForm.css';

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
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.championships.create(form);
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
                type="date"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Data de Término</label>
              <input
                type="date"
                name="end_date"
                value={form.end_date}
                onChange={handleChange}
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
