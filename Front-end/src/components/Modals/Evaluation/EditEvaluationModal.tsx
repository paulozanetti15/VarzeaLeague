import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../../../config/api';
import { StarRating } from '../../../components/common/StarRating/StarRating';
import { useAuth } from '../../../hooks/useAuth';
import './EditEvaluationModal.css';

interface EditEvaluationModalProps {
  show: boolean;
  onClose: () => void;
  matchId: number;
  onSuccess?: () => void;
}

export const EditEvaluationModal: React.FC<EditEvaluationModalProps> = ({
  show,
  onClose,
  matchId,
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
        
        console.log('EditModal - UserId:', userId, 'Evaluations:', evaluations);
        
        if (userId && Array.isArray(evaluations)) {
          const myEval = evaluations.find((e: any) => e.evaluator_id === userId);
          if (myEval) {
            setRating(myEval.rating);
            setComment(myEval.comment || '');
          } else {
            toast.error('Você ainda não tem uma avaliação para editar');
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

  const handleUpdate = async () => {
    if (rating < 1 || rating > 5) {
      toast.error('Selecione uma nota de 1 a 5');
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
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ rating, comment })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Erro ao atualizar avaliação');
      }

      toast.success('Avaliação atualizada com sucesso!');
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

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton className="edit-eval-header">
        <Modal.Title style={{color:"black"}}>
          <i className="bi bi-pencil-square me-2"></i>
          Editar Avaliação
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="edit-eval-body">
        {loadingData ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
          </div>
        ) : (
          <>
            <Form.Group className="mb-4">
              <Form.Label className="eval-label">
                <strong>Sua Nota</strong>
              </Form.Label>
              <div className="star-rating-wrapper">
                <StarRating value={rating} onChange={setRating} />
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="eval-label">
                <strong>Comentário</strong>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Compartilhe sua experiência..."
                className="eval-comment-box"
              />
            </Form.Group>
          </>
        )}
      </Modal.Body>

      <Modal.Footer className="edit-eval-footer">
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        
        <Button
          variant="primary"
          onClick={handleUpdate}
          disabled={loading || loadingData || rating === 0}
        >
          <i className="bi bi-check-circle me-2"></i>
          {loading ? 'Salvando...' : 'Atualizar'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
