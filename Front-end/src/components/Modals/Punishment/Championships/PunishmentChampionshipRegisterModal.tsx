import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import axios from 'axios';
import '../PunishmentModal.css';

interface Props {
  show: boolean;
  onHide: () => void;
  onClose: () => void;
  championshipId: number;
}

interface FormData {
  time: number;
  motivo: string;
  team_home: number;
  team_away: number;
  id_match_championship: number;
}

const PunicaoCampeonatoRegisterModal: React.FC<Props> = ({ show, onHide, onClose, championshipId }) => {
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [teams, setTeams] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({ 
    time: 0, 
    motivo: "",
    team_home: 0,
    team_away: 0,
    id_match_championship: 0
  });

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: ['time', 'team_home', 'team_away', 'id_match_championship'].includes(name) ? parseInt(value) : value 
    }));
  };

  useEffect(() => {
    if (!show || !championshipId) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        const [teamsResp, matchesResp] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/championships/${championshipId}/join-team`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }),
          axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/championships/${championshipId}/matches`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
        ]);
        setTeams(Array.isArray(teamsResp.data) ? teamsResp.data : []);
        setMatches(Array.isArray(matchesResp.data) ? matchesResp.data : []);
      } catch (err) {
        console.error('Erro ao buscar dados do campeonato', err);
        setError('Erro ao carregar dados do campeonato');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [show, championshipId]);

  const inserirPunicao = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      if (!formData.time) { setError('Selecione o time punido'); return; }
      if (!formData.motivo) { setError('Selecione um motivo'); return; }
      if (!formData.team_home) { setError('Selecione o time da casa'); return; }
      if (!formData.team_away) { setError('Selecione o time visitante'); return; }
      if (!formData.id_match_championship) { setError('Selecione a partida do campeonato'); return; }
      if (formData.team_home === formData.team_away) { setError('Times da casa e visitante devem ser diferentes'); return; }
      
      const resp = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/championships/${championshipId}/punicao`, {
        idtime: formData.time,
        motivo: formData.motivo,
        team_home: formData.team_home,
        team_away: formData.team_away,
        id_match_championship: formData.id_match_championship
      }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      
      if (resp.status === 201) {
        setSuccess('Punição aplicada com sucesso! Súmula 3x0 criada automaticamente.');
        setFormData({ time: 0, motivo: '', team_home: 0, team_away: 0, id_match_championship: 0 });
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 2000);
      }
    } catch (error: any) {
      console.error('Erro ao inserir punição de campeonato:', error);
      if (error.response?.status === 409) setError(error.response.data.message || 'Já existe uma punição para esta partida.');
      else if (error.response?.data?.message) setError(error.response.data.message);
      else setError('Erro ao aplicar punição. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    setSuccess("");
    setFormData({ time: 0, motivo: '', team_home: 0, team_away: 0, id_match_championship: 0 });
    onClose();
  };

  const isFormValid = formData.time > 0 && formData.motivo !== "" && formData.team_home > 0 && formData.team_away > 0 && formData.id_match_championship > 0 && formData.team_home !== formData.team_away;

  return (
    <Modal show={show} onHide={onHide} className="regras-modal" backdrop="static" keyboard={false} size="xl">
      <Modal.Body>
        <div className="modal-content-wrapper">
          <h2 className="modal-title">Punição por WO (Campeonato)</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success text-center">{success}</div>}
          
          {loading && !success && !error ? (
            <div className="text-center text-white">Carregando...</div>
          ) : (
            <>
              <div className="alert alert-info" style={{backgroundColor: 'rgba(33, 150, 243, 0.2)', border: '1px solid rgba(33, 150, 243, 0.4)', color: 'white', marginBottom: '1.5rem', marginTop: '1rem'}}>
                <i className="fas fa-info-circle me-2"></i>
                Ao aplicar a punição, uma súmula 3x0 será gerada automaticamente para a partida selecionada.
              </div>

              <div className="form-group mb-3">
                <label className="form-label" style={{color:"white", fontWeight: 600}}>
                  <i className="fas fa-futbol me-2"></i>
                  Partida do Campeonato:
                </label>
                <select 
                  className="form-select" 
                  name="id_match_championship" 
                  onChange={handleSelectChange} 
                  value={formData.id_match_championship} 
                  disabled={loading}
                >
                  <option value={0}>Selecione a partida</option>
                  {matches.map((match: any) => (
                    <option key={match.id} value={match.id}>
                      Partida #{match.id} - {match.title || `Rodada ${match.round || ''}`}
                    </option>
                  ))}
                </select>
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
                  disabled={loading}
                >
                  <option value={0}>Selecione o time que receberá a punição</option>
                  {teams.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
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
                  disabled={loading}
                >
                  <option value={0}>Selecione o time mandante</option>
                  {teams.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
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
                  disabled={loading}
                >
                  <option value={0}>Selecione o time visitante</option>
                  {teams.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
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
            <Button variant="secondary" onClick={handleClose} disabled={loading}>
              <i className="fas fa-times me-2"></i>
              Cancelar
            </Button>
            <button type="button" className="btn btn-warning" onClick={inserirPunicao} disabled={!isFormValid || loading}>
              <i className="fas fa-gavel me-2"></i>
              {loading ? 'Aplicando...' : 'Aplicar Punição WO'}
            </button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default PunicaoCampeonatoRegisterModal;
