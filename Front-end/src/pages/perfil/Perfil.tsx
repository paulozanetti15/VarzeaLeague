import {useState, useEffect } from 'react';
import { Form, Button, Row, Col, Container } from 'react-bootstrap';
import axios from 'axios';
import ToastSucessComponent from '../../components/Toast/ToastComponent';
import AthleteFormModal from '../../components/Modals/Athlete/AthleteFormRegisterModal';
import UpdatePasswordModal from '../../components/Modals/Password/UpdatePasswordModal';
import AtlheteInfoModal from '../../components/Modals/Athlete/AtlheteFormInfoModal';
import { Header } from '../../components/landing/Header';
import './Perfil.css';
interface User {
    id: number;
    name: string;
    email: string;
    password: string;
}
interface PerfilProps {
    isLoggedIn: boolean;
    onLoginClick: () => void;
    onRegisterClick: () => void;
    onLogout: () => void;
  }
const perfil = ({ isLoggedIn, onLoginClick, onRegisterClick, onLogout } : PerfilProps ) => {
    const [usuario, setUsuario] = useState<User | null>(null);
    const [showAthleteRegisterModal, setShowAthleteRegisterModal] = useState(false);
    const [showUpdatePasswordModal, setShowUpdatePasswordModal] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastBg, setToastBg] = useState('success');
    const [showInfoAthleteModal, setShowInfoAthleteModal] = useState(false);
    useEffect(()=>{
        const storedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '') : null;
        const userId = storedUser?.id || 0; // Substitua pelo ID do usuário que você deseja buscar
        const fetchUserData = async (userId:number) => {
            const response= await axios.get(`http://localhost:3001/api/user/${userId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            if(response.status === 200)
            {
                setUsuario(response.data);
            }     
        }
        fetchUserData(userId);        
    }, []);

    const updatedUser = async (userId: number) => {
        const response = await axios.put(`http://localhost:3001/api/user/${userId}`, 
            {
                name: usuario?.name,
                email: usuario?.email,
            },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }
        );
        if(response.status === 200) {
            setToastMessage("Usuário atualizado com sucesso");
            setToastBg("success");
            setShowToast(true);
            setTimeout(() => {
                window.location.reload(); // Atualiza a página após 1 segundo
            }, 1000); 
        }
        else {
            setToastMessage("Erro ao atualizar usuário");
            setToastBg("danger");
            setShowToast(true);
            setTimeout(() => {
                window.location.reload(); // Atualiza a página após 1 segundo
            }, 1000); 
        }   
    };
    const deleteUser = async (userId: number) => {
        const response = await axios.delete(`http://localhost:3001/api/user/${userId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        }); 
        if(response.status === 200) {
            setToastMessage("Usuário deletado com sucesso");
            setToastBg("success");
            setShowToast(true);
            setTimeout(() => {
                onLogout(); // Chama a função de logout após 1 segundo
            }, 1000);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            window.location.href = '/login'; // Redireciona para a página de login
        }
    }
    const tornarAtleta =  () => {
        setShowAthleteRegisterModal(true);
    }
    const updatePassword = () => {
       setShowUpdatePasswordModal(true);
    }
    const entrarModalAtleta = (userId: number) => {
        setShowInfoAthleteModal(true);
    }
    return (
        <>
            <Header 
                isLoggedIn={isLoggedIn}
                onLoginClick={onLoginClick}
                onRegisterClick={onRegisterClick}
                user={usuario}
                onLogout={onLogout}
            />
            <div className="register-container">
                <div className="register-card">
                    <div className="register-header">
                        <h1 className="register-title">Perfil</h1>
                        <Container className="d-flex flex-column justify-content-center align-items-center mt-5" > 
                            {usuario && (
                                <Form>
                                    <Row>
                                        <Col xs={12} md={12} lg={12}>
                                            <Form.Group className="mb-4" controlId="validationCustom01">
                                                <Form.Label style={{"color":'black'}}>Nome</Form.Label>
                                                <Form.Control
                                                    required
                                                    type="text"
                                                    placeholder="Name"
                                                    defaultValue={usuario.name}
                                                    onChange={(e) => setUsuario({...usuario, name: e.target.value})}
                                                    className="form-control-lg"
                                                />
                                            </Form.Group>
                                            <Form.Group className='w-100' controlId="validationCustom02">
                                                <Form.Label style={{"color":'black'}}>Email</Form.Label>
                                                <Form.Control
                                                    required
                                                    type="text"
                                                    placeholder="email"
                                                    defaultValue={usuario.email}
                                                    onChange={(e) => setUsuario({...usuario, email: e.target.value})}
                                                    className='form-control-lg'
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-4" controlId="validationCustomUsername">
                                                <Form.Label style={{"color":'black'}}>Senha</Form.Label> 
                                                <div className='d-flex justify-content-between align-items-center gap-2'>
                                                    <Form.Control
                                                        type="password"
                                                        placeholder="Senha"
                                                        defaultValue={usuario.password}
                                                        className="form-control-lg border-0 outline-0 input-focus-style"
                                                        style={{
                                                            "background": "linear-gradient(135deg, #f7f9fc 0%, #eef1f5 100%)",
                                                        }}
                                                        disabled
                                                    />
                                                    <a href="#" className="text-nowrap ms-2 text-primary" style={{"color":"#007bff"}} onClick={()=>updatePassword()}>Alterar senha</a>
                                                </div>
                                            </Form.Group>
                                        </Col>
                                    </Row>        
                                </Form>
                            )}
                        {usuario && (                 
                            <Container className="d-flex justify-content-center gap-2 mt-3 mb-4" >
                                <Row>
                                    <Col xs={12} sm={4}>
                                        <Button 
                                            variant="primary" 
                                            onClick={() => updatedUser(usuario.id)} 
                                            className="w-100 rounded-0 text-nowrap" 
                                            size="sm"
                                        >
                                        Atualizar
                                        </Button>
                                    </Col>
                                    <Col xs={12} sm={4}>
                                        <Button 
                                            variant="danger" 
                                            onClick={() => deleteUser(usuario.id)} 
                                            className="w-100 rouded-0" 
                                            size="sm"
                                        >
                                            Deletar
                                        </Button>
                                    </Col>
                                    <Col xs={12} sm={4}>
                                    { localStorage.getItem('isAtleta') === 'false' ? (
                                        <Button 
                                            variant="secondary" 
                                            onClick={() => tornarAtleta()} 
                                            className="w-[120] text-nowrap rounded-0" 
                                            size="sm"
                                        >
                                            Tornar-se atleta
                                        </Button>
                                    ) : (
                                        <Button 
                                            variant="secondary" 
                                            onClick={() => entrarModalAtleta(usuario.id)} 
                                            className="w-[120] text-nowrap rounded-0" 
                                            size="sm"
                                        >
                                        Dados de atleta
                                        </Button>
                                    )}
                                    </Col>
                                </Row>
                            </Container>
                        )}
                        {usuario && (
                            <>
                                <AthleteFormModal 
                                    userId={usuario.id}
                                    show={showAthleteRegisterModal}
                                    onHide={() => setShowAthleteRegisterModal(false)}
                                />
                            </>
                        )}
                        {usuario && (
                            <>
                                <UpdatePasswordModal 
                                    userId={usuario.id}
                                    show={showUpdatePasswordModal}
                                    onHide={() => setShowUpdatePasswordModal(false)}
                                />
                            </>
                        )} 
                        {usuario && (
                            <>
                                <AtlheteInfoModal 
                                    userId={usuario.id}
                                    show={showInfoAthleteModal}
                                    onHide={() => setShowInfoAthleteModal(false)}
                                />
                            </>
                        )} 
                        </Container>
                        {showToast && (
                            <ToastSucessComponent
                                message={toastMessage}
                                bg={toastBg}
                                onClose={() => setShowToast(false)}
                            />
                        )}
                    </div>
                </div>  
            </div>                   
        </>
    );
}

export default perfil;
    
       
        
