import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import axios from 'axios';
import { API_BASE_URL } from '../../../../config/api';
import '../PunishmentModal.css';

interface Props {
  show: boolean;
  onHide: () => void;
  onClose: () => void;
  championshipId: number;
}

const PunishmentChampionshipUpdateModal: React.FC<Props> = ({ show, onHide, onClose, championshipId }) => {
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<{ time?: number; motivo?: string }>({});

  useEffect(() => {
    if (!show || !championshipId) return;
    const load = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const [teamsResp, punicaoResp] = await Promise.all([
          axios.get(`${API_BASE_URL}/championships/${championshipId}/join-team`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE_URL}/punishments/championships/${championshipId}`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setTeams(Array.isArray(teamsResp.data) ? teamsResp.data : []);
        const reg = Array.isArray(punicaoResp.data) && punicaoResp.data.length ? punicaoResp.data[0] : null;
        if (reg) {
          setFormData({ time: reg.idtime, motivo: reg.motivo });
        }
      } catch (e) {
        setError('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [show, championshipId]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'time' ? parseInt(value) : value }));
  };

  const atualizarPunicao = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      const body: any = {};
      if (formData.time) body.idtime = formData.time;
      if (typeof formData.motivo === 'string') body.motivo = formData.motivo;
      const resp = await axios.put(`${API_BASE_URL}/punishments/championships/${championshipId}`, body, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      if (resp.status === 200) {
        setSuccess('Punição alterada com sucesso!');
        setTimeout(() => onClose(), 1200);
      }
    } catch (e: any) {
      if (e.response?.data?.message) setError(e.response.data.message);
      else setError('Erro ao alterar punição.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = (formData.time && formData.time > 0) || (typeof formData.motivo === 'string' && formData.motivo !== '');

  return (
    <Modal show={show} onHide={onHide} className="regras-modal" backdrop="static" keyboard={false} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>Alterar Punição</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="modal-content-wrapper">
          {error && <div className="error-message"><p>{error}</p></div>}
          {success && <div className="success-message"><p style={{ display:'flex', justifyContent:'center' }}>{success}</p></div>}
          <div className="form-group">
            <label style={{ color:'white' }}>Alterar time:</label>
            <select className="form-select" name="time" onChange={handleSelectChange} value={formData.time || 0} disabled={loading}>
              <option value={0}>Selecione uma opção</option>
              {teams.map((t: any) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label style={{ color:'white' }}>Alterar motivo:</label>
            <select className="form-select" name="motivo" onChange={handleSelectChange} value={formData.motivo || ''} disabled={loading}>
              <option value="">Selecione uma opção</option>
              <option value="Desistencia">Desistência</option>
              <option value="Atraso">Atraso</option>
            </select>
          </div>
          <div className="modal-buttons">
            <button type="button" className="btn btn-warning" onClick={atualizarPunicao} disabled={!isFormValid || loading}>
              {loading ? 'Salvando...' : 'Salvar alterações'}
            </button>
            <Button variant="secondary" onClick={onClose} disabled={loading}>Fechar</Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default PunishmentChampionshipUpdateModal;
