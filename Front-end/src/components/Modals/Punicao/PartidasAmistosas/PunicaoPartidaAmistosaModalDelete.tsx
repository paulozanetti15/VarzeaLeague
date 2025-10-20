import React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import axios from 'axios';
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
  const token = localStorage.getItem('token');

  const deletarPunicao = async (id: number) => {
    try {
      const response = await axios.delete(`http://localhost:3001/api/matches/${id}/punicao`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.status === 200) {
        try {
          // Após excluir a punição, verificar o status atual da partida
          const matchResp = await axios.get(`http://localhost:3001/api/matches/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          const matchData = matchResp.data;
          const status = String(matchData?.status || '').toLowerCase();
          const isWOFlag = !!matchData?.isWO || status === 'wo' || status === 'walkover';

          if (isWOFlag) {
            // atualizar status da partida para 'aberta'
            await axios.put(`http://localhost:3001/api/matches/${id}`, { status: 'aberta' }, {
              headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
          }
        } catch (err) {
          // se falhar em atualizar o status, não bloqueia a remoção da punição
          console.error('Erro ao atualizar status da partida após remover punição:', err);
        }

        onClose(); // Fecha o modal
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