import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import trophy from '../../assets/championship-trophy.svg';
import './ChampionshipForm.css';
import { format, parse, isValid, isAfter } from 'date-fns';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

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
  const hiddenStartRef = useRef<HTMLInputElement>(null);
  const hiddenEndRef = useRef<HTMLInputElement>(null);

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

  const openPicker = (which: 'start' | 'end') => {
    const ref = which === 'start' ? hiddenStartRef.current : hiddenEndRef.current;
    if (!ref) return;
    const current = which === 'start' ? form.start_date : form.end_date;
    if (current && current.length === 10) {
      const [d,m,y] = current.split('/');
      ref.value = `${y}-${m}-${d}`;
    }
    const anyEl: any = ref;
    if (typeof anyEl.showPicker === 'function') { anyEl.showPicker(); } else { ref.click(); }
  };

  const handleHiddenChange = (e: React.ChangeEvent<HTMLInputElement>, which: 'start' | 'end') => {
    const iso = e.target.value; if (!iso) return;
    const [y,m,d] = iso.split('-');
    const br = `${d}/${m}/${y}`;
    setForm(prev => ({ ...prev, [which === 'start' ? 'start_date' : 'end_date']: br }));
  };

  return (
    <div className="championship-form-bg">
      
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    type="text"
                    name="start_date"
                    value={form.start_date}
                    onChange={handleChange}
                    placeholder="DD/MM/AAAA"
                    maxLength={10}
                    className="date-input"
                    onFocus={() => openPicker('start')}
                  />
                  <input
                    ref={hiddenStartRef}
                    type="date"
                    onChange={(e) => handleHiddenChange(e, 'start')}
                    style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
                    aria-hidden="true"
                    tabIndex={-1}
                  />
                </div>
                <button
                  type="button"
                  aria-label="Abrir calendário início"
                  onClick={() => openPicker('start')}
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
            </div>
            <div className="form-group">
              <label>Data de Término</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    type="text"
                    name="end_date"
                    value={form.end_date}
                    onChange={handleChange}
                    placeholder="DD/MM/AAAA"
                    maxLength={10}
                    className="date-input"
                    onFocus={() => openPicker('end')}
                  />
                  <input
                    ref={hiddenEndRef}
                    type="date"
                    onChange={(e) => handleHiddenChange(e, 'end')}
                    style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
                    aria-hidden="true"
                    tabIndex={-1}
                  />
                </div>
                <button
                  type="button"
                  aria-label="Abrir calendário término"
                  onClick={() => openPicker('end')}
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
