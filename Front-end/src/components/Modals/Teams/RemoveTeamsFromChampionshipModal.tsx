import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Modal, Button, Spinner } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../../../config/api';
import '../../Dialogs/SelectTeamPlayersDialog.css';

interface Props {
  show: boolean;
  onHide: () => void;
  championshipId: number;
  onSuccess?: () => void;
}

interface Team {
  id: number;
  name: string;
  banner?: string;
}

const RemoveTeamsFromChampionshipModal: React.FC<Props> = ({ show, onHide, championshipId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [error, setError] = useState<string>('');

  const token = useMemo(() => localStorage.getItem('token'), []);

  const fetchTeams = async () => {
    setTeamsLoading(true);
    try {
      const resp = await axios.get(`${API_BASE_URL}/championships/${championshipId}/teams`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeams(Array.isArray(resp.data) ? resp.data : []);
    } catch (e: any) {
      console.error('Erro ao buscar times do campeonato:', e);
      setError(e.response?.data?.message || 'Erro ao carregar times');
      setTeams([]);
    } finally {
      setTeamsLoading(false);
    }
  };

  useEffect(() => {
    if (show) {
      setError('');
      setSelectedIds([]);
      fetchTeams();
    }
  }, [show]);

  const toggle = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleConfirm = async () => {
    if (selectedIds.length === 0) {
      setError('Selecione ao menos um time para remover.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const promises = selectedIds.map(id => axios.delete(`${API_BASE_URL}/championships/${championshipId}/teams/${id}`, { headers: { Authorization: `Bearer ${token}` } }));
      const results = await Promise.allSettled(promises);
      const succeeded = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.length - succeeded;
      if (succeeded > 0) {
        toast.success(`${succeeded} time(s) removido(s) do campeonato`);
      }
      if (failed > 0) {
        toast.error(`${failed} remoção(ões) falharam`);
      }
      await fetchTeams();
      onSuccess && onSuccess();
      onHide();
    } catch (e: any) {
      console.error('Erro ao remover times:', e);
      setError(e.response?.data?.message || 'Erro ao remover times');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={() => !loading && onHide()} centered backdrop="static" keyboard={!loading} size="lg">
      <Modal.Header closeButton={!loading}>
        <Modal.Title>Excluir times do campeonato</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <div className="stm-alert-error">{error}</div>}

        <div style={{ marginBottom: 12 }}>
          <strong>Selecione os times que deseja remover:</strong>
        </div>

        {teamsLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Spinner animation="border" size="sm"/> Carregando times...</div>
        ) : teams.length === 0 ? (
          <div className="stm-empty">Nenhum time inscrito neste campeonato.</div>
        ) : (
          <div className="stm-team-list">
            {teams.map(t => {
              const rawBanner = t.banner || '';
              const bannerUrl = rawBanner.startsWith('/uploads') ? `http://localhost:3001${rawBanner}` : (rawBanner ? `http://localhost:3001/uploads/teams/${rawBanner}` : null);
              return (
                <label key={t.id} className={`stm-team-card selectable ${selectedIds.includes(t.id) ? 'checked' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <input type="checkbox" checked={selectedIds.includes(t.id)} onChange={() => toggle(t.id)} disabled={loading} />
                  {bannerUrl && <img src={bannerUrl} alt={t.name} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6 }} />}
                  <span>{t.name}</span>
                </label>
              );
            })}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => !loading && onHide()} disabled={loading}>Cancelar</Button>
        <Button variant="danger" onClick={handleConfirm} disabled={loading || selectedIds.length === 0}>{loading ? 'Removendo...' : 'Remover Selecionados'}</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RemoveTeamsFromChampionshipModal;
