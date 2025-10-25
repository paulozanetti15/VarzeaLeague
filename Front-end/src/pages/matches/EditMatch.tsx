import React, { useState, useRef, useEffect } from 'react';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useNavigate } from 'react-router-dom';
import './CreateMatch.css';
import CircularProgress from '@mui/material/CircularProgress';
import ToastComponent from '../../components/Toast/ToastComponent';
import { format, parse, isValid, isAfter } from 'date-fns';
import axios from 'axios';

interface EditMatchProps {
  title?: string;
  description?: string;
  date?: string;
  time?: string;
  duration?: string;
  price?: string;
  category?: string;
  modalidade?: string;
  nomequadra?: string;
}

// O componente não utiliza props externas; tipagem mantida apenas para consistência
const EditMatch: React.FC<EditMatchProps>  = () => {
  const navigate = useNavigate();
  const titleInputRef = useRef<HTMLInputElement>(null);
  const btnContainerRef = useRef<HTMLDivElement>(null);
  const hiddenDateInputRef = useRef<HTMLInputElement>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastBg, setToastBg] = useState('');
  const [dadosPartida, setDadosPartida] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [changed, setChanged] = useState(false);
  const [initialData, setInitialData] = useState<EditMatchProps>({
    title: '',
    description: '',
    date: format(new Date(), 'dd/MM/yyyy'),
    time: format(new Date(), 'HH:mm'),
    duration: '',
    price: '',
    category: '',
    modalidade:'',
    nomequadra:''
  });
  const [formData, setFormData] = useState<EditMatchProps>({
    title: '',
    description: '',
    date: format(new Date(), 'dd/MM/yyyy'),
    time: format(new Date(), 'HH:mm'),
    duration: '',
    price: '',
    category: '',
    modalidade:'',
    nomequadra:''
  });
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'number') {
      setFormData(prev => ({
        ...prev,
        number: value
      }));
    }  

    if (name === 'date') {
      const dateRegex = /^(\d{0,2})\/(\d{0,2})\/(\d{0,4})$/;
      let formattedDate = value.replace(/\D/g, '');
      
      if (formattedDate.length <= 8) {
        if (formattedDate.length > 4) {
          formattedDate = formattedDate.replace(/(\d{2})(\d{2})(\d{0,4})/, '$1/$2/$3');
        } else if (formattedDate.length > 2) {
          formattedDate = formattedDate.replace(/(\d{2})(\d{0,2})/, '$1/$2');
        }

        if (dateRegex.test(formattedDate) || formattedDate.length < 10) {
          setFormData(prev => ({
            ...prev,
            [name]: formattedDate
          }));
        }
      }
      return;
    }

    if (name === 'time') {
      const timeRegex = /^(\d{0,2}):?(\d{0,2})$/;
      let formattedTime = value.replace(/\D/g, '');
      
      if (formattedTime.length <= 4) {
        if (formattedTime.length > 2) {
          formattedTime = formattedTime.replace(/(\d{2})(\d{0,2})/, '$1:$2');
        }
        
        if (timeRegex.test(formattedTime)) {
          const [hours, minutes] = formattedTime.split(':').map(Number);
          if ((!hours || hours < 24) && (!minutes || minutes < 60)) {
            setFormData(prev => ({
              ...prev,
              [name]: formattedTime
            }));
          }
        }
      }
      return;
    }

    if (name === 'duration') {
      const durationRegex = /^(\d{0,2}):?(\d{0,2})$/;
      let formattedDuration = value.replace(/\D/g, '');
      
      if (formattedDuration.length <= 4) {
        if (formattedDuration.length > 2) {
          formattedDuration = formattedDuration.replace(/(\d{2})(\d{0,2})/, '$1:$2');
        }
        
        if (durationRegex.test(formattedDuration)) {
          const [hours, minutes] = formattedDuration.split(':').map(Number);
          if ((!hours || hours < 24) && (!minutes || minutes < 60)) {
            setFormData(prev => ({
              ...prev,
              [name]: formattedDuration
            }));
          }
        }
      }
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
 
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userType = Number(user.userTypeId);
    
    if (userType !== 1 && userType !== 2) {
      setToastMessage('Você não tem permissão para editar partidas.');
      setToastBg('error');
      setShowToast(true);
      setTimeout(() => {
        navigate('/matches');
      }, 2000);
      return;
    }

    if (titleInputRef.current && btnContainerRef.current) {
      const titleWidth = titleInputRef.current.offsetWidth;
      btnContainerRef.current.style.width = `${titleWidth}px`;
    }
  }, []);

  
  const onLoadData= async () =>{
    try{
      const idMatch = window.location.pathname.split('/').pop();
      const response = await axios.get(`http://localhost:3001/api/matches/${idMatch}`,{
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const matchData = response.data;
      setDadosPartida(matchData);
      
      const formattedData = {
        title: matchData.title || '',
        description: matchData.description || '',
        date: matchData.date ? format(new Date(matchData.date), 'dd/MM/yyyy') : '',
        time: matchData.date ? format(new Date(matchData.date), 'HH:mm') : '',
        duration: matchData.duration || '',
        price: matchData.price ? String(matchData.price) : '',
        category: matchData.category || '',
        modalidade: matchData.modalidade || '',
        nomequadra: matchData.nomequadra || '',
      };
      
      setFormData(formattedData);
      setInitialData(formattedData);
    } catch (error) {
      console.error('Erro ao carregar dadosPartida do atleta:', error);
      setToastMessage('Erro ao carregar dados da partida');
      setToastBg('danger');
      setShowToast(true);
    }
  }
  
  useEffect(() => {
    onLoadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (!formData.title?.trim()) {
        setError('O título da partida é obrigatório');
        return;
      }

      if (!formData.date || !formData.time) {
        setError('Data e hora são obrigatórios');
        return;
      }

      if (!formData.modalidade || !formData.modalidade.trim()) {
        setError('Modalidade é obrigatória');
        return;
      }

      if (!formData.nomequadra || !formData.nomequadra.trim()) {
        setError('Nome da quadra é obrigatório');
        return;
      }

      const parsedDate = parse(formData.date, 'dd/MM/yyyy', new Date());
      if (!isValid(parsedDate)) {
        setError('Data inválida. Use o formato DD/MM/AAAA');
        setLoading(false);
        return;
      }

      const [hours, minutes] = formData.time.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes) || hours > 23 || minutes > 59) {
        setError('Hora inválida. Use o formato HH:MM');
        setLoading(false);
        return;
      }

      if (formData.duration) {
        const [durationHours, durationMinutes] = formData.duration.split(':').map(Number);
        if (isNaN(durationHours) || isNaN(durationMinutes) || durationHours > 23 || durationMinutes > 59) {
          setError('Duração inválida. Use o formato HH:MM');
          setLoading(false);
          return;
        }
      }

      const matchDateTime = parse(
        `${formData.date} ${formData.time}`,
        'dd/MM/yyyy HH:mm',
        new Date()
      );
      
      if (!isAfter(matchDateTime, new Date())) {
        setError('A data da partida deve ser futura');
        return;
      }
    
      if (formData.price && parseFloat(formData.price) < 0) {
        setError('O preço não pode ser negativo');
        return;
      }


      const matchData = {
        title: formData.title.trim(),
        date: format(matchDateTime, "yyyy-MM-dd'T'HH:mm:ss"),
        description: formData.description?.trim(),
        duration: formData.duration,
        price: formData.price ? parseFloat(formData.price) : 0.00,
        namequadra: (formData.nomequadra ?? '').trim(),
        modalidade: (formData.modalidade ?? '').trim(),
      };

      const response=await axios.put(`http://localhost:3001/api/matches/${dadosPartida.id}`, matchData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.status === 200) {
        setToastMessage('Partida atualizada com sucesso!') 
        setToastBg('success');
        setShowToast(true);
      }
      setTimeout(() => {
        navigate('/matches');
      }, 5000);
    } catch (err: any) {
      setError('Erro ao atualizar partida. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const isChanged = JSON.stringify(initialData) !== JSON.stringify(formData);
    setChanged(isChanged);
  }, [initialData, formData]);
  return (
    <div className="create-match-container">
      {showToast && (
        <ToastComponent
          message={toastMessage}
          bg={toastBg}
          onClose={() => setShowToast(false)}
        />
      )}
      <div className="form-container">
        <h1 className="form-title">
          Editar Partida
        </h1>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} style={{width: '100%'}}> 
            <div className="form-group">
              <label>Título da Partida <span className="required-asterisk" aria-hidden="true">*</span></label>
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

            <div className="form-group">
              <label>Descrição</label>
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
                <label htmlFor="date">Data <span className="required-asterisk" aria-hidden="true">*</span></label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <input
                      type="text"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      className="form-control"
                      placeholder="DD/MM/AAAA"
                      maxLength={10}
                      onFocus={() => {
                        const el = hiddenDateInputRef.current; if (!el) return; 
                        if (formData.date && formData.date.length === 10) {
                          const [d,m,y] = formData.date.split('/');
                          el.value = `${y}-${m}-${d}`;
                        }
                        const anyEl:any = el; if (typeof anyEl.showPicker === 'function') { anyEl.showPicker(); } else { el.click(); }
                      }}
                    />
                    <input
                      ref={hiddenDateInputRef}
                      type="date"
                      onChange={(e) => {
                        const iso = e.target.value; if(!iso) return; const [y,m,d] = iso.split('-');
                        setFormData(prev => ({ ...prev, date: `${d}/${m}/${y}` }));
                      }}
                      style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
                      aria-hidden="true"
                      tabIndex={-1}
                    />
                  </div>
                  <button
                    type="button"
                    aria-label="Abrir calendário"
                    onClick={() => {
                      const el = hiddenDateInputRef.current; if (!el) return; 
                      if (formData.date && formData.date.length === 10) {
                        const [d,m,y] = formData.date.split('/');
                        el.value = `${y}-${m}-${d}`;
                      }
                      const anyEl:any = el; if (typeof anyEl.showPicker === 'function') { anyEl.showPicker(); } else { el.click(); }
                    }}
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
              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="time">Horário <span className="required-asterisk" aria-hidden="true">*</span></label>
                <input
                  type="text"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                  placeholder="HH:MM"
                  maxLength={5}
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="duration">Duração</label>
                <input
                  type="text"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="HH:MM"
                  maxLength={5}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Preço (opcional)</label>
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
            <div className="form-group">
              <label>Nome da Quadra <span className="required-asterisk" aria-hidden="true">*</span></label>
              <input
                name="nomequadra"
                type='text'
                className='form-control'
                value={formData.nomequadra}
                onChange={(e) => setFormData(prev => ({ ...prev, nomequadra: e.target.value }))}
                placeholder="Ex: Arena Central"
                required
              />
            </div>
            <div className="form-group">
              <label>Modalidade <span className="required-asterisk" aria-hidden="true">*</span></label>
              <select 
                style={{            
                  color: '#0e0202ff',
                  WebkitTextFillColor: '#f7f6f6ff',
                  fontSize: '1rem',
                }}
                name="modalidade"
                onChange={handleSelectChange}
                value={formData.modalidade}
              >
                <option value="">Selecione a modalidade</option>
                <option value="Fut7">Fut7</option>
                <option value="Futsal">Futsal</option>
                <option value="Futebol campo">Futebol campo</option>
              </select> 
            </div>
          </div>  
          <div className="btn-container" ref={btnContainerRef}>
            <button
              type="submit"
              className="submit-btn"
              disabled={!changed || loading}
              style={{
                background: changed ? '#1976d2' : '#90caf9',
                border: 'none',
                color: '#fff',
                fontWeight: 600,
                padding: '12px 20px',
                borderRadius: 10,
                cursor: changed ? 'pointer' : 'not-allowed',
                transition: 'background .25s',
                boxShadow: '0 3px 10px rgba(25,118,210,0.3)'
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
                ) : (
                  'Atualizar Partida'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMatch;