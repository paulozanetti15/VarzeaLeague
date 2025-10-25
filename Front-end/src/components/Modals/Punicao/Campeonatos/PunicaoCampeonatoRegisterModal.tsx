import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import axios from 'axios';
import '../PunicaoModal.css';

interface Props {
  show: boolean;
  onHide: () => void;
  onClose: () => void;
  championshipId: number;
}

interface FormData {
  time: number;
  motivo: string;
}

const PunicaoCampeonatoRegisterModal: React.FC<Props> = ({ show, onHide, onClose, championshipId }) => {
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({ time: 0, motivo: "" });

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'time' ? parseInt(value) : value }));
  };

  useEffect(() => {
    if (!show || !championshipId) return;
    const fetchTeams = async () => {
      try {
        setLoading(true);
        setError("");
        const resp = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/championships/${championshipId}/join-team`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setTeams(Array.isArray(resp.data) ? resp.data : []);
      } catch (err) {
        console.error('Erro ao buscar times do campeonato', err);
        setError('Erro ao carregar times do campeonato');
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, [show, championshipId]);

  const inserirPunicao = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      if (!formData.time) { setError('Selecione um time'); return; }
      if (!formData.motivo) { setError('Selecione um motivo'); return; }
      const resp = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/championships/${championshipId}/punicao`, {
        idtime: formData.time,
        motivo: formData.motivo
      }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      if (resp.status === 201) {
        setSuccess('Punição aplicada com sucesso!');
        setFormData({ time: 0, motivo: '' });
        setTimeout(() => onClose(), 1500);
      }
    } catch (error: any) {
      console.error('Erro ao inserir punição de campeonato:', error);
      if (error.response?.status === 409) setError('Já existe uma punição para este campeonato.');
      else if (error.response?.data?.message) setError(error.response.data.message);
      else setError('Erro ao aplicar punição. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    setSuccess("");
    setFormData({ time: 0, motivo: '' });
    onClose();
  };

  const isFormValid = formData.time > 0 && formData.motivo !== '';

  return (
    <Modal show={show} onHide={onHide} className="regras-modal" backdrop="static" keyboard={false} size="xl">
      <Modal.Body>
        <div className="modal-content-wrapper">
          <h2 className="modal-title">Punição por WO (Campeonato)</h2>
          {error && <div className="error-message"><p>{error}</p></div>}
          {success && <div className="success-message"><p style={{ display:'flex', justifyContent:'center' }}>{success}</p></div>}
          <br/>
          {loading && !success && !error ? (
            <div style={{ textAlign: 'center', color: 'white' }}>Carregando...</div>
          ) : (
            <>
              <div className="form-group">
                <label style={{ color:'white' }}>Selecione time para punição:</label>
                <select className="form-select" name="time" onChange={handleSelectChange} value={formData.time} disabled={loading}>
                  <option value={0}>Selecione uma opção</option>
                  {teams.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label style={{ color:'white' }}>Selecione motivo:</label>
                  <select className="form-select" name="motivo" onChange={handleSelectChange} value={formData.motivo} disabled={loading}>
                    <option value="">Selecione uma opção</option>
                    <option value="Desistencia">Desistência</option>
                    <option value="Atraso">Atraso</option>
                  </select>
                </div>
              </div>
            </>
          )}
          <div className="modal-buttons">
            <button type="button" className="btn btn-warning" onClick={inserirPunicao} disabled={!isFormValid || loading}>
              {loading ? 'Aplicando...' : 'Aplicar punição'}
            </button>
            <Button variant="secondary" onClick={handleClose} disabled={loading}>Fechar</Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default PunicaoCampeonatoRegisterModal;
