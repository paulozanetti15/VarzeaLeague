import React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { deletePunicao, fetchMatchById, updateMatch } from '../../../../services/matchesFriendlyServices';
import toast from 'react-hot-toast';

interface PunicaoPartidaAmistosaModalProps {
  show: boolean;
  onHide: () => void;
  onClose: () => void;
  idmatch: number;
}

const PunicaoPartidaAmistosaDeletarModal: React.FC<PunicaoPartidaAmistosaModalProps> = ({ 
  show, 
  onHide, 
  onClose, 
  idmatch 
}) => {
  

  const deletarPunicao = async (id: number) => {
    try {
      const resp = await deletePunicao(id);
      if (resp.status === 200) {
        try {
          const matchResp = await fetchMatchById(Number(id));
          const matchData = matchResp as any;
          const status = String(matchData?.status || '').toLowerCase();
          const isWOFlag = !!matchData?.isWO || status === 'wo' || status === 'walkover';

          if (isWOFlag) {
            await updateMatch(String(id), { status: 'aberta' });
          }
        } catch (err) {
          console.error('Erro ao atualizar status da partida após remover punição:', err);
        }

        onClose();
      }
    } catch (error: any) {
      console.error('Erro ao deletar punição:', error);
      toast.error(error.response?.data?.message || 'Erro ao deletar punição');
    }
  };

 

  const handleCancel = () => {
    onHide();
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Confirmar Exclusão</Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <p className='text-white'>Tem certeza de que deseja deletar a punição desta partida?</p>
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCancel}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={()=>deletarPunicao(idmatch)}>
          Confirmar Exclusão
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PunicaoPartidaAmistosaDeletarModal;