import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import axios from 'axios';

interface Props {
  show: boolean;
  onHide: () => void;
  onClose: () => void;
  championshipId: number;
}

const PunicaoCampeonatoModalDelete: React.FC<Props> = ({ show, onHide, onClose, championshipId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError("");
      const resp = await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/championships/${championshipId}/penalty`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (resp.status === 200) {
        onClose();
      }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Erro ao deletar punição.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Confirmar exclusão</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <div className="alert alert-danger">{error}</div>}
        Tem certeza que deseja remover a punição deste campeonato?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>Cancelar</Button>
        <Button variant="danger" onClick={handleDelete} disabled={loading}>{loading ? 'Removendo...' : 'Remover'}</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PunicaoCampeonatoModalDelete;
