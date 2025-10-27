import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { getPunicao } from '../../../../services/matchesFriendlyServices';
import toast from 'react-hot-toast';
import './PunicaoViewModal.css';
import PunicaoUpdateModal from './PunicaoPartidaAmistosaModalUpdate';
import PunicaoDeleteModal from './PunicaoPartidaAmistosaModalDelete';

interface PunicaoViewModalProps {
  show: boolean;
  onHide: () => void;
  onClose: () => void;
  idMatch: number;
}

interface TeamInfo {
  id: number;
  name: string;
}

interface PunicaoData {
  id: number;
  idtime: number;
  motivo: string;
  team: TeamInfo;
  idMatch: number;
  team_home?: number;
  team_away?: number;
}

const PunicaoPartidaAmistosaViewModal: React.FC<PunicaoViewModalProps> = ({
  show,
  onHide,
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
      const resp = await getPunicao(idMatch);
      if (resp.data && resp.data.length > 0) {
        const punicaoData = resp.data[0];
        setPunicao(punicaoData);
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
  }, [show, idMatch]);

  const handleUpdateClick = () => {
    setModalUpdatePunicao(true);
  };

  const handleDeleteClick = () => {
    setModalDeletePunicao(true);
  };

  const handleUpdateSuccess = () => {
    setModalUpdatePunicao(false);
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
      <Modal show={show} onHide={onHide} size="xl" centered>
        <Modal.Body className="text-center p-5">
          <div className="spinner-border text-danger mb-3" role="status" style={{width: '3rem', height: '3rem'}}>
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="text-white">Carregando dados da punição...</p>
        </Modal.Body>
      </Modal>
    );
  }


  return (
    <>
      <Modal
        show={show}
        onHide={onHide}
        size="xl"
        centered
        className="regras-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title style={{color: 'black'}}>
            <i className="fas fa-gavel me-2"></i>
            Punição por WO Aplicada
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          {punicao ? (
            <>
              <div className="alert alert-info" style={{backgroundColor: 'rgba(34, 149, 244, 0.2)', border: '1px solid rgba(33, 150, 243, 0.4)', color: 'black', marginBottom: '1.5rem'}}>
                <i className="fas fa-info-circle me-2"></i>
                <strong>Partida encerrada por Walk Over (WO)</strong><br/>
                Esta partida foi finalizada automaticamente. A súmula foi gerada.
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <div className="card" style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)'}}>
                    <div className="card-body text-center">
                      <i className="fas fa-exclamation-triangle fa-2x mb-3" style={{color: '#ffc107'}}></i>
                      <h6 className="card-title" style={{color: 'black'}}>Time Punido</h6>
                      <p className="card-text" style={{color: 'black', fontSize: '1.1rem', fontWeight: 'bold'}}>
                        {punicao.team?.name || 'Nome não disponível'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 mb-3">
                  <div className="card" style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)'}}>
                    <div className="card-body text-center">
                      <i className="fas fa-file-alt fa-2x mb-3" style={{color: '#ffc107'}}></i>
                      <h6 className="card-title" style={{color: 'black'}}>Tipo da Punição</h6>
                      <p className="card-text" style={{color: 'black', fontSize: '1.1rem', fontWeight: 'bold'}}>
                        {punicao.motivo || 'Motivo não informado'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-black py-5">
              <i className="fas fa-exclamation-circle mb-3" style={{fontSize: '3rem'}}></i>
              <p>Nenhuma punição encontrada para esta partida.</p>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          {punicao && (
            <>
              <Button variant="warning" onClick={handleUpdateClick}>
                <i className="fas fa-edit me-2"></i>
                Alterar Punição
              </Button>
              
              <Button variant="danger" onClick={handleDeleteClick}>
                <i className="fas fa-trash me-2"></i>
                Deletar Punição
              </Button>
            </>
          )}
          
          <Button variant="secondary" onClick={onClose}>
            <i className="fas fa-times me-2"></i>
            Fechar
          </Button>
        </Modal.Footer>
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
        idmatch={idMatch}
      />
    </>
  );
};

export default PunicaoPartidaAmistosaViewModal;
