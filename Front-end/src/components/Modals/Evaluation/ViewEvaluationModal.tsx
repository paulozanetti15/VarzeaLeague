import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../../../config/api';
import { StarRating } from '../../../components/common/StarRating/StarRating';
import { useAuth } from '../../../hooks/useAuth';
import './ViewEvaluationModal.css';

interface ViewEvaluationModalProps {
  show: boolean;
  onClose: () => void;
  matchId: number;
  onEdit: () => void;
  onSuccess?: () => void;
}

export const ViewEvaluationModal: React.FC<ViewEvaluationModalProps> = ({
  show,
  onClose,
  matchId,
  onEdit,
  onSuccess
}) => {
  const { user } = useAuth();
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (show) {
      fetchMyEvaluation();
    }
  }, [show, matchId]);

  const fetchMyEvaluation = async () => {
    setLoadingData(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Não autenticado');
        onClose();
        return;
      }

      const response = await fetch(`${API_BASE_URL}/friendly-matches/${matchId}/evaluations`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const evaluations = await response.json();
        const userId = user?.id;
        
        if (userId && Array.isArray(evaluations)) {
          const myEval = evaluations.find((e: any) => e.evaluator_id === userId);
          if (myEval) {
            setRating(myEval.rating);
            setComment(myEval.comment || '');
          } else {
            toast.error('Você ainda não tem uma avaliação');
            onClose();
          }
        }
      }
    } catch (err) {
      console.error('Erro ao buscar avaliação:', err);
      toast.error('Erro ao carregar sua avaliação');
    } finally {
      setLoadingData(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja deletar sua avaliação?')) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Não autenticado');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/friendly-matches/${matchId}/evaluations`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Erro ao deletar avaliação');
      }

      toast.success('Avaliação deletada com sucesso!');
      onSuccess?.();
      handleClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setComment('');
    onClose();
  };

  const handleEditClick = () => {
    handleClose();
    onEdit();
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      size="lg"
      dialogClassName="evaluation-view-modal"
      contentClassName="evaluation-view-modal-content"
    >
      <Modal.Header closeButton className="view-eval-header">
        <Modal.Title>
          <i className="bi bi-eye me-2"></i>
          Minha Avaliação
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="view-eval-body">
        {loadingData ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="eval-label-view">
                <strong>Sua Avaliação</strong>
              </div>
              <div className="star-rating-wrapper-view">
                <StarRating value={rating} onChange={() => {}} readOnly size={40} />
              </div>
            </div>

            {comment && (
              <div className="mb-3">
                <div className="eval-label-view mb-3">
                  <strong>Seu Comentário</strong>
                </div>
                <div className="comment-display">
                  {comment}
                </div>
              </div>
            )}

            {!comment && (
              <div className="mb-3">
                <div className="comment-display text-center" style={{ fontStyle: 'italic', color: '#999' }}>
                  Nenhum comentário adicionado
                </div>
              </div>
            )}
          </>
        )}
      </Modal.Body>

      <Modal.Footer className="view-eval-footer">
        <Button
          variant="primary"
          onClick={handleEditClick}
          disabled={loading || loadingData}
        >
          <i className="bi bi-pencil me-2"></i>
          Editar
        </Button>
        
        <Button
          variant="danger"
          onClick={handleDelete}
          disabled={loading || loadingData}
        >
          <i className="bi bi-trash me-2"></i>
          {loading ? 'Deletando...' : 'Deletar'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
