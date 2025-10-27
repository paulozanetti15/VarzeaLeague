import { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import { api } from '../../../services/api';

interface Referee {
  id: number;
  nome: string;
  cpf: string;
  telefone?: string;
  email?: string;
  certificacao?: string;
  ativo: boolean;
}

interface RefereeFormProps {
  show: boolean;
  referee: Referee | null;
  onClose: () => void;
  onSuccess: () => void;
}

const RefereeForm = ({ show, referee, onClose, onSuccess }: RefereeFormProps) => {
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    email: '',
    certificacao: '',
    ativo: true
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (referee) {
      setFormData({
        nome: referee.nome,
        cpf: referee.cpf,
        telefone: referee.telefone || '',
        email: referee.email || '',
        certificacao: referee.certificacao || '',
        ativo: referee.ativo
      });
    } else {
      resetForm();
    }
  }, [referee]);

  const resetForm = () => {
    setFormData({
      nome: '',
      cpf: '',
      telefone: '',
      email: '',
      certificacao: '',
      ativo: true
    });
    setErrors({});
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return value;
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4,5})(\d{4})$/, '$1-$2');
    }
    return value;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    let formattedValue = value;
    if (name === 'cpf') {
      formattedValue = formatCPF(value);
    } else if (name === 'telefone') {
      formattedValue = formatPhone(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : formattedValue
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    } else if (formData.nome.trim().length < 3) {
      newErrors.nome = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (!formData.cpf) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(formData.cpf)) {
      newErrors.cpf = 'CPF inválido (formato: 000.000.000-00)';
    }

    if (formData.telefone && !/^\(\d{2}\) \d{4,5}-\d{4}$/.test(formData.telefone)) {
      newErrors.telefone = 'Telefone inválido (formato: (00) 00000-0000)';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);

      const dataToSend = {
        ...formData,
        telefone: formData.telefone || undefined,
        email: formData.email || undefined,
        certificacao: formData.certificacao || undefined
      };

      if (referee) {
        await api.referees.update(referee.id, dataToSend);
        toast.success('Árbitro atualizado com sucesso');
      } else {
        await api.referees.create(dataToSend);
        toast.success('Árbitro cadastrado com sucesso');
      }

      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao salvar árbitro');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>
            {referee ? 'Editar Árbitro' : 'Cadastrar Árbitro'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Nome Completo *</Form.Label>
                <Form.Control
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  isInvalid={!!errors.nome}
                  placeholder="Digite o nome completo"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.nome}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>CPF *</Form.Label>
                <Form.Control
                  type="text"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleChange}
                  isInvalid={!!errors.cpf}
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.cpf}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Telefone</Form.Label>
                <Form.Control
                  type="text"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  isInvalid={!!errors.telefone}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.telefone}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  isInvalid={!!errors.email}
                  placeholder="email@exemplo.com"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Certificação</Form.Label>
                <Form.Select
                  name="certificacao"
                  value={formData.certificacao}
                  onChange={handleChange}
                >
                  <option value="">Selecione...</option>
                  <option value="Estadual">Estadual</option>
                  <option value="Nacional">Nacional</option>
                  <option value="FIFA">FIFA</option>
                  <option value="Sem Certificação">Sem Certificação</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {referee && (
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="ativo"
                    label="Árbitro Ativo"
                    checked={formData.ativo}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Salvando...' : referee ? 'Atualizar' : 'Cadastrar'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default RefereeForm;
