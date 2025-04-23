import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import axios from 'axios';
import ToastComponent from '../../Toast/ToastComponent';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import './UpdatePasswordModal.css';

interface UpdatePasswordModalProps {
    userId: number;
    show: boolean;
    onHide: () => void;
}

export default function UpdatePasswordModal({userId, show, onHide}: UpdatePasswordModalProps) {
    const [senha, setSenha] = useState<string | null>(null);
    const [confirmarSenha, setConfirmarSenha] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastBg, setToastBg] = useState('success');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    useEffect(() => {   
        if (!senha || !confirmarSenha) return;
        
        const handlingVerifyPassword = async () => {
            if(senha === confirmarSenha) {
                setPasswordError('');
                setConfirmPasswordTouched(false);
            }
            else {
                setPasswordError('As senhas não coincidem');
                setConfirmPasswordTouched(true);
            }
        }
        handlingVerifyPassword();
    }, [senha, confirmarSenha]);

    // Super simplified modal handling
    useEffect(() => {
        if (show) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }

        return () => {
            document.body.classList.remove('modal-open');
        };
    }, [show]);

    const updatePasswordRequest = async (userId: number) => {
        if(senha && senha === confirmarSenha){
            setIsLoading(true);
            try {
                const response = await axios.put(`http://localhost:3001/api/user/password/${userId}`, 
                    {
                        password: senha,
                    },
                    {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    },               
                });
               
                if(response.status === 200) {
                    setToastMessage("Senha alterada com sucesso");
                    setToastBg("success");
                    setShowToast(true);
                    setTimeout(() => {
                        onHide();
                    }, 1500); 
                }
            } catch (error) {
                setToastMessage("Erro ao alterar senha");
                setToastBg("danger");
                setShowToast(true);
            } finally {
                setIsLoading(false);
            }
        }  
    }
    
    const handleClose = () => {
        // Reset form state when closing
        setSenha(null);
        setConfirmarSenha(null);
        setPasswordError('');
        setConfirmPasswordTouched(false);
        setShowPassword(false);
        setShowConfirmPassword(false);
        onHide();
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    return (
        <>
            <Modal 
                show={show} 
                onHide={handleClose} 
                centered 
                className="password-update-modal"
                backdrop="static"
                restoreFocus={false}
            >
                <Modal.Header closeButton className="modal-header">
                    <Modal.Title><LockIcon className="lock-icon" /> Alterar Senha</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modal-body">
                    <Form className="password-form">
                        <Form.Group className="mb-4" controlId="password">
                            <Form.Label className="form-label-password">Nova senha</Form.Label>
                            <div className="password-input-container">
                                <Form.Control
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Digite sua nova senha"
                                    onChange={(e) => setSenha(e.target.value)}
                                    autoFocus
                                    className="password-input"
                                />
                                <button 
                                    type="button" 
                                    className="password-visibility-toggle"
                                    onClick={togglePasswordVisibility}
                                >
                                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                </button>
                            </div>
                        </Form.Group>
                        <Form.Group className="mb-4" controlId="confirmPassword">
                            <Form.Label className="form-label-password">Confirmar senha</Form.Label>
                            <div className="password-input-container">
                                <Form.Control 
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirme sua nova senha"
                                    onChange={(e) => setConfirmarSenha(e.target.value)}
                                    className="password-input"
                                />
                                <button 
                                    type="button" 
                                    className="password-visibility-toggle"
                                    onClick={toggleConfirmPasswordVisibility}
                                >
                                    {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                </button>
                            </div>
                        </Form.Group>
                        
                        {confirmPasswordTouched && passwordError && (
                            <div className="password-error">
                                {passwordError}
                            </div>
                        )}
                    </Form>
                </Modal.Body>
                <Modal.Footer className="modal-footer">
                    <Button 
                        variant="outline-secondary" 
                        onClick={handleClose} 
                        className="cancel-button"
                        disabled={isLoading}
                    >
                        Cancelar
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={() => updatePasswordRequest(userId)}
                        className={`update-button ${isLoading ? 'loading' : ''}`}
                        disabled={!senha || !confirmarSenha || confirmPasswordTouched || isLoading}
                    >
                        {isLoading ? 'Alterando...' : 'Salvar Senha'}
                    </Button>
                </Modal.Footer>
            </Modal>
            
            {showToast && (
                <ToastComponent
                    message={toastMessage}
                    bg={toastBg}
                    onClose={() => setShowToast(false)}
                />
            )}
        </>
    );
}
