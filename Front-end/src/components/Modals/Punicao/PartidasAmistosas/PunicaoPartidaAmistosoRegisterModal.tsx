import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import axios from 'axios';
import '../PunicaoModal.css';

interface PunicaoPartidaAmistosaModal {
  show: boolean;
  onHide: () => void;
  team: any;
  onClose: () => void;
}

interface Dados {
  time: number;
  motivo: string;
}

const PunicaoRegisterModal: React.FC<PunicaoPartidaAmistosaModal> = ({ 
  show, 
  onHide, 
  team, 
  onClose 
}) => {
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isChanged, setIsChanged] = useState(false);
  const [teams, setTeams] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Dados>({
    time: 0,
    motivo: ""
  });

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === "time" ? parseInt(value) : value
    }));
  };

  useEffect(() => {
    if (!show || !team?.id) return;

    const fetchTeamsMatch = async (idMatch: number) => {
      try {
        setLoading(true);
        setError("");
        
        const response = await axios.get(`http://localhost:3001/api/matches/${idMatch}/join-team`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        setTeams(response.data || []);
      } catch (error) {
        console.error("Erro ao buscar times:", error);
        setError("Erro ao carregar times da partida");
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeamsMatch(team.id);
  }, [show, team?.id]);

  const inserirPunicao = async (idMatch: number) => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // Validações
      if (!formData.time || formData.time === 0) {
        setError("Por favor, selecione um time");
        return;
      }
      
      if (!formData.motivo) {
        setError("Por favor, selecione um motivo para a punição");
        return;
      }

      const response = await axios.post(`http://localhost:3001/api/matches/${idMatch}/punicao`, {
        idtime: formData.time,
        motivo: formData.motivo
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log(response.status)
      if (response.status === 201) {
        setSuccess("Punição aplicada com sucesso!");
        console.log("Punição lançada com sucesso");
        
        // Reset form
        setFormData({
          time: 0,
          motivo: ""
        });
        
        // Auto close after success
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error: any) {
      console.error("Erro ao inserir punição:", error);
      
      // Tratamento específico de erros
      if (error.response?.status === 400) {
        setError("Dados inválidos. Verifique as informações inseridas.");
      } else if (error.response?.status === 401) {
        setError("Acesso negado. Faça login novamente.");
      } else if (error.response?.status === 409) {
        setError("Já existe uma punição para este time nesta partida.");
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Erro ao aplicar punição. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    setSuccess("");
    setFormData({
      time: 0,
      motivo: ""
    });
    onClose();
  };

  const isFormValid = formData.time > 0 && formData.motivo !== "";

  return (
    <Modal
      show={show}
      onHide={onHide}
      className="regras-modal"
      backdrop="static"
      keyboard={false}
      size="xl"
    >
      <Modal.Body>
        <div className="modal-content-wrapper">
          <h2 className="modal-title">Punição por WO</h2>
          
          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}
          
          {success && (
            <div className="success-message">
              <p style={{ justifyContent: 'center', display: 'flex' }}>{success}</p>
            </div>
          )}
          
          <br/>
          
          {loading && !success && !error ? (
            <div style={{ textAlign: 'center', color: 'white' }}>
              Carregando...
            </div>
          ) : (
            <>
              <div className="form-group">
                <label style={{color:"white"}}>Selecione time para punição: </label>
                <select 
                  className="form-select" 
                  name="time" 
                  onChange={handleSelectChange}
                  value={formData.time} 
                  aria-label="Selecione o time"
                  disabled={loading}
                >
                  <option value={0}>Selecione uma opção</option>
                  {teams.map((team: any) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label style={{color:"white"}}>Selecione motivo: </label>
                  <select 
                    className="form-select" 
                    name="motivo" 
                    onChange={handleSelectChange}
                    value={formData.motivo}
                    aria-label="Selecione o motivo"
                    disabled={loading}
                  >
                    <option value="">Selecione uma opção</option>
                    <option value="Desistencia">Desistência</option>
                    <option value="Atraso">Atraso</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="modal-buttons">
            <button
              type="button"
              className="btn btn-warning"
              onClick={() => inserirPunicao(team.id)}
              disabled={!isFormValid || loading}
            >
              {loading ? "Aplicando..." : "Aplicar punição"}
            </button>
            <Button 
              variant="secondary" 
              onClick={handleClose}
              disabled={loading}
            >
              Fechar
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default PunicaoRegisterModal;
