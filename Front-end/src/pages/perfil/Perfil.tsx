import { useState, useEffect } from 'react';
import axios from 'axios';
import { Header } from '../../components/landing/Header';
import UpdatePasswordModal from '../../components/Modals/Password/UpdatePasswordModal';
import ToastSucessComponent from '../../components/Toast/ToastComponent';
import { useNavigate } from 'react-router-dom';
import './Perfil.css';
import { IoChevronBackOutline, IoWarningOutline } from 'react-icons/io5';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

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
    minHeight: 'calc(100vh - 56px)', // Subtract header height
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
    padding: '2rem 1rem',
    width: '100%',
    marginTop: '0', // Remove the margin-top that was causing white space
  };

  const cardStyle = {
    width: '100%',
    maxWidth: '550px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 8px 30px rgba(25, 118, 210, 0.15)',
    overflow: 'hidden' as const,
    position: 'relative' as const,
  };

  const headerStyle = {
    backgroundColor: '#1e88e5',
    color: '#ffffff',
    padding: '2rem',
    textAlign: 'center' as const,
    position: 'relative' as const,
  };

  const titleStyle = {
    fontSize: '1.75rem',
    fontWeight: 700,
    marginBottom: '0.5rem',
    color: '#ffffff',
  };

  const subtitleStyle = {
    fontSize: '1rem',
    opacity: 0.9,
    color: '#ffffff',
    marginBottom: '1.5rem',
  };

  const triangleStyle = {
    content: '',
    position: 'absolute' as const,
    bottom: '-10px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '50px',
    height: '20px',
    backgroundColor: '#ffffff',
    clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
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
    marginBottom: '0.5rem',
    fontWeight: 500,
    color: '#374151',
    fontSize: '0.95rem',
  };

  const inputStyle = {
    width: '100%',
    padding: '0.875rem 1rem',
    fontSize: '1rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    backgroundColor: '#f9fafb',
    transition: 'all 0.3s ease',
  };

  const disabledInputStyle = {
    ...inputStyle,
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
    cursor: 'not-allowed',
  };

  const buttonPrimaryStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    backgroundColor: '#1e88e5',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
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

  const avatarContainerStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '2rem',
  };

  const avatarStyle = {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    backgroundColor: '#1e88e5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontSize: '2.5rem',
    fontWeight: 700,
    marginBottom: '1rem',
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
    const storedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '') : null;
    const userId = storedUser?.id || 0;
    
    const fetchUserData = async (userId: number) => {
      try {
        const response = await axios.get(`http://localhost:3001/api/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.status === 200) {
          setUsuario(response.data);
          setFormName(response.data.name);
          setFormEmail(response.data.email);
          setFormCpf(response.data.cpf);
          setFormPhone(response.data.phone);
          setFormSexo(response.data.sexo);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        showToastMessage('Erro ao carregar dados do usuário', 'danger');
      }
    };
    
    fetchUserData(userId);
  }, []);

  const showToastMessage = (message: string, bg: string) => {
    setToastMessage(message);
    setToastBg(bg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSaveChanges = async () => {
    if (!usuario) return;
    
    try {
      const response = await axios.put(
        `http://localhost:3001/api/user/${usuario.id}`,
        {
          name: formName,
          email: formEmail,
          phone: formPhone,
          sexo: formSexo,
          // cpf: formCpf, // descomente se quiser permitir edição do CPF
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.status === 200) {
        setUsuario({
          ...usuario,
          name: formName,
          email: formEmail,
          phone: formPhone,
          sexo: formSexo,
          // cpf: formCpf, // descomente se quiser permitir edição do CPF
        });
        setEditMode(false);
        showToastMessage('Perfil atualizado com sucesso', 'success');
        
        // Atualizar dados no localStorage
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        storedUser.name = formName;
        storedUser.email = formEmail;
        storedUser.phone = formPhone;
        storedUser.sexo = formSexo;
        // storedUser.cpf = formCpf; // descomente se quiser permitir edição do CPF
        localStorage.setItem('user', JSON.stringify(storedUser));
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      showToastMessage('Erro ao atualizar perfil', 'danger');
    }
  };

  const handleDeleteAccount = async () => {
    if (!usuario) return;
    setShowDeleteModal(true);
  };

  const confirmDeleteAccount = async () => {
    if (!usuario) return;
    try {
      const response = await axios.delete(`http://localhost:3001/api/user/${usuario.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.status === 200) {
        showToastMessage('Conta excluída com sucesso', 'success');
        setTimeout(() => {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          onLogout();
          window.location.href = '/login';
        }, 2000);
      }
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      showToastMessage('Erro ao excluir conta', 'danger');
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
    <div className="profile-page">
      <Header 
        isLoggedIn={isLoggedIn}
        onLoginClick={onLoginClick}
        onRegisterClick={onRegisterClick}
        user={usuario}
        onLogout={onLogout}
      />
      
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={headerStyle}>
            <button 
              style={backButtonStyle} 
              onClick={handleNavigateHome}
              title="Voltar para a página inicial"
            >
              <IoChevronBackOutline /> Voltar
            </button>
            <h1 style={titleStyle}>Meu Perfil</h1>
            <p style={subtitleStyle}>Gerencie suas informações pessoais</p>
            <div style={triangleStyle}></div>
          </div>
          
          <div style={bodyStyle}>
            {usuario && (
              <>
                <div style={avatarContainerStyle}>
                  <div style={avatarStyle}>
                    {getInitials(usuario.name)}
                  </div>
                  <h3 style={{ fontWeight: 600, color: '#374151', margin: 0 }}>
                    {usuario.name}
                  </h3>
                  <p style={{ color: '#6b7280', margin: '0.25rem 0 0' }}>
                    {usuario.email}
                  </p>
                </div>
                
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (editMode) {
                    handleSaveChanges();
                  } else {
                    setEditMode(true);
                  }
                }}>
                  <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Nome</label>
                      <input
                        type="text"
                        style={editMode ? inputStyle : disabledInputStyle}
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="Seu nome completo"
                        disabled={!editMode}
                        required
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>CPF</label>
                      <input
                        type="text"
                        style={disabledInputStyle}
                        value={formCpf}
                        disabled
                        readOnly
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Sexo</label>
                      {editMode ? (
                        <select
                          style={inputStyle}
                          value={formSexo}
                          onChange={(e) => setFormSexo(e.target.value)}
                          required
                        >
                          <option value="">Selecione</option>
                          <option value="Masculino">Masculino</option>
                          <option value="Feminino">Feminino</option>
                          <option value="Prefiro não informar">Prefiro não informar</option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          style={disabledInputStyle}
                          value={formSexo}
                          disabled
                          readOnly
                        />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Telefone</label>
                      <input
                        type="text"
                        style={editMode ? inputStyle : disabledInputStyle}
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        placeholder="Seu telefone"
                        disabled={!editMode}
                        required
                      />
                    </div>
                  </div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={labelStyle}>E-mail</label>
                    <input
                      type="email"
                      style={editMode ? inputStyle : disabledInputStyle}
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="Seu e-mail"
                      disabled={!editMode}
                      required
                    />
                  </div>
                  <div style={buttonGroupStyle}>
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
              </>
            )}
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
    
       
        
