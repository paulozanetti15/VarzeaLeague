import React, { useEffect, useState, useRef } from 'react';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { Button, Modal } from 'react-bootstrap';
import axios from 'axios';
import './RegrasStyles.css';
import { format, parse, isValid, isAfter, startOfDay, isBefore } from 'date-fns';



interface RegrasFormEditModalProps {
  show: boolean;
  onHide: () => void;
  onClose: () => void;
  userId: number;
  partidaDados: any;
}
interface RulesData {
  dataLimite: string;
  idadeMinima: number;
  idadeMaxima: number;
  genero: string;
}

const RegrasFormEditModal: React.FC<RegrasFormEditModalProps> = ({ show, onHide, userId, partidaDados,onClose }) => {
  const [dataLimite, setDataLimite] = useState<string>(format(new Date(), 'dd/MM/yyyy'));
  const hiddenDateInputRef = useRef<HTMLInputElement>(null);
  // genero control is handled inside formData; separate state removed
  const [error, setError] = useState<string>("");
  const [sucess, setSucess] = useState<string>("");
  const [formData, setFormData] = useState<RulesData>({
    dataLimite: format(new Date(), 'dd/MM/yyyy'),
    idadeMinima: 0,
    idadeMaxima: 0,
    genero: ''
  });
  const [initialData, setInitialData] = useState<RulesData>({
    dataLimite: format(new Date(), 'dd/MM/yyyy'),
    idadeMinima: 0,
    idadeMaxima: 0,
    genero: ''
  });
  const [isChanged, setIsChanged] = useState(false);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'dataLimite') {
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
          setFormData(prev => ({
            ...prev,
            [name]: formattedDate
          }));
        }
      }
      return;
    }
    if (name === 'idadeMinima') {
      setFormData((prevData) => ({
        ...prevData,
        [name]: parseInt(value)
      }));
    }
    if (name === 'idadeMaxima') {  
      setFormData((prevData) => ({
        ...prevData,
        [name]: parseInt(value)
      }));
    }
    if (name === 'genero') {
        setFormData((prevData) => ({
          ...prevData,
          [name]  : value
        }));
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const verificarDataLimite = (dataLimite: string, dataPartida: string): boolean => {
    const parsedDataLimite = parse(dataLimite, 'dd/MM/yyyy', new Date());
    const parsedDataPartida = new Date(dataPartida);
    const hoje = startOfDay(new Date());

    if (!isValid(parsedDataLimite)) {
      setError('Data limite inválida. Use o formato DD/MM/AAAA');
      return false;
    }

    if (isBefore(parsedDataLimite, hoje)) {
      setError('A data limite não pode ser anterior a hoje');
      return false;
    }

    if (!isAfter(parsedDataPartida, parsedDataLimite)) {
      setError('A data limite deve ser anterior à data da partida');
      return false;
    }

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
    const minima = formData.idadeMinima;
    const maxima = formData.idadeMaxima;

    if (isNaN(minima) || minima < 0) {
      setError('A idade mínima deve ser um número positivo');
      return false;
    }

    if (isNaN(maxima) || maxima < 0) {
      setError('A idade máxima deve ser um número positivo');
      return false;
    }

    if (minima >maxima) {
      setError('A idade mínima não pode ser maior que a idade máxima');
      return false;
    }

    if (maxima > 100) {
      setError('A idade máxima não pode ser maior que 100 anos');
      return false;
    }

    return true;
  };

  const atualizaRegras = async (partidaDados: any) => {
    setError('');
    if (!dataLimite || !verificarDataLimite(dataLimite, partidaDados.date)) {
      setError('Por favor, insira uma data limite válida no formato DD/MM/AAAA, anterior à data da partida.');
      return;
    }

    if (formData.idadeMinima==0 || formData.idadeMaxima==0 || !validarIdades()) {
       
      setError('Por favor, insira idades válidas');
      return;
    }  

    if (formData.genero=="") {
      setError('Por favor, selecione o gênero da partida');
      return;
    }

    try {
        const response=await axios.put(
          `http://localhost:3001/api/rules/${partidaDados.id}`,
          {
            userId: userId,
            partidaId:partidaDados.id,
            dataLimite: format(parse(dataLimite, 'dd/MM/yyyy', new Date()), 'yyyy-MM-dd'),
            idadeMinima: formData.idadeMinima,
            idadeMaxima: formData.idadeMaxima,
            genero: formData.genero
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        if (response.status === 200) {
          setSucess('Regras atualizadas com sucesso!');
          setTimeout(() => {
           window.location.reload();
          }, 500);
          
        }
         
      
    } catch (error) {
      setError('Erro ao atualizar regras. Tente novamente.');
    }
  };
  const carregarRegras = async (partidaDados:any) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/rules/${partidaDados.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.status === 200) {
        setFormData({
          dataLimite:  format(new Date(response.data.dataLimite), 'dd/MM/yyyy'),
          idadeMinima: response.data.idadeMinima.toString(),
          idadeMaxima: response.data.idadeMaxima.toString(),
          genero: response.data.genero
        });
        setInitialData({
          dataLimite:  format(new Date(response.data.dataLimite), 'dd/MM/yyyy'),
          idadeMinima: response.data.idadeMinima.toString(),
          idadeMaxima: response.data.idadeMaxima.toString(),
          genero: response.data.genero
        });
      }
    } catch (error) {
      setError(`Erro ao carregar regras. Tente novamente. ${error}`);
    }
  };
  useEffect(() => {
    carregarRegras(partidaDados);
  }, [partidaDados]);

  useEffect(() => {
    JSON.stringify(formData) !== JSON.stringify(initialData) ? setIsChanged(true) : setIsChanged(false);
  }, [formData, initialData]);

  return (
    <>
      
      <Modal
        show={show}
        onHide={onHide}
        className="regras-modal"
        backdrop="static"
        keyboard={false}
      > 
        <Modal.Body>
          <div className="modal-content-wrapper">
            <h2 className="modal-title">Atualizar regras da partida</h2>
            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}
            {sucess && (
              <div className="success-message">
                <p style={{ justifyContent: 'center', display: 'flex' }}>{sucess}</p>
              </div>
            )}
            <br/>
            <div className="form-group">
              <label>Data Limite para Inscrição</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    type="text"
                    id="dataLimite"
                    name="dataLimite"
                    value={formData.dataLimite}
                    onChange={handleInputChange}
                    required
                    className="form-control"
                    placeholder="DD/MM/AAAA"
                    maxLength={10}
                    onFocus={() => {
                      const el = hiddenDateInputRef.current; if (!el) return;
                      const v = formData.dataLimite; if (v && v.length===10) { const [d,m,y] = v.split('/'); el.value = `${y}-${m}-${d}`; }
                      const anyEl:any = el; if(typeof anyEl.showPicker==='function'){ anyEl.showPicker(); } else { el.click(); }
                    }}
                  />
                  <input
                    ref={hiddenDateInputRef}
                    type="date"
                    onChange={(e) => {
                      const iso = e.target.value; if(!iso) return; const [y,m,d] = iso.split('-');
                      setDataLimite(`${d}/${m}/${y}`);
                      setFormData(prev => ({ ...prev, dataLimite: `${d}/${m}/${y}` }));
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
                    const v = formData.dataLimite; if (v && v.length===10) { const [d,m,y] = v.split('/'); el.value = `${y}-${m}-${d}`; }
                    const anyEl:any = el; if(typeof anyEl.showPicker==='function'){ anyEl.showPicker(); } else { el.click(); }
                  }}
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
                  value={formData.idadeMinima}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  required
                  placeholder="Ex: 18"
                  name="idadeMinima"
                />
              </div>
              <div className="form-group">
                <label>Idade Máxima</label>
                <input
                  name='idadeMaxima'
                  type="number"
                  className="form-control"
                  value={formData.idadeMaxima}
                  onChange={handleInputChange}
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
                name='genero'
                className="form-control"
                value={formData.genero}
                onChange={handleSelectChange}
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
                onClick={()=>atualizaRegras(partidaDados)}
                disabled={isChanged ? false : true}
              >
                Atualizar Regras
              </button>
              <Button
                variant="danger"
                onClick={onClose}
                style={{ fontWeight: 600 }}
              >
                Fechar
              </Button>
            </div>
           
          </div>
         
        </Modal.Body>
      </Modal>
    </>
  );
};


export default RegrasFormEditModal;
