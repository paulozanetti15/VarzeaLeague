import React, { useState, useRef, useEffect } from 'react';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useNavigate } from 'react-router-dom';
import './CreateMatch.css';
import CircularProgress from '@mui/material/CircularProgress';
import ToastComponent from '../../components/Toast/ToastComponent';
import { useMatchForm } from '../../hooks/useMatchOperations';

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
  
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastBg, setToastBg] = useState('');
  const hiddenDateInputRef = useRef<HTMLInputElement>(null);

  const idMatch = window.location.pathname.split('/').pop();
  const {
    formData,
    setFormData,
    handleInputChange,
    handleSelectChange,
    loading,
    error,
    changed,
    submitForm
  } = useMatchForm(idMatch || undefined);
  // handlers are provided by the hook: handleInputChange, handleSelectChange
 
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

  
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await submitForm(idMatch || undefined);
    if (result.success) {
      setToastMessage('Partida atualizada com sucesso!');
      setToastBg('success');
      setShowToast(true);
      setTimeout(() => navigate('/matches'), 2000);
    } else {
      setToastMessage('Erro ao atualizar partida. Tente novamente.');
      setToastBg('danger');
      setShowToast(true);
    }
  };
  
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