import React, { useState, useRef } from 'react';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RegrasFormRegisterModal.css';
import ToastComponent from '../../Toast/ToastComponent';
import { format, parse, isValid, isAfter, startOfDay, isBefore } from 'date-fns';

interface RegrasFormRegisterModalProps {
  show: boolean;
  onHide: () => void;
  userId: number;
  partidaDados: any;
}

const RegrasFormRegisterModal: React.FC<RegrasFormRegisterModalProps> = ({ show, onHide, userId, partidaDados }) => {
  const [dataLimite, setDataLimite] = useState<string>(format(new Date(), 'dd/MM/yyyy'));
  const [idadeMinima, setIdadeMinima] = useState<string>("");
  const [idadeMaxima, setIdadeMaxima] = useState<string>("");
  const [genero, setGenero] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastBg, setToastBg] = useState('success');
  const hiddenDateInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleDataLimiteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const dateRegex = /^(\d{0,2})\/(\d{0,2})\/(\d{0,4})$/;
    let formattedDate = value.replace(/\D/g, '');
    
    if (formattedDate.length <= 8) {
      if (formattedDate.length > 4) {
        formattedDate = formattedDate.replace(/(\d{2})(\d{2})(\d{0,4})/, '$1/$2/$3');
      } else if (formattedDate.length > 2) {
        formattedDate = formattedDate.replace(/(\d{2})(\d{0,2})/, '$1/$2');
      }
      
      if (dateRegex.test(formattedDate) || formattedDate.length < 10) {
        setDataLimite(formattedDate);
      }
    }
  };

  // Funções para calendário (mesma abordagem da CreateMatch)
  const formatDateISOToBR = (iso: string): string => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  };

  const handleOpenDatePicker = () => {
    const el = hiddenDateInputRef.current;
    if (!el) return;
    if (dataLimite && dataLimite.length === 10) {
      const [d, m, y] = dataLimite.split('/');
      el.value = `${y}-${m}-${d}`;
    }
    const anyEl = el as any;
    if (typeof anyEl.showPicker === 'function') {
      anyEl.showPicker();
    } else {
      el.click();
    }
  };

  const handleHiddenDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const iso = e.target.value;
    const br = formatDateISOToBR(iso);
    setDataLimite(br);
  };

  const verificarDataLimite = (dataLimite: string, dataPartida: string): boolean => {
    const parsedDataLimite = parse(dataLimite, 'dd/MM/yyyy', new Date());
    const parsedDataPartida = new Date(dataPartida);
    const hoje = startOfDay(new Date());

    if (!isValid(parsedDataLimite)) {
      setError('Data limite inválida. Use o formato DD/MM/AAAA');
      return false;
    }

    // Não permitir data limite no passado
    if (isBefore(parsedDataLimite, hoje)) {
      setError('A data limite não pode ser anterior a hoje');
      return false;
    }

    // Deve ser estritamente anterior à data da partida
    if (!isAfter(parsedDataPartida, parsedDataLimite)) {
      setError('A data limite deve ser anterior à data da partida');
      return false;
    }

    // Também impedir mesma data da partida (caso lógica futura mude o isAfter)
    const mesmaDataDaPartida =
      parsedDataLimite.getFullYear() === parsedDataPartida.getFullYear() &&
      parsedDataLimite.getMonth() === parsedDataPartida.getMonth() &&
      parsedDataLimite.getDate() === parsedDataPartida.getDate();
    if (mesmaDataDaPartida) {
      setError('A data limite não pode ser no mesmo dia da partida');
      return false;
    }

    return true;
  };

  const validarIdades = (): boolean => {
    const minima = parseInt(idadeMinima);
    const maxima = parseInt(idadeMaxima);

    if (isNaN(minima) || minima < 0) {
      setError('A idade mínima deve ser um número positivo');
      return false;
    }

    if (isNaN(maxima) || maxima < 0) {
      setError('A idade máxima deve ser um número positivo');
      return false;
    }

    if (minima > maxima) {
      setError('A idade mínima não pode ser maior que a idade máxima');
      return false;
    }

    if (maxima > 100) {
      setError('A idade máxima não pode ser maior que 100 anos');
      return false;
    }

    return true;
  };

  const insertPartida = async () => {
    if (loading) return;
    setError('');
    
    if (!dataLimite || !verificarDataLimite(dataLimite, partidaDados.date)) {
      return;
    }

    if (!idadeMinima || !idadeMaxima || !validarIdades()) {
      return;
    }

    if (!genero) {
      setError('Por favor, selecione o gênero da partida');
      return;
    }

    try {
      setLoading(true);
      // Criar partida
      const matchResponse = await axios.post(
        "http://localhost:3001/api/matches/",
        partidaDados,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (matchResponse.status === 201) {
        // Criar regras
        const rulesResponse = await axios.post(
          "http://localhost:3001/api/rules/",
          {
            userId: userId,
            partidaId: matchResponse.data.id,
            dataLimite: format(parse(dataLimite, 'dd/MM/yyyy', new Date()), 'yyyy-MM-dd'),
            idadeMinima: parseInt(idadeMinima),
            idadeMaxima: parseInt(idadeMaxima),
            genero: genero
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        if (rulesResponse.status === 201) {
          setToastMessage('Partida criada com sucesso!');
          setToastBg('success');
          setShowToast(true);
          setTimeout(() => {
            navigate('/matches');
          }, 1400);
        }
      }
    } catch (error) {
      console.error('Erro ao criar partida e regras:', error);
      setError('Erro ao criar partida e regras. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showToast && (
        <ToastComponent
          message={toastMessage}
          bg={toastBg}
          onClose={() => setShowToast(false)}
        />
      )}
      <Modal
        show={show}
        onHide={onHide}
        centered
        className="regras-modal"
        backdrop="static"
        keyboard={false}
      >
        <Modal.Body>
          <div className="modal-content-wrapper">
            <div className="modal-header-custom">
              <h2 className="modal-title">Regras da Partida</h2>
              <button onClick={onHide} type="button" className="close-icon-btn" aria-label="Fechar">&times;</button>
            </div>
            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}
            <br/>
            <div className="form-group">
              <label>Data Limite para Inscrição</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    type="text"
                    className="form-control"
                    value={dataLimite}
                    onChange={handleDataLimiteChange}
                    placeholder="DD/MM/AAAA"
                    maxLength={10}
                    required
                    onFocus={handleOpenDatePicker}
                  />
                  <input
                    ref={hiddenDateInputRef}
                    type="date"
                    onChange={handleHiddenDateChange}
                    style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
                    aria-hidden="true"
                    tabIndex={-1}
                  />
                </div>
                <button
                  type="button"
                  aria-label="Abrir calendário"
                  onClick={handleOpenDatePicker}
                  style={{
                    border: 'none',
                    background: '#0d47a1',
                    padding: '6px 10px',
                    cursor: 'pointer',
                    color: '#fff',
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 40
                  }}
                >
                  <CalendarMonthIcon fontSize="small" />
                </button>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Idade Mínima</label>
                <input
                  type="number"
                  className="form-control"
                  value={idadeMinima}
                  onChange={(e) => setIdadeMinima(e.target.value)}
                  min="0"
                  max="100"
                  required
                  placeholder="Ex: 18"
                />
              </div>
              <div className="form-group">
                <label>Idade Máxima</label>
                <input
                  type="number"
                  className="form-control"
                  value={idadeMaxima}
                  onChange={(e) => setIdadeMaxima(e.target.value)}
                  min="0"
                  max="100"
                  required
                  placeholder="Ex: 35"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Gênero</label>
              <select
                className="form-control"
                value={genero}
                onChange={(e) => setGenero(e.target.value)}
                required
              >
                <option value="">Selecione o gênero</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Ambos">Ambos</option>
              </select>
            </div>
            <div className="modal-buttons">
              <button
                type="button"
                className="btn btn-secondary outline"
                onClick={onHide}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-primary create-btn"
                onClick={insertPartida}
                disabled={loading}
              >
                {loading ? 'Criando...' : 'Criar Partida'}
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default RegrasFormRegisterModal;
