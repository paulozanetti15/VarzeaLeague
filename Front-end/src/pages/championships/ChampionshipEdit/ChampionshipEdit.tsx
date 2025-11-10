import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getChampionshipById, updateChampionship, uploadChampionshipLogo } from '../../../services/championships.service';
import trophy from '../../../assets/championship-trophy.svg';
import '../ChampionshipForm.css';
import { format, parse, isValid, isAfter } from 'date-fns';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ImageIcon from '@mui/icons-material/Image';
import { getChampionshipLogoUrl } from '../../../config/api';

const initialState = {
  name: '',
  description: '',
  start_date: '',
  end_date: '',
  modalidade: '',
  nomequadra: '',
};

const ChampionshipEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{[k:string]: string}>({});
  const hiddenStartRef = useRef<HTMLInputElement>(null);
  const hiddenEndRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchChampionship = async () => {
      try {
        const data = await getChampionshipById(Number(id));
        setForm({
          name: data.name,
          description: data.description || '',
          start_date: data.start_date ? format(new Date(data.start_date), 'dd/MM/yyyy') : '',
          end_date: data.end_date ? format(new Date(data.end_date), 'dd/MM/yyyy') : '',
          modalidade: data.modalidade || '',
          nomequadra: data.nomequadra || '',
        });
        
        // Carregar logo atual se existir
        if (data.logo) {
          const logoUrl = getChampionshipLogoUrl(data.logo);
          setCurrentLogoUrl(logoUrl);
          setLogoPreview(logoUrl);
        }
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar campeonato');
      } finally {
        setLoadingData(false);
      }
    };

    fetchChampionship();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

      // Datas obrigatórias
      if (!form.start_date) {
        errors.start_date = 'Informe a data de início';
      }
      if (!form.end_date) {
        errors.end_date = 'Informe a data de término';
      }

      let parsedStartDate: Date | null = null;
      let parsedEndDate: Date | null = null;
      if (form.start_date) {
        const p = parse(form.start_date, 'dd/MM/yyyy', new Date());
        if (!isValid(p)) {
          errors.start_date = 'Data de início inválida';
        } else {
          parsedStartDate = p;
        }
      }
      if (form.end_date) {
        const p = parse(form.end_date, 'dd/MM/yyyy', new Date());
        if (!isValid(p)) {
          errors.end_date = 'Data de término inválida';
        } else {
          parsedEndDate = p;
        }
      }

      // Regras adicionais: término > início
      if (parsedStartDate && parsedEndDate) {
        if (!isAfter(parsedEndDate, parsedStartDate)) {
          errors.end_date = 'Término deve ser após o início';
        }
      }

      if (Object.keys(errors).length) {
        setFieldErrors(errors);
        setError('Corrija os campos destacados.');
        setLoading(false);
        return;
      }

      // Converter datas para o formato ISO antes de enviar
      const formattedData = {
        ...form,
        name: nameTrim,
        nomequadra: nomequadraTrim,
        start_date: format(parsedStartDate as Date, 'yyyy-MM-dd'),
        end_date: format(parsedEndDate as Date, 'yyyy-MM-dd')
      };

      await updateChampionship(Number(id), formattedData);
      
      // Upload do logo se fornecido
      if (logo) {
        try {
          await uploadChampionshipLogo(Number(id), logo);
        } catch (logoErr) {
          console.warn('Erro ao enviar logo, mas campeonato atualizado:', logoErr);
        }
      }
      
      setSuccess('Campeonato atualizado com sucesso!');
      setTimeout(() => navigate(`/championships/${id}`), 1200);
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar campeonato');
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

  const handleLogoClick = () => {
    if (logoInputRef.current) {
      logoInputRef.current.click();
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogo(file);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          setLogoPreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (loadingData) {
    return (
      <div className="championship-form-bg">
        <div className="championship-form-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Carregando campeonato...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="championship-form-bg">
      
      <div className="championship-form-container">
        <div className="championship-form-header">
          <img src={trophy} alt="Troféu" className="championship-form-trophy" />
          <h2>Editar Campeonato</h2>
          <p className="championship-form-subtitle">Atualize os dados do campeonato</p>
        </div>

        <form className="championship-form" onSubmit={handleSubmit}>
          {/* Seção de Upload de Logo */}
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label style={{ marginBottom: '1rem', display: 'block', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#2d3748' }}>
              Logo do Campeonato
            </label>
            <div className="logo-section" style={{ maxWidth: '400px', margin: '0 auto' }}>
              <div className="logo-preview-container" onClick={handleLogoClick}>
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="logo-preview" />
                ) : (
                  <div className="logo-placeholder">
                    <ImageIcon />
                    <span>Adicionar Logo</span>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={logoInputRef}
                  className="hidden-file-input"
                  name="logo" 
                  accept="image/*"
                  onChange={handleLogoChange}
                />
              </div>
              {logo ? (
                <button 
                  type="button"
                  className="update-image-btn"
                  onClick={handleLogoClick}
                >
                  Atualizar Imagem
                </button>
              ) : currentLogoUrl ? (
                <div className="file-status" style={{ color: 'white' }}>
                  Logo atual será mantida
                </div>
              ) : (
                <div className="file-status" style={{ color: 'white' }}>
                  Nenhum arquivo selecionado
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Nome do Campeonato <span className="required-asterisk" aria-hidden="true">*</span></label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Digite o nome do campeonato"
              style={fieldErrors.name ? { borderColor: '#e53935' } : undefined}
              aria-invalid={!!fieldErrors.name}
            />
            {fieldErrors.name && <small style={{ color:'#e53935' }}>{fieldErrors.name}</small>}
          </div>

          <div className="form-group">
            <label>Descrição</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Descrição, regras, premiação..."
              rows={4}
              style={fieldErrors.description ? { borderColor: '#e53935' } : undefined}
              aria-invalid={!!fieldErrors.description}
            />
            {fieldErrors.description && <small style={{ color:'#e53935' }}>{fieldErrors.description}</small>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Modalidade <span className="required-asterisk" aria-hidden="true">*</span></label>
              <select
                name="modalidade"
                value={form.modalidade}
                onChange={handleChange}
                required
                style={fieldErrors.modalidade ? { borderColor: '#e53935' } : undefined}
                aria-invalid={!!fieldErrors.modalidade}
              >
                <option value="">Selecione a modalidade</option>
                <option value="Fut7">Fut7</option>
                <option value="Futsal">Futsal</option>
                <option value="Futebol campo">Futebol campo</option>
              </select>
              {fieldErrors.modalidade && <small style={{ color:'#e53935' }}>{fieldErrors.modalidade}</small>}
            </div>

            <div className="form-group">
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

          <div className="form-row">
            <div className="form-group">
              <label>Data de Início <span className="required-asterisk" aria-hidden="true">*</span></label>
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
            <div className="form-group">
              <label>Data de Término <span className="required-asterisk" aria-hidden="true">*</span></label>
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

          <button
            type="submit"
            className="form-btn"
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Atualizar Campeonato'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChampionshipEdit;