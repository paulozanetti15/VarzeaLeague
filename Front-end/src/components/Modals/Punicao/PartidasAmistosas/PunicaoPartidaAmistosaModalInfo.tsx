
import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import axios from 'axios';
import toast from 'react-hot-toast';
import '../PunicaoModal.css';
import PunicaoUpdateModal from './PunicaoPartidaAmistosaModalUpdate';
import PunicaoDeleteModal from './PunicaoPartidaAmistosaModalDelete';

interface PunicaoPartidaAmistosaModalProps {
  show: boolean;
  onHide: () => void;
  team: any;
  onClose: () => void;
  idMatch: number;
}

interface PunicaoData {
  id: number;
  motivo: string;
  team: {
    id: number;
    name: string;
  };
  idMatch:number
}

const PunicaoPartidaAmistosaModalInfo: React.FC<PunicaoPartidaAmistosaModalProps> = ({
  show,
  onHide,
  team,
  onClose,
  idMatch,
}) => {
  const [loading, setLoading] = useState(false);
  const [punicao, setPunicao] = useState<PunicaoData | null>(null);
  const [modalDeletePunicao, setModalDeletePunicao] = useState(false);
  const [modalUpdatePunicao, setModalUpdatePunicao] = useState(false);

  const token = localStorage.getItem('token');

  const fetchPunicao = async (idMatch: number) => {
    if (!token || !idMatch) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3001/api/matches/${idMatch}/punicao`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      
      
      if (response.data && response.data.length > 0) {
        setPunicao(response.data[0]);
      } else {
        toast.error('Nenhuma punição encontrada para esta partida');
        onClose();
      }
    } catch (error: any) {
      console.error('Erro ao buscar punição:', error);
      toast.error('Erro ao carregar dados da punição');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show && idMatch) {
      fetchPunicao(idMatch);
    }
  }, [show, idMatch, token]);

  const handleUpdateClick = () => {
    setModalUpdatePunicao(true);
  };

  const handleDeleteClick = () => {
    setModalDeletePunicao(true);
  };

  const handleUpdateSuccess = () => {
    setModalUpdatePunicao(false);
    // Recarregar dados após atualização
    fetchPunicao(idMatch);
  };

  const handleDeleteSuccess = () => {
    setModalDeletePunicao(false);
    toast.success('Punição deletada com sucesso!');
    onClose();
    window.location.reload(); 
  };

  if (loading) {
    return (
      <Modal show={show} onHide={onHide} centered>
        <Modal.Body className="text-center p-4">
          <div>Carregando dados da punição...</div>
        </Modal.Body>
      </Modal>
    );
  }

  return (
    <>
      <Modal
        show={show}
        onHide={onHide}
        className="regras-modal"
        backdrop="static"
        keyboard={false}
        size="xl"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Informações da Punição</Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          <div className="modal-content-wrapper">
            <h2 className="modal-title">Punição por WO</h2>
            
            {punicao ? (
              <>
                <div className="form-group mb-3">
                  <label className="text-white">
                    <strong>Time Punido:</strong>
                  </label>
                  <p className="text-white mb-0">{punicao.team?.name || 'Nome não disponível'}</p>
                </div>
                
                <div className="form-group mb-4">
                  <label className="text-white">
                    <strong>Motivo:</strong>
                  </label>
                  <p className="text-white mb-0">{punicao.motivo || 'Motivo não informado'}</p>
                </div>
              </>
            ) : (
              <div className="text-center text-white">
                <p>Nenhuma punição encontrada para esta partida.</p>
              </div>
            )}
            
            <div className="modal-buttons d-flex gap-2 justify-content-end">
              {punicao && (
                <>
                  <Button
                    variant="warning"
                    onClick={handleUpdateClick}
                  >
                    Alterar punição
                  </Button>
                  
                  <Button
                    variant="danger"
                    onClick={handleDeleteClick}
                  >
                    Deletar punição
                  </Button>
                </>
              )}
              
              <Button variant="secondary" onClick={onClose}>
                Fechar
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* Modal de Deletar */}
      <PunicaoDeleteModal 
        show={modalDeletePunicao}
        onHide={() => setModalDeletePunicao(false)}
        onClose={handleDeleteSuccess}
        idmatch={idMatch}
      />

      {/* Modal de Atualizar */}
      <PunicaoUpdateModal 
        show={modalUpdatePunicao}
        onHide={() => setModalUpdatePunicao(false)}
        onClose={handleUpdateSuccess}
        team={team}
        idmatch={idMatch}
      />
    </>
  );
};

export default PunicaoPartidaAmistosaModalInfo;