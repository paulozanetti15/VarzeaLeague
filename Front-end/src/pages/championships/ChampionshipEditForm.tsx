import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getChampionshipById, updateChampionship, uploadChampionshipLogo } from '../../services/championships.service';
import trophy from '../../assets/championship-trophy.svg';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ImageIcon from '@mui/icons-material/Image';
import { format } from 'date-fns';
import './ChampionshipForm.css';

interface ChampionshipFormData {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  modalidade: string;
  nomequadra: string;
}

const ChampionshipEditForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<ChampionshipFormData>({
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
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  
  // Estados para calendário customizado
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const [currentStartMonth, setCurrentStartMonth] = useState(new Date());
  const [currentEndMonth, setCurrentEndMonth] = useState(new Date());
  
  const startCalendarRef = useRef<HTMLDivElement>(null);
  const endCalendarRef = useRef<HTMLDivElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(null);

  // Carregar dados do campeonato
  useEffect(() => {
    const fetchChampionship = async () => {
      try {
        setLoading(true);
        const data = await getChampionshipById(Number(id));
        setFormData({
          name: data.name || '',
          description: data.description || '',
          start_date: data.start_date ? format(new Date(data.start_date), 'yyyy-MM-dd') : '',
          end_date: data.end_date ? format(new Date(data.end_date), 'yyyy-MM-dd') : '',
          modalidade: data.modalidade || '',
          nomequadra: data.nomequadra || '',
        });
        
        // Configurar meses iniciais do calendário
        if (data.start_date) {
          setCurrentStartMonth(new Date(data.start_date));
        }
        if (data.end_date) {
          setCurrentEndMonth(new Date(data.end_date));
        }
        
        // Carregar logo atual se existir
        if (data.logo) {
          const logoUrl = data.logo.startsWith('/uploads') 
            ? `http://localhost:3001${data.logo}`
            : `http://localhost:3001/uploads/championships/${data.logo}`;
          setCurrentLogoUrl(logoUrl);
          setLogoPreview(logoUrl);
        }
        
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar dados do campeonato');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchChampionship();
    }
  }, [id]);

  // Fechar calendários ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (startCalendarRef.current && !startCalendarRef.current.contains(event.target as Node)) {
        setShowStartCalendar(false);
      }
      if (endCalendarRef.current && !endCalendarRef.current.contains(event.target as Node)) {
        setShowEndCalendar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro do campo quando usuário começar a digitar
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDateSelect = (dateString: string, field: 'start_date' | 'end_date') => {
    console.log('Selecting date:', dateString, 'for field:', field);
    setFormData(prev => ({ ...prev, [field]: dateString }));
    
    if (field === 'start_date') {
      setShowStartCalendar(false);
      // Se a data de fim for anterior à nova data de início, limpar data de fim
      if (formData.end_date && dateString > formData.end_date) {
        setFormData(prev => ({ ...prev, end_date: '' }));
      }
    } else {
      setShowEndCalendar(false);
    }
  };

  const handleLogoClick = () => {
    if (logoInputRef.current) {
      logoInputRef.current.click();
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log('Arquivo selecionado:', file.name, file.size, file.type);
      setLogo(file);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          setLogoPreview(event.target.result as string);
        }
      };
      reader.onerror = (error) => {
        console.error('Erro ao ler arquivo:', error);
      };
      reader.readAsDataURL(file);
    } else {
      console.log('Nenhum arquivo selecionado');
    }
  };

  const navigateMonth = (direction: 'prev' | 'next', field: 'start_date' | 'end_date') => {
    const currentDate = field === 'start_date' ? currentStartMonth : currentEndMonth;
    const setCurrentMonth = field === 'start_date' ? setCurrentStartMonth : setCurrentEndMonth;
    
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentMonth(newDate);
  };

  const generateCalendar = (currentDate: Date, selectedDate: string, field: 'start_date' | 'end_date') => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Primeiro dia do mês atual
    const firstDay = new Date(year, month, 1);

    // Calcular o primeiro domingo da primeira semana visível
    const dayOfWeek = firstDay.getDay(); // 0 = domingo, 1 = segunda, etc.
    const firstSunday = new Date(year, month, 1 - dayOfWeek);

    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Gerar 42 dias (6 semanas)
    for (let i = 0; i < 42; i++) {
      // Criar data usando UTC para evitar problemas de timezone
      const dayDate = new Date(firstSunday.getTime() + (i * 24 * 60 * 60 * 1000));

      // Forçar timezone local
      const localDate = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate());

      const dateString = format(localDate, 'yyyy-MM-dd');
      const isCurrentMonth = localDate.getMonth() === month;
      const isToday = localDate.getTime() === today.getTime();
      const isSelected = dateString === selectedDate;
      const isPast = localDate < today && !isToday;
      const isMinDate = field === 'end_date' && formData.start_date ? localDate < new Date(formData.start_date) : false;

      days.push(
        <button
          key={`${field}-${i}-${localDate.getDate()}-${localDate.getMonth()}`}
          type="button"
          className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${isPast || isMinDate ? 'disabled' : ''}`}
          onClick={() => {
            if (!isPast && !isMinDate) {
              console.log('Clicking date object:', localDate);
              console.log('Clicking date string:', dateString);
              console.log('Field:', field);
              console.log('Formatted for display:', format(localDate, 'dd/MM/yyyy'));
              handleDateSelect(dateString, field);
            }
          }}
          disabled={isPast || isMinDate}
        >
          {localDate.getDate()}
        </button>
      );
    }

    return days;
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      errors.name = 'Nome é obrigatório';
    }

    if (!formData.modalidade) {
      errors.modalidade = 'Modalidade é obrigatória';
    }

    if (!formData.nomequadra.trim()) {
      errors.nomequadra = 'Nome da quadra é obrigatório';
    }

    if (!formData.start_date) {
      errors.start_date = 'Data de início é obrigatória';
    } else {
      const startDate = new Date(formData.start_date);
      if (isNaN(startDate.getTime())) {
        errors.start_date = 'Data de início inválida';
      }
    }

    if (!formData.end_date) {
      errors.end_date = 'Data de fim é obrigatória';
    } else {
      const endDate = new Date(formData.end_date);
      if (isNaN(endDate.getTime())) {
        errors.end_date = 'Data de fim inválida';
      } else if (formData.start_date) {
        const startDate = new Date(formData.start_date);
        if (endDate <= startDate) {
          errors.end_date = 'Data de fim deve ser posterior à data de início';
        }
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    console.log('=== INICIANDO SUBMIT ===');
    console.log('Logo state:', logo);
    console.log('Logo preview:', logoPreview ? 'existe' : 'não existe');
    console.log('Current logo URL:', currentLogoUrl);

    try {
      setSubmitting(true);
      setError('');
      
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        modalidade: formData.modalidade,
        nomequadra: formData.nomequadra.trim(),
        start_date: formData.start_date,
        end_date: formData.end_date,
      };

      await updateChampionship(Number(id), payload);
      
      // Upload do logo se fornecido
      if (logo) {
        console.log('Fazendo upload do logo:', logo.name, logo.size, logo.type);
        try {
          const uploadResult = await uploadChampionshipLogo(Number(id), logo);
          console.log('Upload do logo concluído:', uploadResult);
        } catch (logoErr: any) {
          console.error('Erro ao enviar logo:', logoErr);
          const errorMessage = logoErr?.response?.data?.message || logoErr?.message || 'Erro desconhecido ao fazer upload do logo';
          setError(`Campeonato atualizado, mas houve um erro ao atualizar a logo: ${errorMessage}`);
          return;
        }
      } else {
        console.log('Nenhuma logo para fazer upload - logo state é:', logo);
      }
      
      setSuccess('Campeonato atualizado com sucesso!');
      
      setTimeout(() => {
        navigate(`/championships/${id}`);
      }, 1500);
      
    } catch (err: any) {
      console.error('Erro ao atualizar campeonato:', err);
      setError(err.message || 'Erro ao atualizar campeonato');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="championship-form-bg">
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
    <div className="championship-form-bg">
      <div className="championship-form-container">
        <div className="championship-form-header">
          <img src={trophy} alt="Troféu" className="championship-form-trophy" />
          <h1 className="championship-form-title">Editar Campeonato</h1>
          <p className="championship-form-subtitle">Atualize as informações do seu campeonato</p>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="success-message">
            <p>{success}</p>
          </div>
        )}

        <motion.div 
          className="form-container" 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="form-main-grid">
            {/* Seção de Upload de Logo - Lado Esquerdo */}
            <div className="logo-section">
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
                  Trocar Imagem
                </button>
              ) : currentLogoUrl ? (
                <div className="file-status">
                  Logo atual será mantida (clique na imagem para trocar)
                </div>
              ) : (
                <div className="file-status">
                  Nenhum arquivo selecionado
                </div>
              )}
              
              {/* Campo de Descrição movido para baixo da logo */}
              <div className="form-group logo-description">
                <label className="form-label" htmlFor="description">Descrição do Campeonato</label>
                <textarea
                  id="description"
                  name="description"
                  className="form-control"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Descreva o campeonato, regras, premiação, etc."
                  rows={11}
                />
                {fieldErrors.description && <span className="field-error">{fieldErrors.description}</span>}
              </div>
            </div>

            {/* Seção de Formulário - Lado Direito */}
            <div className="form-section">
              <form onSubmit={handleSubmit}>
                <motion.div
                  className="form-group"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                >
                  <label className="form-label" htmlFor="name">Nome do Campeonato</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="form-control"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Digite o nome do campeonato"
                    required
                  />
                  {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
                </motion.div>

                <div className="form-row">
                  <motion.div
                    className="form-group"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label className="form-label" htmlFor="modalidade">Modalidade</label>
                    <select
                      id="modalidade"
                      name="modalidade"
                      className="form-control"
                      value={formData.modalidade}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Selecione a modalidade</option>
                      <option value="Fut7">Fut7</option>
                      <option value="Futsal">Futsal</option>
                      <option value="Futebol campo">Futebol campo</option>
                    </select>
                    {fieldErrors.modalidade && <span className="field-error">{fieldErrors.modalidade}</span>}
                  </motion.div>

                  <motion.div
                    className="form-group"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 }}
                  >
                    <label className="form-label" htmlFor="nomequadra">Nome da Quadra</label>
                    <input
                      type="text"
                      id="nomequadra"
                      name="nomequadra"
                      className="form-control"
                      value={formData.nomequadra}
                      onChange={handleInputChange}
                      placeholder="Ex: Arena Central"
                      required
                    />
                    {fieldErrors.nomequadra && <span className="field-error">{fieldErrors.nomequadra}</span>}
                  </motion.div>
                </div>

                <div className="form-row">
                  <motion.div
                    className="form-group"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.14 }}
                  >
                    <label className="form-label" htmlFor="start_date">Data de Início</label>
                    <div className="date-input-container" ref={startCalendarRef}>
                      <input
                        type="text"
                        id="start_date"
                        name="start_date"
                        className="form-control date-input"
                        value={formData.start_date ? (() => {
                          const date = new Date(formData.start_date);
                          return format(date, 'dd/MM/yyyy');
                        })() : ''}
                        placeholder="Selecione a data de início"
                        readOnly
                        onClick={() => setShowStartCalendar(!showStartCalendar)}
                      />
                      <CalendarMonthIcon className="date-icon" onClick={() => setShowStartCalendar(!showStartCalendar)} />

                      {showStartCalendar && (
                        <div className="custom-calendar">
                          <div className="calendar-header">
                            <button type="button" className="nav-btn" onClick={() => navigateMonth('prev', 'start_date')}>
                              ‹
                            </button>
                            <div className="calendar-month-year">
                              {format(currentStartMonth, 'MMMM yyyy')}
                            </div>
                            <button type="button" className="nav-btn" onClick={() => navigateMonth('next', 'start_date')}>
                              ›
                            </button>
                            <button type="button" className="close-btn" onClick={() => setShowStartCalendar(false)}>×</button>
                          </div>
                          <div className="calendar-body">
                            <div className="calendar-weekdays">
                              <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
                            </div>
                            <div className="calendar-days">
                              {generateCalendar(currentStartMonth, formData.start_date, 'start_date')}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    {fieldErrors.start_date && <span className="field-error">{fieldErrors.start_date}</span>}
                  </motion.div>

                  <motion.div
                    className="form-group"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.16 }}
                  >
                    <label className="form-label" htmlFor="end_date">Data de Fim</label>
                    <div className="date-input-container" ref={endCalendarRef}>
                      <input
                        type="text"
                        id="end_date"
                        name="end_date"
                        className="form-control date-input"
                        value={formData.end_date ? (() => {
                          const date = new Date(formData.end_date);
                          return format(date, 'dd/MM/yyyy');
                        })() : ''}
                        placeholder="Selecione a data de fim"
                        readOnly
                        onClick={() => setShowEndCalendar(!showEndCalendar)}
                      />
                      <CalendarMonthIcon className="date-icon" onClick={() => setShowEndCalendar(!showEndCalendar)} />

                      {showEndCalendar && (
                        <div className="custom-calendar">
                          <div className="calendar-header">
                            <button type="button" className="nav-btn" onClick={() => navigateMonth('prev', 'end_date')}>
                              ‹
                            </button>
                            <div className="calendar-month-year">
                              {format(currentEndMonth, 'MMMM yyyy')}
                            </div>
                            <button type="button" className="nav-btn" onClick={() => navigateMonth('next', 'end_date')}>
                              ›
                            </button>
                            <button type="button" className="close-btn" onClick={() => setShowEndCalendar(false)}>×</button>
                          </div>
                          <div className="calendar-body">
                            <div className="calendar-weekdays">
                              <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
                            </div>
                            <div className="calendar-days">
                              {generateCalendar(currentEndMonth, formData.end_date, 'end_date')}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    {fieldErrors.end_date && <span className="field-error">{fieldErrors.end_date}</span>}
                  </motion.div>
                </div>

                <motion.div
                  className="form-buttons"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 }}
                >
                  <button type="submit" className="submit-btn" disabled={submitting}>
                    {submitting ? (
                      <span className="loading-text">Salvando...</span>
                    ) : (
                      'Atualizar Campeonato'
                    )}
                  </button>
                </motion.div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ChampionshipEditForm;