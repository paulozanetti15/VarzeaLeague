import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import trophy from '../../assets/championship-trophy.svg';
import './ChampionshipForm.css';
import { format, parse, isValid } from 'date-fns';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupsIcon from '@mui/icons-material/Groups';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import { IconButton } from '@mui/material';

interface ChampionshipFormData {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  modalidade: string;
  nomequadra: string;
  tipo: 'liga' | 'mata-mata' | '';
  fase_grupos: boolean;
  max_teams: number;
  genero: string;
  num_grupos?: number;
  times_por_grupo?: number;
  num_equipes_liga?: number;
}

const ChampionshipForm: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{[k:string]: string}>({});
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const [currentStartMonth, setCurrentStartMonth] = useState(new Date());
  const [currentEndMonth, setCurrentEndMonth] = useState(new Date());
  const startCalendarRef = useRef<HTMLDivElement>(null);
  const endCalendarRef = useRef<HTMLDivElement>(null);

  // Fechar calendário quando clicar fora
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      if (startCalendarRef.current && !startCalendarRef.current.contains(target)) {
        setShowStartCalendar(false);
      }
      
      if (endCalendarRef.current && !endCalendarRef.current.contains(target)) {
        setShowEndCalendar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const [formData, setFormData] = useState<ChampionshipFormData>({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    modalidade: '',
    nomequadra: '',
    tipo: '',
    fase_grupos: false,
    max_teams: 8,
    genero: '',
    num_grupos: undefined,
    times_por_grupo: undefined,
    num_equipes_liga: undefined
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'fase_grupos') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));

    // Limpar erro do campo quando o usuário começar a digitar
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleDateSelect = (date: string, field: 'start_date' | 'end_date') => {
    console.log('=== HANDLE DATE SELECT ===');
    console.log('Received date string:', date);
    console.log('Field:', field);
    
    // Verificar se a data está sendo interpretada corretamente
    const parsedDate = new Date(date);
    console.log('Parsed date:', parsedDate);
    console.log('Parsed date ISO:', parsedDate.toISOString());
    console.log('Parsed date local:', parsedDate.toLocaleDateString());
    
    setFormData(prev => {
      console.log('Previous formData:', prev);
      const newData = {
        ...prev,
        [field]: date
      };
      console.log('New formData:', newData);
      return newData;
    });
    
    setShowStartCalendar(false);
    setShowEndCalendar(false);
    
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const navigateMonth = (direction: 'prev' | 'next', field: 'start_date' | 'end_date') => {
    if (field === 'start_date') {
      setCurrentStartMonth(prev => {
        const newDate = new Date(prev);
        newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
        return newDate;
      });
    } else {
      setCurrentEndMonth(prev => {
        const newDate = new Date(prev);
        newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
        return newDate;
      });
    }
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
      const isMinDate = field === 'end_date' && formData.start_date && localDate < new Date(formData.start_date);
      
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

  const validateForm = () => {
    const errors: {[k:string]: string} = {};
    
    if (!formData.name.trim()) errors.name = 'Nome do campeonato é obrigatório';
    if (!formData.description.trim()) errors.description = 'Descrição é obrigatória';
    if (!formData.start_date.trim()) errors.start_date = 'Data de início é obrigatória';
    if (!formData.end_date.trim()) errors.end_date = 'Data de fim é obrigatória';
    if (!formData.modalidade.trim()) errors.modalidade = 'Modalidade é obrigatória';
    if (!formData.nomequadra.trim()) errors.nomequadra = 'Nome da quadra é obrigatório';
    if (!formData.tipo) errors.tipo = 'Tipo do campeonato é obrigatório';
    if (!formData.genero.trim()) errors.genero = 'Gênero é obrigatório';
    if (formData.max_teams < 4) errors.max_teams = 'Mínimo de 4 times';
    if (formData.max_teams > 32) errors.max_teams = 'Máximo de 32 times';

    // Validações específicas por tipo
    if (formData.tipo === 'liga') {
      if (!formData.num_equipes_liga || formData.num_equipes_liga < 4 || formData.num_equipes_liga > 20) {
        errors.num_equipes_liga = 'Para Liga, especifique entre 4 e 20 equipes';
      }
    }

    if (formData.tipo === 'mata-mata' && formData.fase_grupos) {
      if (!formData.num_grupos || formData.num_grupos < 2 || formData.num_grupos > 8) {
        errors.num_grupos = 'Número de grupos deve ser entre 2 e 8';
      }
      if (!formData.times_por_grupo || formData.times_por_grupo < 3 || formData.times_por_grupo > 6) {
        errors.times_por_grupo = 'Times por grupo deve ser entre 3 e 6';
      }
      // Validar se o total de times não excede o máximo
      const totalTimes = (formData.num_grupos || 0) * (formData.times_por_grupo || 0);
      if (totalTimes > formData.max_teams) {
        errors.times_por_grupo = `Total de times (${totalTimes}) excede o máximo permitido (${formData.max_teams})`;
      }
    }

    // Validar datas
    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      
      if (isNaN(startDate.getTime())) {
        errors.start_date = 'Data de início inválida';
      }
      if (isNaN(endDate.getTime())) {
        errors.end_date = 'Data de fim inválida';
      }
      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && startDate >= endDate) {
        errors.end_date = 'Data de fim deve ser posterior à data de início';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Por favor, corrija os erros no formulário');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const submitData = {
        ...formData,
        start_date: formData.start_date,
        end_date: formData.end_date
      };

      await api.post('/championships', submitData);
      
      setSuccess('Campeonato criado com sucesso!');
      setTimeout(() => {
        navigate('/championships');
      }, 2000);
      
    } catch (err: any) {
      console.error('Erro ao criar campeonato:', err);
      setError(err.response?.data?.message || 'Erro ao criar campeonato');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="championship-form-container">
      <div className="teams-header">
        <h1 className="teams-title">Criar Campeonato</h1>
        <p className="teams-subtitle">
          Crie um campeonato e permita que times se inscrevam para participar
        </p>
      </div>

      <motion.div 
        className="form-container" 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="form-main-grid">
          {/* Seção de Tipo de Campeonato - Lado Esquerdo */}
          <div className="logo-section">
            <div className="logo-preview-container">
              <EmojiEventsIcon className="trophy-icon" />
              <span>Tipo de Campeonato</span>
            </div>
            
            {/* Campo de Descrição movido para baixo da logo */}
            <div className="form-group logo-description">
              <label className="form-label" htmlFor="description">Descrição do Campeonato</label>
              <textarea
                id="description"
                name="description"
                className="form-control"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Descreva o campeonato, regras, premiação e informações importantes"
                required
                rows={11}
              />
              {fieldErrors.description && <span className="field-error">{fieldErrors.description}</span>}
            </div>
          </div>

          {/* Seção de Formulário - Lado Direito */}
          <div className="form-section">
            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
          
              {/* Campos básicos em grid 2 colunas */}
              <div className="form-basic-grid">
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

                <motion.div 
                  className="form-group"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label className="form-label" htmlFor="tipo">Tipo do Campeonato</label>
                  <select
                    id="tipo"
                    name="tipo"
                    className="form-control"
                    value={formData.tipo}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecione o tipo</option>
                    <option value="liga">Liga (Pontos Corridos)</option>
                    <option value="mata-mata">Mata-Mata (Eliminatório)</option>
                  </select>
                  {fieldErrors.tipo && <span className="field-error">{fieldErrors.tipo}</span>}
                </motion.div>
              </div>

              {/* Campos de data em grid 2 colunas */}
              <div className="form-basic-grid">
                <motion.div 
                  className="form-group"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
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
                        console.log('Displaying start_date:', formData.start_date, 'as date:', date);
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
                </motion.div>

                <motion.div 
                  className="form-group"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
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
                        console.log('Displaying end_date:', formData.end_date, 'as date:', date);
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
                </motion.div>
              </div>

              {/* Campos de configuração em grid 2 colunas */}
              <div className="form-basic-grid">
                <motion.div 
                  className="form-group"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
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
                    <option value="Futsal">Futsal</option>
                    <option value="Society">Society</option>
                    <option value="Futebol 11">Futebol 11</option>
                  </select>
                  {fieldErrors.modalidade && <span className="field-error">{fieldErrors.modalidade}</span>}
                </motion.div>

                <motion.div 
                  className="form-group"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="form-label" htmlFor="nomequadra">Nome da Quadra</label>
                  <input
                    type="text"
                    id="nomequadra"
                    name="nomequadra"
                    className="form-control"
                    value={formData.nomequadra}
                    onChange={handleInputChange}
                    placeholder="Nome da quadra/campo"
                    required
                  />
                  {fieldErrors.nomequadra && <span className="field-error">{fieldErrors.nomequadra}</span>}
                </motion.div>
              </div>

              {/* Campos de configuração específicos */}
              <div className="form-basic-grid">
                <motion.div 
                  className="form-group"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <label className="form-label" htmlFor="max_teams">Máximo de Times</label>
                  <input
                    type="number"
                    id="max_teams"
                    name="max_teams"
                    className="form-control"
                    value={formData.max_teams}
                    onChange={handleInputChange}
                    min="4"
                    max="32"
                    required
                  />
                  {fieldErrors.max_teams && <span className="field-error">{fieldErrors.max_teams}</span>}
                </motion.div>

                <motion.div 
                  className="form-group"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="form-label" htmlFor="genero">Gênero</label>
                  <select
                    id="genero"
                    name="genero"
                    className="form-control"
                    value={formData.genero}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecione o gênero</option>
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                    <option value="misto">Misto</option>
                  </select>
                  {fieldErrors.genero && <span className="field-error">{fieldErrors.genero}</span>}
                </motion.div>
              </div>

              {/* Opções específicas para Liga */}
              {formData.tipo === 'liga' && (
                <motion.div 
                  className="liga-options"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                >
                  <div className="form-group">
                    <label className="form-label" htmlFor="num_equipes_liga">Número de Equipes na Liga</label>
                    <input
                      type="number"
                      id="num_equipes_liga"
                      name="num_equipes_liga"
                      className="form-control"
                      value={formData.num_equipes_liga || ''}
                      onChange={handleInputChange}
                      min="4"
                      max="20"
                      placeholder="Ex: 8, 10, 12..."
                    />
                    {fieldErrors.num_equipes_liga && <span className="field-error">{fieldErrors.num_equipes_liga}</span>}
                    <p className="option-description">
                      Especifique quantas equipes participarão do campeonato de pontos corridos
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Opções específicas para Mata-Mata */}
              {formData.tipo === 'mata-mata' && (
                <motion.div 
                  className="mata-mata-options"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                >
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="fase_grupos"
                        checked={formData.fase_grupos}
                        onChange={handleInputChange}
                      />
                      <span className="checkmark"></span>
                      Incluir Fase de Grupos
                    </label>
                    <p className="option-description">
                      Se marcado, os times serão divididos em grupos antes da fase eliminatória
                    </p>
                  </div>

                  {/* Configurações da fase de grupos */}
                  {formData.fase_grupos && (
                    <div className="grupos-config">
                      <h4 className="config-title">Configuração da Fase de Grupos</h4>
                      
                      <div className="form-basic-grid">
                        <motion.div 
                          className="form-group"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                        >
                          <label className="form-label" htmlFor="num_grupos">Número de Grupos</label>
                          <input
                            type="number"
                            id="num_grupos"
                            name="num_grupos"
                            className="form-control"
                            value={formData.num_grupos || ''}
                            onChange={handleInputChange}
                            min="2"
                            max="8"
                            placeholder="Ex: 2, 4, 8..."
                          />
                          {fieldErrors.num_grupos && <span className="field-error">{fieldErrors.num_grupos}</span>}
                        </motion.div>

                        <motion.div 
                          className="form-group"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.55 }}
                        >
                          <label className="form-label" htmlFor="times_por_grupo">Times por Grupo</label>
                          <input
                            type="number"
                            id="times_por_grupo"
                            name="times_por_grupo"
                            className="form-control"
                            value={formData.times_por_grupo || ''}
                            onChange={handleInputChange}
                            min="3"
                            max="6"
                            placeholder="Ex: 3, 4, 5..."
                          />
                          {fieldErrors.times_por_grupo && <span className="field-error">{fieldErrors.times_por_grupo}</span>}
                        </motion.div>
                      </div>

                      {/* Preview da configuração */}
                      {formData.num_grupos && formData.times_por_grupo && (
                        <div className="config-preview">
                          <div className="preview-card">
                            <h5>📊 Resumo da Configuração</h5>
                            <div className="preview-stats">
                              <span className="stat">
                                <strong>{formData.num_grupos}</strong> grupos
                              </span>
                              <span className="stat">
                                <strong>{formData.times_por_grupo}</strong> times por grupo
                              </span>
                              <span className="stat total">
                                <strong>{formData.num_grupos * formData.times_por_grupo}</strong> times total
                              </span>
                            </div>
                            <p className="preview-description">
                              Os times serão divididos em {formData.num_grupos} grupos de {formData.times_por_grupo} times cada.
                              Os primeiros colocados de cada grupo avançarão para a fase eliminatória.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              <div className="form-buttons">
                <motion.button 
                  type="submit"
                  className="submit-btn"
                  disabled={loading}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {loading ? (
                    <span className="loading-text">Criando...</span>
                  ) : (
                    'Criar Campeonato'
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ChampionshipForm;