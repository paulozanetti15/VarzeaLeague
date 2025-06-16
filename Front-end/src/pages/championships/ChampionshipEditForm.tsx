import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';
import trophy from '../../assets/championship-trophy.svg';
import './ChampionshipForm.css';

const ChampionshipEditForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChampionship = async () => {
      try {
        setLoading(true);
        const data = await api.championships.getById(Number(id));
        
        const formatDate = (dateString?: string) => {
          if (!dateString) return '';
          const date = new Date(dateString);
          return date.toISOString().split('T')[0];
        };
        
        setForm({
          name: data.name || '',
          description: data.description || '',
          start_date: formatDate(data.start_date),
          end_date: formatDate(data.end_date),
        });
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar dados do campeonato');
        setLoading(false);
      }
    };

    if (id) {
      fetchChampionship();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await api.championships.update(Number(id), form);
      setSuccess('Campeonato atualizado com sucesso!');
      setTimeout(() => navigate(`/championships/${id}`), 1200);
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar campeonato');
    } finally {
      setSubmitting(false);
    }
  };
  if (loading) {
    return (
      <div className="championship-form-bg" style={{ background: 'linear-gradient(135deg, #0A2351 0%, #0D47A1 100%)', minHeight: '100vh' }}>
        <div className="championship-form-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Carregando dados do campeonato...</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="championship-form-bg" style={{ background: 'linear-gradient(135deg, #0A2351 0%, #0D47A1 100%)', minHeight: '100vh' }}>
      <div className="championship-form-container">
        <div className="championship-form-header">
          <img src={trophy} alt="Troféu" className="championship-form-trophy" />
          <h2>Editar Campeonato</h2>
          <p className="championship-form-subtitle">Atualize os dados do seu campeonato</p>
        </div>
        <form className="championship-form" onSubmit={handleSubmit}>
          <label>Nome *</label>
          <input name="name" value={form.name} onChange={handleChange} required placeholder="Nome do campeonato" />
          <label>Descrição</label>
          <textarea name="description" value={form.description} onChange={handleChange} placeholder="Descrição, regras, premiação..." />
          <div className="form-row">
            <div>
              <label>Data de início</label>
              <input type="date" name="start_date" value={form.start_date} onChange={handleChange} />
            </div>
            <div>
              <label>Data de término</label>
              <input type="date" name="end_date" value={form.end_date} onChange={handleChange} />
            </div>
          </div>
          {error && <div className="form-error">{error}</div>}
          {success && <div className="form-success">{success}</div>}
          <button type="submit" className="form-btn" disabled={submitting}>
            {submitting ? 'Salvando...' : 'Atualizar Campeonato'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChampionshipEditForm;
