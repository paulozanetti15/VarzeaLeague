import React, { useState } from 'react';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { format, parse } from 'date-fns';
import './RegrasFormRegisterModal.css';
import ToastComponent from '../../Toast/ToastComponent';
import { useRegrasForm } from '../../../hooks/useRegrasForm';
import { matchRulesService, MatchData } from '../../../services/matchRulesService';

interface RegrasFormRegisterModalProps {
  show: boolean;
  onHide: () => void;
  userId: number;
  partidaDados?: any;
  matchToCreate?: MatchData;
}

const RegrasFormRegisterModal: React.FC<RegrasFormRegisterModalProps> = ({
  show,
  onHide,
  userId,
  partidaDados,
  matchToCreate
}) => {
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastBg, setToastBg] = useState<'success' | 'danger'>('success');

  const {
    formData,
    errors,
    loading,
    hiddenDateInputRef,
    handleDataLimiteChange,
    handleOpenDatePicker,
    handleHiddenDateChange,
    updateFormData,
    validarFormulario,
    setLoading,
    resetForm,
  } = useRegrasForm();

  const showToastMessage = (message: string, bg: 'success' | 'danger' = 'success') => {
    setToastMessage(message);
    setToastBg(bg);
    setShowToast(true);
  };

  const handleSubmit = async () => {
    if (loading) return;

    // Validar formulário
    if (!validarFormulario(partidaDados?.date || matchToCreate?.date)) {
      return;
    }

    try {
      setLoading(true);

      // Preparar dados das regras
      const dataLimiteISO = format(parse(formData.dataLimite, 'dd/MM/yyyy', new Date()), 'yyyy-MM-dd');

      if (partidaDados && partidaDados.id) {
        const rulesData = {
          userId,
          partidaId: partidaDados.id,
          dataLimite: dataLimiteISO,
          idadeMinima: parseInt(formData.idadeMinima),
          idadeMaxima: parseInt(formData.idadeMaxima),
          genero: formData.genero,
        };

        const result = await matchRulesService.createRules(rulesData);

        if (result) {
          showToastMessage('Regras criadas com sucesso!');
          setTimeout(() => {
            navigate('/matches');
          }, 1400);
        }
      } else if (matchToCreate) {
        const rulesPayload = {
          userId,
          dataLimite: dataLimiteISO,
          idadeMinima: parseInt(formData.idadeMinima),
          idadeMaxima: parseInt(formData.idadeMaxima),
          genero: formData.genero,
        };

        const result = await matchRulesService.createMatchWithRules(matchToCreate, rulesPayload);

        if (result) {
          showToastMessage('Partida e regras criadas com sucesso!');
          setTimeout(() => {
            navigate('/matches');
          }, 1400);
        }
      } else {
        throw new Error('Dados da partida não informados');
      }
    } catch (error) {
      console.error('Erro ao criar regras:', error);
      showToastMessage('Erro ao criar regras. Tente novamente.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onHide();
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
        onHide={handleClose}
        centered
        className="regras-modal"
        backdrop="static"
        keyboard={false}
      >
        <Modal.Body>
          <div className="modal-content-wrapper">
            <div className="modal-header-custom">
              <h2 className="modal-title">Regras da Partida</h2>
              <button onClick={handleClose} type="button" className="close-icon-btn" aria-label="Fechar">&times;</button>
            </div>

            {(errors.general || errors.dataLimite || errors.idadeMinima || errors.idadeMaxima || errors.genero) && (
              <div className="error-message">
                <p>{errors.general || errors.dataLimite || errors.idadeMinima || errors.idadeMaxima || errors.genero}</p>
              </div>
            )}

            <br />

            <div className="form-group">
              <label>Data Limite para Inscrição</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    type="text"
                    className={`form-control ${errors.dataLimite ? 'is-invalid' : ''}`}
                    value={formData.dataLimite}
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
                  className={`form-control ${errors.idadeMinima ? 'is-invalid' : ''}`}
                  value={formData.idadeMinima}
                  onChange={(e) => updateFormData('idadeMinima', e.target.value)}
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
                  className={`form-control ${errors.idadeMaxima ? 'is-invalid' : ''}`}
                  value={formData.idadeMaxima}
                  onChange={(e) => updateFormData('idadeMaxima', e.target.value)}
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
                className={`form-control ${errors.genero ? 'is-invalid' : ''}`}
                value={formData.genero}
                onChange={(e) => updateFormData('genero', e.target.value)}
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
                onClick={handleClose}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-primary create-btn"
                onClick={handleSubmit}
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
