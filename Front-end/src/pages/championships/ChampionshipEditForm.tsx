import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';
import trophy from '../../assets/championship-trophy.svg';
import './ChampionshipForm.css';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { parse, isValid, isAfter } from 'date-fns';

const ChampionshipEditForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    modalidade: '',
    nomequadra: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{[k:string]: string}>({});
  const navigate = useNavigate();

  const hiddenStartRef = useRef<HTMLInputElement>(null);
  const hiddenEndRef = useRef<HTMLInputElement>(null);

  const isoToBR = (raw: string): string => {
    if (!raw) return '';
    // Accept formats: "YYYY-MM-DD", "YYYY-MM-DDTHH:MM:SS", "YYYY-MM-DD HH:MM:SS"
    let datePart = raw.trim();
    if (datePart.includes('T')) {
      datePart = datePart.split('T')[0];
    } else if (datePart.includes(' ')) {
      // e.g. 2025-09-17 00:00:00
      datePart = datePart.split(' ')[0];
    } else if (datePart.includes('/')) {
      // Already in some unexpected format like '17 00:00:00/09/2025'
      // Attempt to sanitize by removing time fragments between day and month
      // Pattern: DD (space) HH:MM:SS/MM/YYYY -> remove everything after first space until first '/'
      const weirdMatch = datePart.match(/^(\d{1,2})\s+\d{2}:\d{2}:\d{2}\/(\d{2})\/(\d{4})$/);
      if (weirdMatch) {
        const [, d, m, y] = weirdMatch;
        return `${d.padStart(2,'0')}/${m}/${y}`;
      }
      return raw; // fallback pass-through
    }
    const parts = datePart.split('-');
    if (parts.length !== 3) return '';
    const [y, m, d] = parts;
    if (!y || !m || !d) return '';
    return `${d.padStart(2,'0')}/${m.padStart(2,'0')}/${y}`;
  };

  const brToISO = (br: string): string => {
    if (!br) return '';
    const [d, m, y] = br.split('/');
    return `${y}-${m}-${d}`;
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
    const iso = e.target.value; if(!iso) return; const [y,m,d] = iso.split('-');
    const br = `${d}/${m}/${y}`;
    setForm(prev => ({ ...prev, [which === 'start' ? 'start_date' : 'end_date']: br }));
  };

  useEffect(() => {
    const fetchChampionship = async () => {
      try {
        setLoading(true);
        const data = await api.championships.getById(Number(id));
        setForm({
          name: data.name || '',
          description: data.description || '',
          start_date: isoToBR(data.start_date),
          end_date: isoToBR(data.end_date),
          modalidade: data.modalidade || '',
          nomequadra: data.nomequadra || '',
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'start_date' || name === 'end_date') {
      const dateRegex = /^(\d{0,2})\/(\d{0,2})\/(\d{0,4})$/;
      let formattedDate = value.replace(/\D/g, '');
      if (formattedDate.length <= 8) {
        if (formattedDate.length > 4) {
          formattedDate = formattedDate.replace(/(\d{2})(\d{2})(\d{0,4})/, '$1/$2/$3');
        } else if (formattedDate.length > 2) {
          formattedDate = formattedDate.replace(/(\d{2})(\d{0,2})/, '$1/$2');
        }
        if (dateRegex.test(formattedDate) || formattedDate.length < 10) {
          setForm(prev => ({ ...prev, [name]: formattedDate }));
        }
      }
      return;
    }
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    setFieldErrors({});

    try {
      const errors: {[k:string]: string} = {};
      const nameTrim = form.name.trim();
      if (!nameTrim) {
        errors.name = 'Informe o nome do campeonato';
      } else if (nameTrim.length < 3) {
        errors.name = 'Nome muito curto (mín. 3)';
      } else if (nameTrim.length > 100) {
        errors.name = 'Nome muito longo (máx. 100)';
      }

      if (form.description && form.description.length > 1000) {
        errors.description = 'Descrição excede 1000 caracteres';
      }

      // Modalidade obrigatória
      if (!form.modalidade) {
        errors.modalidade = 'Selecione a modalidade';
      }

      // Quadra obrigatória
      const nomequadraTrim = form.nomequadra.trim();
      if (!nomequadraTrim) {
        errors.nomequadra = 'Informe o nome da quadra';
      } else if (nomequadraTrim.length < 3) {
        errors.nomequadra = 'Nome muito curto (mín. 3)';
      } else if (nomequadraTrim.length > 100) {
        errors.nomequadra = 'Nome muito longo (máx. 100)';
      }

      if (!form.start_date) errors.start_date = 'Informe a data de início';
      if (!form.end_date) errors.end_date = 'Informe a data de término';

      let parsedStart: Date | null = null;
      let parsedEnd: Date | null = null;
      if (form.start_date) {
        const p = parse(form.start_date, 'dd/MM/yyyy', new Date());
        if (!isValid(p)) {
          errors.start_date = 'Data de início inválida';
        } else { parsedStart = p; }
      }
      if (form.end_date) {
        const p = parse(form.end_date, 'dd/MM/yyyy', new Date());
        if (!isValid(p)) {
          errors.end_date = 'Data de término inválida';
        } else { parsedEnd = p; }
      }

      const normalizeDay = (d: Date) => { const c = new Date(d); c.setHours(0,0,0,0); return c; };
      const today = normalizeDay(new Date());
      if (parsedStart) {
        const ns = normalizeDay(parsedStart);
        if (ns < today) {
          errors.start_date = 'Data de início não pode ser no passado';
        }
      }
      if (parsedStart && parsedEnd) {
        const ns = normalizeDay(parsedStart);
        const ne = normalizeDay(parsedEnd);
        if (ne <= ns) {
          errors.end_date = 'Término deve ser depois do início';
        }
      }
      if (Object.keys(errors).length) {
        setFieldErrors(errors);
        setError('Corrija os campos destacados.');
        setSubmitting(false);
        return;
      }
      const payload = {
        ...form,
        name: nameTrim,
        nomequadra: nomequadraTrim,
        start_date: brToISO(form.start_date),
        end_date: brToISO(form.end_date)
      };
      await api.championships.update(Number(id), payload);
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
          <label>Nome <span className="required-asterisk" aria-hidden="true">*</span></label>
          <input name="name" value={form.name} onChange={handleChange} required placeholder="Nome do campeonato" style={fieldErrors.name ? { borderColor:'#e53935' } : undefined} aria-invalid={!!fieldErrors.name} />
          {fieldErrors.name && <small style={{ color:'#e53935' }}>{fieldErrors.name}</small>}
          
          <label>Descrição</label>
          <textarea name="description" value={form.description} onChange={handleChange} placeholder="Descrição, regras, premiação..." style={fieldErrors.description ? { borderColor:'#e53935' } : undefined} aria-invalid={!!fieldErrors.description} />
          {fieldErrors.description && <small style={{ color:'#e53935' }}>{fieldErrors.description}</small>}

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label>Modalidade <span className="required-asterisk" aria-hidden="true">*</span></label>
              <select
                name="modalidade"
                value={form.modalidade}
                onChange={handleChange}
                required
                className={`styled-select ${fieldErrors.modalidade ? 'error-select' : ''}`}
                aria-invalid={!!fieldErrors.modalidade}
              >
                <option value="">Selecione a modalidade</option>
                <option value="Fut7">Fut7</option>
                <option value="Futsal">Futsal</option>
                <option value="Futebol campo">Futebol campo</option>
              </select>
              {fieldErrors.modalidade && <small style={{ color:'#e53935' }}>{fieldErrors.modalidade}</small>}
            </div>

            <div style={{ flex: 1 }}>
              <label>Nome da Quadra <span className="required-asterisk" aria-hidden="true">*</span></label>
              <input
                type="text"
                name="nomequadra"
                value={form.nomequadra}
                onChange={handleChange}
                placeholder="Ex: Arena Central"
                required
                style={fieldErrors.nomequadra ? { borderColor: '#e53935' } : undefined}
                aria-invalid={!!fieldErrors.nomequadra}
              />
              {fieldErrors.nomequadra && <small style={{ color:'#e53935' }}>{fieldErrors.nomequadra}</small>}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label>Data Início <span className="required-asterisk" aria-hidden="true">*</span></label>
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
                    required
                    style={fieldErrors.start_date ? { borderColor: '#e53935' } : undefined}
                    aria-invalid={!!fieldErrors.start_date}
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
            <div style={{ flex: 1 }}>
              <label>Data Término <span className="required-asterisk" aria-hidden="true">*</span></label>
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
                    required
                    style={fieldErrors.end_date ? { borderColor: '#e53935' } : undefined}
                    aria-invalid={!!fieldErrors.end_date}
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

          {fieldErrors.start_date && <small style={{ color:'#e53935' }}>{fieldErrors.start_date}</small>}
          {fieldErrors.end_date && <small style={{ color:'#e53935' }}>{fieldErrors.end_date}</small>}
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