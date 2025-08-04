import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RegrasStyles.css';
import ToastComponent from '../../Toast/ToastComponent';
import { format, parse, isValid, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastBg, setToastBg] = useState('success');
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

  const verificarDataLimite = (dataLimite: string, dataPartida: string): boolean => {
    const parsedDataLimite = parse(dataLimite, 'dd/MM/yyyy', new Date());
    const parsedDataPartida = new Date(dataPartida);

    if (!isValid(parsedDataLimite)) {
      setError('Data limite inválida. Use o formato DD/MM/AAAA');
      return false;
    }

    if (!isAfter(parsedDataPartida, parsedDataLimite)) {
      setError('A data limite deve ser anterior à data da partida');
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
      // Primeiro criar a partida
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
        // Depois criar as regras associadas à partida
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
          }, 1500);
        }
      }
    } catch (error) {
      console.error('Erro ao criar partida e regras:', error);
      setError('Erro ao criar partida e regras. Tente novamente.');
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
            <h2 className="modal-title">Regras da Partida</h2>
            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}
            <br/>
            <div className="form-group">
              <label>Data Limite para Inscrição</label>
              <input
                type="text"
                className="form-control"
                value={dataLimite}
                onChange={handleDataLimiteChange}
                placeholder="DD/MM/AAAA"
                maxLength={10}
                required
              />
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
                className="btn btn-primary"
                onClick={insertPartida}
              >
                Criar Partida
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default RegrasFormRegisterModal;
