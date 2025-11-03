import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button, Modal, Form, Alert } from 'react-bootstrap';
import { Block, CheckCircle } from '@mui/icons-material';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

interface Suspension {
  id: number;
  player_id: number;
  championship_id: number | null;
  reason: 'yellow_cards' | 'red_card' | 'manual';
  yellow_cards_accumulated: number;
  games_to_suspend: number;
  games_suspended: number;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  notes: string | null;
  player?: {
    id: number;
    nome: string;
  };
  championship?: {
    id: number;
    nome: string;
  };
}

export const SuspensionsManagement: React.FC = () => {
  const { user } = useAuth();
  const [suspensions, setSuspensions] = useState<Suspension[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    playerId: '',
    championshipId: '',
    gamesToSuspend: '1',
    notes: '',
  });

  const canManage = user && (user.userTypeId === 1 || user.userTypeId === 2);

  useEffect(() => {
    loadSuspensions();
  }, []);

  const loadSuspensions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('http://localhost:3001/api/players/suspensions/all', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuspensions(response.data);
    } catch (error) {
      console.error('Erro ao carregar suspensões:', error);
      toast.error('Erro ao carregar suspensões');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuspension = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.post(
        'http://localhost:3001/api/players/suspension/manual',
        {
          playerId: Number(formData.playerId),
          championshipId: formData.championshipId ? Number(formData.championshipId) : null,
          gamesToSuspend: Number(formData.gamesToSuspend),
          notes: formData.notes,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success('Suspensão criada com sucesso');
      setShowCreateModal(false);
      setFormData({
        playerId: '',
        championshipId: '',
        gamesToSuspend: '1',
        notes: '',
      });
      loadSuspensions();
    } catch (error: any) {
      console.error('Erro ao criar suspensão:', error);
      toast.error(error.response?.data?.error || 'Erro ao criar suspensão');
    }
  };

  const getReasonBadge = (reason: string) => {
    switch (reason) {
      case 'yellow_cards':
        return <Badge bg="warning">Cartões Amarelos</Badge>;
      case 'red_card':
        return <Badge bg="danger">Cartão Vermelho</Badge>;
      case 'manual':
        return <Badge bg="info">Manual</Badge>;
      default:
        return <Badge bg="secondary">{reason}</Badge>;
    }
  };

  const getStatusIcon = (suspension: Suspension) => {
    if (suspension.is_active) {
      return <Block color="error" />;
    }
    return <CheckCircle color="success" />;
  };

  if (!canManage) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          Você não tem permissão para acessar esta página.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0">
            <Block className="me-2" />
            Gerenciamento de Suspensões
          </h4>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            Criar Suspensão Manual
          </Button>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center p-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Carregando...</span>
              </div>
            </div>
          ) : (
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Jogador</th>
                  <th>Campeonato</th>
                  <th>Motivo</th>
                  <th>Jogos Suspenso</th>
                  <th>Cartões Amarelos</th>
                  <th>Data Início</th>
                  <th>Observações</th>
                </tr>
              </thead>
              <tbody>
                {suspensions.map((suspension) => (
                  <tr key={suspension.id}>
                    <td>{getStatusIcon(suspension)}</td>
                    <td>{suspension.player?.nome || `ID: ${suspension.player_id}`}</td>
                    <td>
                      {suspension.championship?.nome || 
                       (suspension.championship_id ? `ID: ${suspension.championship_id}` : 'Partida Amistosa')}
                    </td>
                    <td>{getReasonBadge(suspension.reason)}</td>
                    <td>
                      {suspension.games_suspended} / {suspension.games_to_suspend}
                    </td>
                    <td>
                      {suspension.yellow_cards_accumulated > 0 && (
                        <Badge bg="warning">{suspension.yellow_cards_accumulated}</Badge>
                      )}
                    </td>
                    <td>{new Date(suspension.start_date).toLocaleDateString('pt-BR')}</td>
                    <td>
                      <small>{suspension.notes}</small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Criar Suspensão Manual</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateSuspension}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>ID do Jogador *</Form.Label>
              <Form.Control
                type="number"
                value={formData.playerId}
                onChange={(e) => setFormData({ ...formData, playerId: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>ID do Campeonato (opcional)</Form.Label>
              <Form.Control
                type="number"
                value={formData.championshipId}
                onChange={(e) => setFormData({ ...formData, championshipId: e.target.value })}
                placeholder="Deixe vazio para partidas amistosas"
              />
              <Form.Text className="text-muted">
                Deixe vazio se a suspensão for para partidas amistosas
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Jogos de Suspensão *</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={formData.gamesToSuspend}
                onChange={(e) => setFormData({ ...formData, gamesToSuspend: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Observações</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Motivo da suspensão manual..."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Criar Suspensão
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default SuspensionsManagement;
