import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import axios from 'axios';
import ToastComponent from '../../Toast/ToastComponent';
import './UpdatePasswordModal.css';
interface UpdatePasswordModalProps {
    userId: number;
    show: boolean;
    onHide: () => void;
}
export default function UpdatePasswordModal({userId, show, onHide}: UpdatePasswordModalProps) {
    const [senha,setSenha] = useState<string | null>(null);
    const [confirmarSenha,setConfirmarSenha] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastBg, setToastBg] = useState('success');
    useEffect(() => {   
        const handlingVerifyPassword = async () => {
            if(senha == confirmarSenha) {
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

    const updatePasswordRequest = async (userId: number) => {
        if(confirmPasswordTouched === false){
            const response = await axios.put(`http://localhost:3001/api/user/password/${userId}`, 
                {
                    password:senha,
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
                }, 1000); 
            }
            else {
                setToastMessage("Erro ao alterar senha");
                setToastBg("danger");
                setShowToast(true);
                setTimeout(() => {
                    onHide();
                }
                , 1000);
            }   
        }  
    }
    return (
        <>
            <Modal show={show} onHide={onHide}>
                <Modal.Header closeButton>
                <Modal.Title>Alterar Senha</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                <Form>
                    <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                    <Form.Label style={{"color":"black"}}>Senha</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Senha"
                        onChange={(e) => setSenha(e.target.value)}
                        autoFocus
                    />
                    </Form.Group>
                    <Form.Group
                    className="mb-3"
                    controlId="exampleForm.ControlTextarea1"
                    >
                    <Form.Label style={{"color":"black"}}>Confirmar senha</Form.Label>
                    <Form.Control 
                    type="password"
                    placeholder="Confirmar senha"
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    autoFocus/>
                    </Form.Group>
                </Form>
                </Modal.Body>
                {confirmPasswordTouched && passwordError && (
                    <div className="register-error container">
                      {passwordError}
                    </div>
                  )}
                <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Fechar
                </Button>
                <Button variant="primary" onClick={()=> updatePasswordRequest(userId)}>
                    Alterar Senha
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
