import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { getJoinedTeams, createPunicao, updatePunicao, updateMatch } from '../../../../services/matchesFriendlyServices';
import './PunishmentFriendlyMatchRegisterModal.css';

interface PunishmentFriendlyMatchModal {
  show: boolean;
  onHide: () => void;
  team: any;
  onClose: () => void;
}

interface Dados {
  idTeam: number;
  reason: string;
  team_home: number;
  team_away: number;
}

const PunishmentRegisterModal: React.FC<PunishmentFriendlyMatchModal> = ({ 
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
    idTeam: 0,
    reason: "",
    team_home: 0,
    team_away: 0
  });

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: (name === "idTeam" || name === "team_home" || name === "team_away") ? parseInt(value) : value
    }));
  };

  useEffect(() => {
    if (!show || !team?.id) return;

    const fetchTeamsMatch = async (idMatch: number) => {
      try {
        setLoading(true);
        setError("");
        const resp = await getJoinedTeams(idMatch);
        setTeams(Array.isArray(resp.data) ? resp.data : []);
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

      if (!formData.idTeam || formData.idTeam === 0) {
        setError("Por favor, selecione o time punido");
        return;
      }
      
      if (!formData.reason) {
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

      const resp = await createPunicao(idMatch, {
        idTeam: formData.idTeam,
        reason: formData.reason,
        team_home: formData.team_home,
        team_away: formData.team_away
      });
      
      if (resp.status === 201) {
        setSuccess("Punição aplicada com sucesso! Súmula 3x0 criada e partida finalizada.");
        
        setFormData({
          idTeam: 0,
          reason: "",
          team_home: 0,
          team_away: 0
        });
        
        try {
          await updateMatch(String(idMatch), { status: 'finalizada' });
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
      idTeam: 0,
      reason: "",
      team_home: 0,
      team_away: 0
    });
    onClose();
  };

  const isFormValid = formData.idTeam > 0 && formData.reason !== "" && formData.team_home > 0 && formData.team_away > 0 && formData.team_home !== formData.team_away;

  return (
    <Modal
      show={show}
      onHide={onHide}
      className="punishment-modal"
      backdrop="static"
      keyboard={false}
      size="lg"
      centered
    >
      <div className="punishment-modal-header">
        <h2 className="modal-title">
          <i className="fas fa-gavel me-2"></i>
          Punição por WO
        </h2>
      </div>
      <div className="punishment-modal-body">
        {error && (
          <div className="alert alert-danger mb-3">
            <i className="fas fa-exclamation-circle me-2"></i>
            {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success mb-3">
            <i className="fas fa-check-circle me-2"></i>
            {success}
          </div>
        )}
        {loading && !success && !error ? (
          <div className="text-center py-4">
            <div className="spinner-border text-warning mb-3" role="status" style={{width: '2.5rem', height: '2.5rem'}}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <div className="text-muted">Carregando...</div>
          </div>
        ) : (
          <>
            <div className="alert alert-warning mb-4">
              <i className="fas fa-info-circle me-2"></i>
              Ao aplicar a punição, uma súmula 3x0 será gerada automaticamente e a partida será finalizada.
            </div>
            <div className="punishment-grid">
              <div className="punishment-card punishment-card-danger">
                <div className="punishment-card-header">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  Time Punido <span style={{color: '#fff'}}>*</span>
                </div>
                <div className="punishment-card-body">
                  <div className="punishment-card-icon">
                    <i className="fas fa-users"></i>
                  </div>
                  <select 
                    className="form-select mt-3" 
                    name="idTeam" 
                    onChange={handleSelectChange}
                    value={formData.idTeam} 
                    aria-label="Selecione o time punido"
                    disabled={loading}
                    required
                  >
                    <option value={0}>Selecione o time que receberá a punição</option>
                    {teams.map((team: any) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="punishment-card punishment-card-primary">
                <div className="punishment-card-header">
                  <i className="fas fa-home me-2"></i>
                  Time da Casa <span style={{color: '#fff'}}>*</span>
                </div>
                <div className="punishment-card-body">
                  <div className="punishment-card-icon">
                    <i className="fas fa-home"></i>
                  </div>
                  <select 
                    className="form-select mt-3" 
                    name="team_home" 
                    onChange={handleSelectChange}
                    value={formData.team_home} 
                    aria-label="Selecione o time da casa"
                    disabled={loading}
                    required
                  >
                    <option value={0}>Selecione o time mandante</option>
                    {teams.map((team: any) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="punishment-card punishment-card-primary">
                <div className="punishment-card-header">
                  <i className="fas fa-plane-departure me-2"></i>
                  Time Visitante <span style={{color: '#fff'}}>*</span>
                </div>
                <div className="punishment-card-body">
                  <div className="punishment-card-icon">
                    <i className="fas fa-plane-departure"></i>
                  </div>
                  <select 
                    className="form-select mt-3" 
                    name="team_away" 
                    onChange={handleSelectChange}
                    value={formData.team_away} 
                    aria-label="Selecione o time visitante"
                    disabled={loading}
                    required
                  >
                    <option value={0}>Selecione o time visitante</option>
                    {teams.map((team: any) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="punishment-card punishment-card-primary">
                <div className="punishment-card-header">
                  <i className="fas fa-clipboard-list me-2"></i>
                  Motivo da Punição <span style={{color: '#fff'}}>*</span>
                </div>
                <div className="punishment-card-body">
                  <div className="punishment-card-icon">
                    <i className="fas fa-clipboard-list"></i>
                  </div>
                  <select 
                    className="form-select mt-3" 
                    name="reason" 
                    onChange={handleSelectChange}
                    value={formData.reason}
                    aria-label="Selecione o motivo"
                    disabled={loading}
                    required
                  >
                    <option value="">Selecione o motivo</option>
                    <option value="Desistencia">Desistência</option>
                    <option value="Atraso">Atraso</option>
                    <option value="Falta de Comparecimento">Falta de Comparecimento</option>
                  </select>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <div className="punishment-modal-footer">
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
    </Modal>
  );
};

export default PunishmentRegisterModal;
