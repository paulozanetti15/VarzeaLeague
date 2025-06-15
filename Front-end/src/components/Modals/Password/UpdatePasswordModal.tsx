import { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, IconButton, InputAdornment, Alert } from '@mui/material';
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
    const [senhaAtual, setSenhaAtual] = useState<string | null>(null);
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
    const [currentPasswordError, setCurrentPasswordError] = useState('');
    
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

    const updatePasswordRequest = async (userId: number) => {
        setCurrentPasswordError('');
        if (!senhaAtual) {
            setCurrentPasswordError('Digite a senha atual');
            setConfirmPasswordTouched(true);
            return;
        }
        if (senha && senha === confirmarSenha) {
            setIsLoading(true);
            try {
                const response = await axios.put(`http://localhost:3001/api/user/password/${userId}`,
                    {
                        currentPassword: senhaAtual,
                        password: senha,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                        },
                    });
                if (response.status === 200) {
                    setToastMessage("Senha alterada com sucesso");
                    setToastBg("success");
                    setShowToast(true);
                    setTimeout(() => {
                        onHide();
                    }, 1500);
                }
            } catch (error: any) {
                if (error.response?.data?.message?.toLowerCase().includes('atual')) {
                    setCurrentPasswordError(error.response.data.message);
                } else {
                    setToastMessage(error.response?.data?.message || "Erro ao alterar senha");
                    setToastBg("danger");
                    setShowToast(true);
                }
            } finally {
                setIsLoading(false);
            }
        }
    }
    
    const handleClose = () => {
        // Reset form state when closing
        setSenhaAtual(null);
        setSenha(null);
        setConfirmarSenha(null);
        setPasswordError('');
        setCurrentPasswordError('');
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
            <Dialog open={show} onClose={handleClose} disableScrollLock maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
                <DialogTitle className="modal-header" sx={{ textAlign: 'center', fontWeight: 700, fontSize: 22, background: 'linear-gradient(to right, #007bff, #0056b3)', color: 'white', padding: '16px 16px 0 16px', textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)' }}>
                    <LockIcon className="lock-icon" /> Alterar Senha
                </DialogTitle>
                <DialogContent className="modal-body" sx={{ p: 3 }}>
                    <form className="password-form">
                        <TextField
                            label="Senha atual"
                            type="password"
                            placeholder="Digite sua senha atual"
                            onChange={(e) => setSenhaAtual(e.target.value)}
                            autoFocus
                            className="password-input"
                            error={!!currentPasswordError}
                            helperText={currentPasswordError}
                            fullWidth
                            margin='normal'
                            variant='outlined'
                            sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(25, 118, 210, 0.07)' }}
                        />
                        <TextField
                            label="Nova senha"
                            type={showPassword ? "text" : "password"}
                            placeholder="Digite sua nova senha"
                            onChange={(e) => setSenha(e.target.value)}
                            className="password-input"
                            fullWidth
                            margin='normal'
                            variant='outlined'
                            sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(25, 118, 210, 0.07)' }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={togglePasswordVisibility}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            label="Confirmar nova senha"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirme sua nova senha"
                            onChange={(e) => setConfirmarSenha(e.target.value)}
                            className="password-input"
                            fullWidth
                            margin='normal'
                            variant='outlined'
                            sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(25, 118, 210, 0.07)' }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={toggleConfirmPasswordVisibility}
                                            edge="end"
                                        >
                                            {showConfirmPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        
                        {confirmPasswordTouched && passwordError && (
                            <Alert severity="error" sx={{ mt: 2 }}>{passwordError}</Alert>
                        )}
                    </form>
                </DialogContent>
                <DialogActions className="modal-footer">
                    <Button 
                        variant="outline-secondary" 
                        onClick={handleClose} 
                        className="cancel-button"
                        disabled={isLoading}
                        fullWidth
                        size='large'
                        sx={{ borderRadius: 2, fontWeight: 700, py: 1.2, fontSize: 17, mt: 2, boxShadow: '0 2px 8px rgba(25, 118, 210, 0.10)' }}
                    >
                        Cancelar
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={() => updatePasswordRequest(userId)}
                        className={`update-button ${isLoading ? 'loading' : ''}`}
                        disabled={!senha || !confirmarSenha || confirmPasswordTouched || isLoading}
                        fullWidth
                        size='large'
                        sx={{ borderRadius: 2, fontWeight: 700, py: 1.2, fontSize: 17, mt: 2, boxShadow: '0 2px 8px rgba(25, 118, 210, 0.10)' }}
                    >
                        {isLoading ? 'Alterando...' : 'Salvar Senha'}
                    </Button>
                </DialogActions>
            </Dialog>
            
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
