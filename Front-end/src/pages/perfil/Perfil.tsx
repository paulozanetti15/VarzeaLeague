import { useState, useEffect } from 'react';
import axios from 'axios';
import UpdatePasswordModal from '../../components/Modals/Password/UpdatePasswordModal';
import ToastSucessComponent from '../../components/Toast/ToastComponent';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import './Perfil.css';
import { IoChevronBackOutline, IoWarningOutline } from 'react-icons/io5';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import BackButton from '../../components/BackButton';

interface User {
  id: number;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  sexo: string;
  userTypeId: number;
}

interface PerfilProps {
  isLoggedIn: boolean;
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onLogout: () => void;
}

const Perfil = ({ isLoggedIn, onLoginClick, onRegisterClick, onLogout }: PerfilProps) => {
  console.log('🟢 [Perfil] Componente renderizado', { isLoggedIn });
  const [usuario, setUsuario] = useState<User | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [showUpdatePasswordModal, setShowUpdatePasswordModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastBg, setToastBg] = useState('success');
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formCpf, setFormCpf] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formSexo, setFormSexo] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();

  // Estilos inline para manter consistência visual com outras páginas
  const containerStyle = {
    padding: '0',
    minHeight: '100vh',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const cardStyle = {
    maxWidth: '900px',
    margin: '40px auto',
    display: 'flex',
    alignItems: 'flex-start',
    background: '#fff',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(25, 118, 210, 0.10)',
    padding: '2.5rem 2rem',
    gap: '2.5rem',
    minHeight: '340px',
    overflow: 'visible',
    color: '#000000'
  };

  const avatarContainerStyle = {
    flex: '0 0 180px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '180px',
    color: '#000000',
  };

  const avatarStyle = {
    width: '120px',
    height: '120px',
    fontSize: '2.5rem',
    marginBottom: '1.2rem',
    background: '#1976d2',
    color: '#fff',
    fontWeight: 700,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const bodyStyle = {
    padding: '2.5rem',
    backgroundColor: '#ffffff',
  };

  const formGroupStyle = {
    marginBottom: '1.5rem',
    position: 'relative' as const,
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '0.3rem',
    fontWeight: 600,
    color: '#374151',
    fontSize: '1rem',
  };

  const inputStyle = {
    width: '100%',
    padding: '0.7rem 1rem',
    fontSize: '1rem',
    border: '1px solid #e3eaf2',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    transition: 'all 0.3s ease',
    color: '#000000 !important',
    '&::placeholder': {
      color: '#666666'
    }
  };

  const disabledInputStyle = {
    width: '100%',
    padding: '0.7rem 1rem',
    fontSize: '1rem',
    border: '1px solid #e3eaf2',
    borderRadius: '8px',
    backgroundColor: '#f3f4f6',
    transition: 'all 0.3s ease',
    color: '#000000 !important',
    cursor: 'not-allowed',
    '&::placeholder': {
      color: '#666666'
    }
  };

  const buttonPrimaryStyle = {
    width: '100%',
    marginTop: '1.2rem',
    padding: '0.8rem 0',
    backgroundColor: '#1e88e5',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1.08rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginBottom: '1rem',
  };

  const buttonSecondaryStyle = {
    ...buttonPrimaryStyle,
    backgroundColor: '#ffffff',
    color: '#1e88e5',
    border: '1px solid #1e88e5',
  };

  const buttonDangerStyle = {
    ...buttonPrimaryStyle,
    backgroundColor: '#ef4444',
    color: '#ffffff',
  };

  const linkStyle = {
    color: '#1e88e5',
    textDecoration: 'none',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '0.875rem',
  };

  const buttonGroupStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    marginTop: '1.5rem',
    justifyContent: 'center',
  };

  const backButtonStyle = {
    position: 'absolute' as const,
    top: '15px',
    left: '15px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: 500,
    transition: 'all 0.2s ease'
  };

  // Function to handle section navigation from header
  const handleNavigateHome = () => {
    navigate('/');
  };

  useEffect(() => {
    console.log('🟢 [Perfil] useEffect executado');
    const storedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '') : null;
    const userId = storedUser?.id || 0;
    console.log('🟢 [Perfil] Usuario ID:', userId, 'isLoggedIn:', isLoggedIn);
    
    const fetchUserData = async (userId: number) => {
      try {
        console.log('🟢 [Perfil] Buscando dados do usuário:', userId);
        const response = await axios.get(`${API_BASE_URL}/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.status === 200) {
          const userData = response.data;
          console.log('✅ [Perfil] Dados carregados:', userData);
          setUsuario(userData);
          setFormName(userData.name || '');
          setFormEmail(userData.email || '');
          setFormCpf(userData.cpf || '');
          setFormPhone(userData.phone || '');
          setFormSexo(userData.sexo || '');
        }
      } catch (error) {
        console.error('❌ [Perfil] Erro ao buscar dados do usuário:', error);
        showToastMessage('Erro ao carregar dados do usuário', 'danger');
      }
    };
    
    if (userId) {
      fetchUserData(userId);
    }
  }, []);

  const showToastMessage = (message: string, bg: string) => {
    setToastMessage(message);
    setToastBg(bg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const handleSaveChanges = async () => {
    if (!usuario) return;
    
    try {
      // Validações
      const trimmedEmail = formEmail.trim();
      const trimmedName = formName.trim();
      const trimmedPhone = formPhone.trim();

      if (!trimmedName) {
        showToastMessage('O nome é obrigatório', 'danger');
        return;
      }

      if (!validateEmail(trimmedEmail)) {
        showToastMessage('Email inválido', 'danger');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        showToastMessage('Sessão expirada. Por favor, faça login novamente.', 'danger');
        navigate('/login');
        return;
      }

      // Verifica quais campos realmente mudaram
      const changes: any = {};
      
      if (trimmedName !== usuario.name) changes.name = trimmedName;
      if (trimmedEmail !== usuario.email) changes.email = trimmedEmail;
      if (trimmedPhone !== usuario.phone) changes.phone = trimmedPhone;
      if (formSexo !== usuario.sexo) changes.sexo = formSexo;

      // Se não houver mudanças, não faz a requisição
      if (Object.keys(changes).length === 0) {
        setEditMode(false);
        showToastMessage('Nenhuma alteração foi feita', 'info');
        return;
      }

      const response = await axios.put(
        `${API_BASE_URL}/user/${usuario.id}`,
        changes,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.status === 200) {
        // Atualiza o estado local mantendo os campos que não foram alterados
        setUsuario(prev => {
          if (!prev) return null;
          return {
            ...prev,
            ...changes
          };
        });
        
        // Atualiza os dados no localStorage mantendo outros campos que possam existir
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = {
          ...storedUser,
          ...changes
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        setEditMode(false);
        showToastMessage('Perfil atualizado com sucesso', 'success');
      }
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error);
      let errorMessage = 'Erro ao atualizar perfil';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      showToastMessage(errorMessage, 'danger');
      
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (!usuario) return;
    setShowDeleteModal(true);
  };

  const confirmDeleteAccount = async () => {
    if (!usuario) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToastMessage('Sessão expirada. Por favor, faça login novamente.', 'danger');
        navigate('/login');
        return;
      }

      const response = await axios.delete(
        `${API_BASE_URL}/user/${usuario.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        showToastMessage('Conta excluída com sucesso', 'success');
        
        // Limpa os dados locais
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        
        // Aguarda a mensagem ser exibida antes de redirecionar
        setTimeout(() => {
          onLogout();
          navigate('/login');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Erro ao excluir conta:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao excluir conta';
      showToastMessage(errorMessage, 'danger');
      
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setShowDeleteModal(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handlePasswordChange = () => {
    setShowUpdatePasswordModal(true);
  };

  const handleCancelEdit = () => {
    if (usuario) {
      setFormName(usuario.name);
      setFormEmail(usuario.email);
    }
    setEditMode(false);
  };

  return (
    <div className="profile-page" style={{ paddingTop: 80, color: '#000000' }}>
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={avatarContainerStyle}>
            <div style={avatarStyle}>
              {usuario?.name ? getInitials(usuario.name) : ''}
            </div>
            <h3 style={{ 
              fontWeight: 600, 
              color: '#000000', 
              margin: 0, 
              textAlign: 'center', 
              marginBottom: '1.2rem',
              fontSize: '1.5rem'
            }}>
              {usuario?.name || 'Carregando...'}
            </h3>
            <p style={{ 
              color: '#000000', 
              margin: '0.25rem 0 0', 
              textAlign: 'center', 
              marginBottom: '1.2rem',
              fontSize: '1rem'
            }}>
              {usuario?.email || 'Carregando...'}
            </p>
          </div>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', color: '#000000' }}>
            <form style={{ width: '100%', color: '#000000' }} onSubmit={(e) => {
              e.preventDefault();
              if (editMode) {
                handleSaveChanges();
              } else {
                setEditMode(true);
              }
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.5rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ ...labelStyle, color: '#000000', fontSize: '1rem', marginBottom: '0.5rem' }}>Nome</label>
                  <input
                    type="text"
                    style={{
                      ...inputStyle,
                      color: '#000000',
                      WebkitTextFillColor: '#000000',
                      fontSize: '1rem',
                      backgroundColor: editMode ? '#ffffff' : '#f3f4f6'
                    }}
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Seu nome completo"
                    disabled={!editMode}
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ ...labelStyle, color: '#000000', fontSize: '1rem', marginBottom: '0.5rem' }}>CPF</label>
                  <input
                    type="text"
                    style={{
                      ...disabledInputStyle,
                      color: '#000000',
                      WebkitTextFillColor: '#000000',
                      fontSize: '1rem'
                    }}
                    value={formCpf}
                    disabled
                    readOnly
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.5rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ ...labelStyle, color: '#000000', fontSize: '1rem', marginBottom: '0.5rem' }}>Sexo</label>
                  {editMode ? (
                    <select
                      style={{
                        ...inputStyle,
                        color: '#000000',
                        WebkitTextFillColor: '#000000',
                        fontSize: '1rem',
                        backgroundColor: '#ffffff'
                      }}
                      value={formSexo}
                      onChange={(e) => setFormSexo(e.target.value)}
                      required
                    >
                      <option value="" style={{ color: '#000000' }}>Selecione</option>
                      <option value="Masculino" style={{ color: '#000000' }}>Masculino</option>
                      <option value="Feminino" style={{ color: '#000000' }}>Feminino</option>
                      <option value="Prefiro não informar" style={{ color: '#000000' }}>Prefiro não informar</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      style={{
                        ...disabledInputStyle,
                        color: '#000000',
                        WebkitTextFillColor: '#000000',
                        fontSize: '1rem'
                      }}
                      value={formSexo}
                      disabled
                      readOnly
                    />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ ...labelStyle, color: '#000000', fontSize: '1rem', marginBottom: '0.5rem' }}>Telefone</label>
                  <input
                    type="text"
                    style={{
                      ...(editMode ? inputStyle : disabledInputStyle),
                      color: '#000000',
                      WebkitTextFillColor: '#000000',
                      fontSize: '1rem',
                      backgroundColor: editMode ? '#ffffff' : '#f3f4f6'
                    }}
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="Seu telefone"
                    disabled={!editMode}
                    required
                  />
                </div>
              </div>
              <div style={{ gridColumn: '1 / span 2', marginBottom: '1.5rem' }}>
                <label style={{ ...labelStyle, color: '#000000', fontSize: '1rem', marginBottom: '0.5rem' }}>E-mail</label>
                <input
                  type="email"
                  style={{
                    ...(editMode ? inputStyle : disabledInputStyle),
                    color: '#000000',
                    WebkitTextFillColor: '#000000',
                    fontSize: '1rem',
                    backgroundColor: editMode ? '#ffffff' : '#f3f4f6'
                  }}
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="Seu e-mail"
                  disabled={!editMode}
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.2rem' }}>
                {editMode ? (
                  <>
                    <button type="button" style={buttonSecondaryStyle} onClick={handleCancelEdit}>Cancelar</button>
                    <button type="submit" style={buttonPrimaryStyle}>Salvar alterações</button>
                  </>
                ) : (
                  <>
                    <button type="button" style={buttonPrimaryStyle} onClick={handlePasswordChange}>Alterar senha</button>
                    <button type="submit" style={buttonPrimaryStyle}>Editar perfil</button>
                    <button type="button" style={buttonDangerStyle} onClick={handleDeleteAccount}>Excluir conta</button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {usuario && (
        <UpdatePasswordModal 
          userId={usuario.id}
          show={showUpdatePasswordModal}
          onHide={() => setShowUpdatePasswordModal(false)}
        />
      )}
      
      {showToast && (
        <ToastSucessComponent
          message={toastMessage}
          bg={toastBg}
          onClose={() => setShowToast(false)}
        />
      )}
      
      {showDeleteModal && (
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered dialogClassName="delete-account-modal">
          <Modal.Header closeButton style={{ background: '#fff8e1', borderBottom: 'none', justifyContent: 'center' }}>
            <Modal.Title style={{ color: '#b45309', display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.3rem', justifyContent: 'center', width: '100%' }}>
              <IoWarningOutline size={32} style={{ color: '#f59e42', marginBottom: 2 }} /> Atenção
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ textAlign: 'center', background: '#fffde7', padding: '2rem 1.5rem 1.5rem 1.5rem' }}>
            <div style={{ fontWeight: 600, color: '#b45309', fontSize: '1.08rem', marginBottom: 10 }}>
              Tem certeza que deseja excluir sua conta?
            </div>
            <div style={{ color: '#b45309', fontSize: '0.97rem', marginBottom: 8 }}>
              Esta ação <b>não pode ser desfeita</b> e todos os seus dados serão perdidos.
            </div>
          </Modal.Body>
          <Modal.Footer style={{ background: '#fffde7', borderTop: 'none', justifyContent: 'center', padding: '1rem 1.5rem 1.5rem 1.5rem' }}>
            <Button variant="outline-secondary" onClick={() => setShowDeleteModal(false)} style={{ minWidth: 110, fontWeight: 500 }}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={confirmDeleteAccount} style={{ minWidth: 130, fontWeight: 600, marginLeft: 10 }}>
              Excluir conta
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default Perfil;
    
       
        
