import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import axios from 'axios';
import '../PunicaoModal.css';
import PunicaoCampeonatoModalUpdate from './PunicaoCampeonatoModalUpdate';
import PunicaoCampeonatoModalDelete from './PunicaoCampeonatoModalDelete';

interface Props {
  show: boolean;
  onHide: () => void;
  onClose: () => void;
  championshipId: number;
}

interface PunicaoData {
  id: number;
  motivo: string;
  team: { id: number; name: string };
  idchampionship: number;
}

const PunicaoCampeonatoModalInfo: React.FC<Props> = ({ show, onHide, onClose, championshipId }) => {
  const [loading, setLoading] = useState(false);
  const [punicao, setPunicao] = useState<PunicaoData | null>(null);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const fetchPunicao = async () => {
    try {
      setLoading(true);
  // reset state
      const token = localStorage.getItem('token');
      const resp = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/championships/${championshipId}/punicao`, { headers: { Authorization: `Bearer ${token}` } });
      const row = Array.isArray(resp.data) && resp.data.length ? resp.data[0] : null;
      setPunicao(row);
      if (!row) onClose();
    } catch (e: any) {
      onClose();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show && championshipId) fetchPunicao();
  }, [show, championshipId]);

  const handleUpdateSuccess = () => {
    setOpenUpdate(false);
    fetchPunicao();
  };

  const handleDeleteSuccess = () => {
    setOpenDelete(false);
    onClose();
    window.location.reload();
  };

  return (
    <>
      <Modal show={show} onHide={onHide} className="regras-modal" backdrop="static" keyboard={false} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>Informações da Punição (Campeonato)</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="modal-content-wrapper">
            {loading ? (
              <div className="text-center text-white">Carregando...</div>
            ) : punicao ? (
              <>
                <div className="form-group mb-3">
                  <label className="text-white"><strong>Time Punido:</strong></label>
                  <p className="text-white mb-0">{punicao.team?.name || 'Nome não disponível'}</p>
                </div>
                <div className="form-group mb-4">
                  <label className="text-white"><strong>Motivo:</strong></label>
                  <p className="text-white mb-0">{punicao.motivo || 'Motivo não informado'}</p>
                </div>
              </>
            ) : (
              <div className="text-center text-white">Nenhuma punição encontrada.</div>
            )}
            <div className="modal-buttons d-flex gap-2 justify-content-end">
              {punicao && (
                <>
                  <Button variant="warning" onClick={() => setOpenUpdate(true)}>Alterar punição</Button>
                  <Button variant="danger" onClick={() => setOpenDelete(true)}>Deletar punição</Button>
                </>
              )}
              <Button variant="danger" onClick={onClose}>Fechar</Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      <PunicaoCampeonatoModalUpdate show={openUpdate} onHide={() => setOpenUpdate(false)} onClose={handleUpdateSuccess} championshipId={championshipId} />
      <PunicaoCampeonatoModalDelete show={openDelete} onHide={() => setOpenDelete(false)} onClose={handleDeleteSuccess} championshipId={championshipId} />
    </>
  );
};

export default PunicaoCampeonatoModalInfo;
