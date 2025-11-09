import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../../../config/api';
import { StarRating } from '../../../components/common/StarRating/StarRating';
import './EvaluationEditModal.css';

interface EvaluationEditModalProps {
  show: boolean;
  onClose: () => void;
  matchId: number;
  onSuccess?: () => void;
}

export const EvaluationEditModal: React.FC<EvaluationEditModalProps> = ({
  show,
  onClose,
  matchId,
  onSuccess
}) => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasEvaluation, setHasEvaluation] = useState(false);

  useEffect(() => {
    if (show) {
      fetchMyEvaluation();
    }
  }, [show, matchId]);

  const fetchMyEvaluation = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/friendly-matches/${matchId}/evaluations`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const evaluations = await response.json();
        const userId = localStorage.getItem('userId');
        
        if (userId && Array.isArray(evaluations)) {
          const myEval = evaluations.find((e: any) => String(e.evaluator_id) === userId);
          if (myEval) {
            setRating(myEval.rating);
            setComment(myEval.comment || '');
            setHasEvaluation(true);
          } else {
            setHasEvaluation(false);
          }
        }
      }
    } catch (err) {
      console.error('Erro ao buscar avaliação:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

      const method = hasEvaluation ? 'PUT' : 'POST';
      const response = await fetch(`${API_BASE_URL}/friendly-matches/${matchId}/evaluations`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ rating, comment })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Erro ao salvar avaliação');
      }

      toast.success(hasEvaluation ? 'Avaliação atualizada!' : 'Avaliação criada!');
      onSuccess?.();
      handleClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja deletar sua avaliação?')) {
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

      toast.success('Avaliação deletada!');
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
    setHasEvaluation(false);
    onClose();
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      size="lg"
      className="evaluation-edit-modal"
      dialogClassName="evaluation-edit-modal-dialog"
      contentClassName="evaluation-edit-modal-content"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-star-fill me-2"></i>
          {hasEvaluation ? 'Editar Avaliação' : 'Criar Avaliação'}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="evaluation-form-content">
            <Form.Group className="mb-4">
              <Form.Label className="form-label-black">
                <strong>Sua Nota</strong>
              </Form.Label>
              <div className="star-rating-container">
                <StarRating value={rating} onChange={setRating} size="large" />
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="form-label-black">
                <strong>Comentário</strong>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Compartilhe sua experiência: organização, fair play, pontos positivos..."
                className="evaluation-textarea"
              />
            </Form.Group>

            {hasEvaluation && (
              <div className="alert alert-info">
                <i className="bi bi-info-circle me-2"></i>
                Você já possui uma avaliação. Pode alterar ou deletar.
              </div>
            )}
          </div>
        </Modal.Body>

        <Modal.Footer className="evaluation-modal-footer">
          <div className="footer-actions">
            {hasEvaluation && (
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={loading}
                className="btn-delete-eval"
              >
                <i className="bi bi-trash me-2"></i>
                {loading ? 'Deletando...' : 'Deletar Avaliação'}
              </Button>
            )}
            
            <div className="ms-auto d-flex gap-2">
              <Button variant="secondary" onClick={handleClose} disabled={loading}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={loading || rating === 0}
                className="btn-save-eval"
              >
                <i className="bi bi-check-circle me-2"></i>
                {loading ? 'Salvando...' : (hasEvaluation ? 'Atualizar' : 'Salvar')}
              </Button>
            </div>
          </div>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
