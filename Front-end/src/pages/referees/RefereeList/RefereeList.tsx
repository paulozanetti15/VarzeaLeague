import { useState, useEffect } from 'react';
import { 
  Container, 
  Card, 
  Button, 
  Table, 
  Form, 
  InputGroup,
  Badge,
  Modal
} from 'react-bootstrap';
import { Search, PersonAdd, Edit, Delete, Visibility } from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { api } from '../../../services/api';
import RefereeForm from './RefereeForm.tsx';
import './RefereeList.css';

interface Referee {
  id: number;
  nome: string;
  cpf: string;
  telefone?: string;
  email?: string;
  certificacao?: string;
  ativo: boolean;
}

const RefereeList = () => {
  const [referees, setReferees] = useState<Referee[]>([]);
  const [filteredReferees, setFilteredReferees] = useState<Referee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showForm, setShowForm] = useState(false);
  const [selectedReferee, setSelectedReferee] = useState<Referee | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [refereeToDelete, setRefereeToDelete] = useState<Referee | null>(null);

  useEffect(() => {
    loadReferees();
  }, []);

  useEffect(() => {
    filterReferees();
  }, [referees, searchTerm, filterStatus]);

  const loadReferees = async () => {
    try {
      setLoading(true);
      const data = await api.referees.list();
      setReferees(data);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao carregar árbitros');
    } finally {
      setLoading(false);
    }
  };

  const filterReferees = () => {
    let filtered = [...referees];

    if (filterStatus === 'active') {
      filtered = filtered.filter(r => r.ativo);
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter(r => !r.ativo);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.nome.toLowerCase().includes(term) ||
        r.cpf.includes(term) ||
        r.email?.toLowerCase().includes(term)
      );
    }

    setFilteredReferees(filtered);
  };

  const handleCreate = () => {
    setSelectedReferee(null);
    setShowForm(true);
  };

  const handleEdit = (referee: Referee) => {
    setSelectedReferee(referee);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedReferee(null);
  };

  const handleFormSuccess = () => {
    loadReferees();
    handleFormClose();
  };

  const confirmDelete = (referee: Referee) => {
    setRefereeToDelete(referee);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!refereeToDelete) return;

    try {
      await api.referees.delete(refereeToDelete.id);
      toast.success('Árbitro excluído/desativado com sucesso');
      loadReferees();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao excluir árbitro');
    } finally {
      setShowDeleteModal(false);
      setRefereeToDelete(null);
    }
  };

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container className="referee-list-container mt-4">
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Árbitros</h4>
          <Button variant="primary" onClick={handleCreate}>
            <PersonAdd className="me-2" />
            Cadastrar Árbitro
          </Button>
        </Card.Header>
        <Card.Body>
          <div className="filters-section mb-3">
            <div className="row g-3">
              <div className="col-md-6">
                <InputGroup>
                  <InputGroup.Text>
                    <Search />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Buscar por nome, CPF ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </div>
              <div className="col-md-3">
                <Form.Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                >
                  <option value="all">Todos</option>
                  <option value="active">Ativos</option>
                  <option value="inactive">Inativos</option>
                </Form.Select>
              </div>
              <div className="col-md-3 text-end">
                <Badge bg="info" className="fs-6">
                  Total: {filteredReferees.length}
                </Badge>
              </div>
            </div>
          </div>

          {filteredReferees.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">Nenhum árbitro encontrado</p>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>CPF</th>
                  <th>Telefone</th>
                  <th>Email</th>
                  <th>Certificação</th>
                  <th>Status</th>
                  <th className="text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredReferees.map((referee) => (
                  <tr key={referee.id}>
                    <td>{referee.nome}</td>
                    <td>{referee.cpf}</td>
                    <td>{referee.telefone || '-'}</td>
                    <td>{referee.email || '-'}</td>
                    <td>{referee.certificacao || '-'}</td>
                    <td>
                      <Badge bg={referee.ativo ? 'success' : 'secondary'}>
                        {referee.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </td>
                    <td className="text-center">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEdit(referee)}
                      >
                        <Edit fontSize="small" />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => confirmDelete(referee)}
                      >
                        <Delete fontSize="small" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <RefereeForm
        show={showForm}
        referee={selectedReferee}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
      />

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Tem certeza que deseja excluir o árbitro <strong>{refereeToDelete?.nome}</strong>?
          {refereeToDelete && (
            <p className="text-muted mt-2 mb-0">
              Nota: Se o árbitro possuir partidas vinculadas, ele será apenas desativado.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Confirmar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default RefereeList;
