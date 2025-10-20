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
  team_home: number;
  team_away: number;
}

const PunicaoRegisterModal: React.FC<PunicaoPartidaAmistosaModal> = ({ 
  show, 
  onHide, 
  team, 
  onClose 
}) => {
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [teams, setTeams] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Dados>({
    time: 0,
    motivo: "",
    team_home: 0,
    team_away: 0
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

      if (!formData.time || formData.time === 0) {
        setError("Por favor, selecione o time punido");
        return;
      }
      
      if (!formData.motivo) {
        setError("Por favor, selecione um motivo para a punição");
        return;
      }

      if (!formData.team_home || formData.team_home === 0) {
        setError("Por favor, selecione o time da casa");
        return;
      }

      if (!formData.team_away || formData.team_away === 0) {
        setError("Por favor, selecione o time visitante");
        return;
      }

      if (formData.team_home === formData.team_away) {
        setError("O time da casa e visitante devem ser diferentes");
        return;
      }

      const response = await axios.post(`http://localhost:3001/api/matches/${idMatch}/punicao`, {
        idtime: formData.time,
        motivo: formData.motivo,
        team_home: formData.team_home,
        team_away: formData.team_away
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.status === 201) {
        setSuccess("Punição aplicada com sucesso! Súmula 3x0 criada e partida finalizada.");
        
        setFormData({
          time: 0,
          motivo: "",
          team_home: 0,
          team_away: 0
        });
        
        try {
          await axios.put(`http://localhost:3001/api/matches/${idMatch}`, { status: 'cancelada' }, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
        } catch (err) {
          console.error('Erro ao atualizar status da partida para cancelada:', err);
        }

        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 2000);
      }
    } catch (error: any) {
      console.error("Erro ao inserir punição:", error);
      
      if (error.response?.status === 400) {
        setError(error.response.data.message || "Dados inválidos. Verifique as informações.");
      } else if (error.response?.status === 401) {
        setError("Acesso negado. Faça login novamente.");
      } else if (error.response?.status === 409) {
        setError(error.response.data.message || "Já existe uma punição para esta partida.");
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
      motivo: "",
      team_home: 0,
      team_away: 0
    });
    onClose();
  };

  const isFormValid = formData.time > 0 && formData.motivo !== "" && formData.team_home > 0 && formData.team_away > 0 && formData.team_home !== formData.team_away;

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
              <div className="alert alert-info" style={{backgroundColor: 'rgba(33, 150, 243, 0.2)', border: '1px solid rgba(33, 150, 243, 0.4)', color: 'white', marginBottom: '1.5rem'}}>
                <i className="fas fa-info-circle me-2"></i>
                Ao aplicar a punição, uma súmula 3x0 será gerada automaticamente e a partida será finalizada.
              </div>

              <div className="form-group mb-3">
                <label className="form-label" style={{color:"white", fontWeight: 600}}>
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  Time Punido:
                </label>
                <select 
                  className="form-select" 
                  name="time" 
                  onChange={handleSelectChange}
                  value={formData.time} 
                  aria-label="Selecione o time punido"
                  disabled={loading}
                >
                  <option value={0}>Selecione o time que receberá a punição</option>
                  {teams.map((team: any) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group mb-3">
                <label className="form-label" style={{color:"white", fontWeight: 600}}>
                  <i className="fas fa-home me-2"></i>
                  Time da Casa:
                </label>
                <select 
                  className="form-select" 
                  name="team_home" 
                  onChange={handleSelectChange}
                  value={formData.team_home} 
                  aria-label="Selecione o time da casa"
                  disabled={loading}
                >
                  <option value={0}>Selecione o time mandante</option>
                  {teams.map((team: any) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group mb-3">
                <label className="form-label" style={{color:"white", fontWeight: 600}}>
                  <i className="fas fa-plane-departure me-2"></i>
                  Time Visitante:
                </label>
                <select 
                  className="form-select" 
                  name="team_away" 
                  onChange={handleSelectChange}
                  value={formData.team_away} 
                  aria-label="Selecione o time visitante"
                  disabled={loading}
                >
                  <option value={0}>Selecione o time visitante</option>
                  {teams.map((team: any) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group mb-4">
                <label className="form-label" style={{color:"white", fontWeight: 600}}>
                  <i className="fas fa-clipboard-list me-2"></i>
                  Motivo da Punição:
                </label>
                <select 
                  className="form-select" 
                  name="motivo" 
                  onChange={handleSelectChange}
                  value={formData.motivo}
                  aria-label="Selecione o motivo"
                  disabled={loading}
                >
                  <option value="">Selecione o motivo</option>
                  <option value="Desistencia">Desistência</option>
                  <option value="Atraso">Atraso</option>
                  <option value="Jogadores Insuficientes">Jogadores Insuficientes</option>
                  <option value="Falta de Comparecimento">Falta de Comparecimento</option>
                </select>
              </div>
            </>
          )}

          <div className="modal-buttons d-flex gap-2 justify-content-end">
            <Button 
              variant="secondary" 
              onClick={handleClose}
              disabled={loading}
            >
              <i className="fas fa-times me-2"></i>
              Cancelar
            </Button>
            <button
              type="button"
              className="btn btn-warning"
              onClick={() => inserirPunicao(team.id)}
              disabled={!isFormValid || loading}
            >
              <i className="fas fa-gavel me-2"></i>
              {loading ? "Aplicando..." : "Aplicar Punição WO"}
            </button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default PunicaoRegisterModal;
