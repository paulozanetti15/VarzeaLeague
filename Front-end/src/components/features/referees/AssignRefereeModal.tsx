import { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, ListGroup, Badge, Alert } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import { api } from '../../../services/api';
import { Delete, PersonAdd } from '@mui/icons-material';

interface Referee {
  id: number;
  nome: string;
  cpf: string;
  telefone?: string;
  email?: string;
  certificacao?: string;
  ativo: boolean;
}

interface MatchReferee {
  id: number;
  match_id: number;
  referee_id: number;
  tipo: 'principal' | 'auxiliar';
  referee?: Referee;
}

interface AssignRefereeModalProps {
  show: boolean;
  matchId: number;
  onClose: () => void;
  onSuccess: () => void;
}

const AssignRefereeModal = ({ show, matchId, onClose, onSuccess }: AssignRefereeModalProps) => {
  const [referees, setReferees] = useState<Referee[]>([]);
  const [matchReferees, setMatchReferees] = useState<MatchReferee[]>([]);
  const [selectedRefereeId, setSelectedRefereeId] = useState<string>('');
  const [tipo, setTipo] = useState<'principal' | 'auxiliar'>('principal');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (show && matchId) {
      loadData();
    }
  }, [show, matchId]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const [refereesData, matchRefereesData] = await Promise.all([
        api.referees.list({ ativo: true }),
        api.referees.getByMatch(matchId)
      ]);
      setReferees(refereesData);
      setMatchReferees(matchRefereesData);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao carregar dados');
    } finally {
      setLoadingData(false);
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRefereeId) {
      toast.error('Selecione um árbitro');
      return;
    }

    try {
      setLoading(true);
      await api.referees.assignToMatch(matchId, parseInt(selectedRefereeId), tipo);
      toast.success('Árbitro associado com sucesso');
      setSelectedRefereeId('');
      setTipo('principal');
      await loadData();
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao associar árbitro');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (refereeId: number) => {
    if (!window.confirm('Tem certeza que deseja remover este árbitro da partida?')) {
      return;
    }

    try {
      await api.referees.removeFromMatch(matchId, refereeId);
      toast.success('Árbitro removido com sucesso');
      await loadData();
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao remover árbitro');
    }
  };

  const getAvailableReferees = () => {
    const assignedIds = matchReferees.map(mr => mr.referee_id);
    return referees.filter(r => !assignedIds.includes(r.id));
  };

  const handleClose = () => {
    setSelectedRefereeId('');
    setTipo('principal');
    onClose();
  };

  const hasPrincipal = matchReferees.some(mr => mr.tipo === 'principal');

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Gerenciar Árbitros da Partida</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loadingData ? (
          <div className="text-center py-4">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <h6 className="mb-3">Árbitros Associados</h6>
              {matchReferees.length === 0 ? (
                <Alert variant="info" className="mb-0">
                  Nenhum árbitro associado a esta partida.
                </Alert>
              ) : (
                <ListGroup>
                  {matchReferees.map((mr) => (
                    <ListGroup.Item
                      key={mr.id}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <strong>{mr.referee?.nome}</strong>
                        <br />
                        <small className="text-muted">
                          CPF: {mr.referee?.cpf}
                          {mr.referee?.certificacao && ` | ${mr.referee.certificacao}`}
                        </small>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <Badge bg={mr.tipo === 'principal' ? 'primary' : 'secondary'}>
                          {mr.tipo === 'principal' ? 'Principal' : 'Auxiliar'}
                        </Badge>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleRemove(mr.referee_id)}
                        >
                          <Delete fontSize="small" />
                        </Button>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </div>

            <hr />

            <div>
              <h6 className="mb-3">Associar Novo Árbitro</h6>
              {getAvailableReferees().length === 0 ? (
                <Alert variant="warning" className="mb-0">
                  Todos os árbitros ativos já estão associados a esta partida.
                </Alert>
              ) : (
                <Form onSubmit={handleAssign}>
                  <Row>
                    <Col md={7}>
                      <Form.Group className="mb-3">
                        <Form.Label>Árbitro</Form.Label>
                        <Form.Select
                          value={selectedRefereeId}
                          onChange={(e) => setSelectedRefereeId(e.target.value)}
                          required
                        >
                          <option value="">Selecione um árbitro...</option>
                          {getAvailableReferees().map((referee) => (
                            <option key={referee.id} value={referee.id}>
                              {referee.nome} - {referee.cpf}
                              {referee.certificacao && ` (${referee.certificacao})`}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={5}>
                      <Form.Group className="mb-3">
                        <Form.Label>Tipo</Form.Label>
                        <Form.Select
                          value={tipo}
                          onChange={(e) => setTipo(e.target.value as 'principal' | 'auxiliar')}
                          required
                        >
                          <option value="principal" disabled={hasPrincipal}>
                            Principal {hasPrincipal ? '(já definido)' : ''}
                          </option>
                          <option value="auxiliar">Auxiliar</option>
                        </Form.Select>
                        {hasPrincipal && tipo === 'principal' && (
                          <Form.Text className="text-warning">
                            Já existe um árbitro principal. Selecione "Auxiliar".
                          </Form.Text>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>
                  <div className="d-flex justify-content-end">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={loading || (hasPrincipal && tipo === 'principal')}
                    >
                      <PersonAdd className="me-2" />
                      {loading ? 'Associando...' : 'Associar Árbitro'}
                    </Button>
                  </div>
                </Form>
              )}
            </div>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AssignRefereeModal;
