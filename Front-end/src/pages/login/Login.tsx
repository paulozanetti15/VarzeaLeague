import { useState } from 'react';
import axios from 'axios';
import { API_BASE } from '../../config/api';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage, validateEmail, validatePassword } from '../../utils/errorHandler';
import './Login.css';

interface LoginProps {
  onRegisterClick?: () => void;
  onForgotPasswordClick?: () => void;
  onLoginSuccess?: (data: any) => void;
}

export function Login({ onRegisterClick, onForgotPasswordClick, onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');

    // Validações básicas antes de enviar
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setLoginError(emailValidation.message || 'Email inválido');
      setIsLoading(false);
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setLoginError(passwordValidation.message || 'Senha inválida');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE}/auth/login`,
        { email: email.trim(), password },
        { timeout: 10000 });

      const data = response.data;

      if (response.status !== 200) {
        throw new Error(data.message || 'Erro ao fazer login');
      }

      // Salvar token e dados do usuário
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('Tipo_usuário:', data.user.userTypeId);

      // Chamar callback de sucesso
      if (onLoginSuccess) {
        onLoginSuccess(data);
      }

      // Redirecionar para a página principal
      navigate('/');
    } catch (error: any) {
      console.error('Erro no login:', error);
      
      // Usar a função que mapeia erros técnicos em mensagens amigáveis
      const friendlyMessage = getErrorMessage(error);
      setLoginError(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Estilos para o botão de mostrar/ocultar senha
  const passwordToggleStyle = {
    position: 'absolute' as const,
    right: '1rem',
    top: '38px',
    background: 'none',
    border: 'none',
    color: '#4b5563',
    cursor: 'pointer',
    fontSize: '0.9rem',
    padding: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const eyeIconStyle = {
    width: '20px',
    height: '20px',
    display: 'inline-block',
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Várzea League</h1>
          <p className="login-subtitle">Entre na sua conta para continuar</p>
        </div>
        
        <div className="login-body">
          {loginError && (
            <div className="login-error" role="alert">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                style={{ marginRight: '8px', flexShrink: 0 }}
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {loginError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="login-form-group">
              <label htmlFor="email" className="login-label">Email</label>
              <input
                type="email"
                className="login-input"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu email"
                required
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            <div className="login-form-group" style={{ position: 'relative' }}>
              <label htmlFor="password" className="login-label">Senha</label>
              <input
                type={showPassword ? "text" : "password"}
                className="login-input"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                required
                disabled={isLoading}
                autoComplete="current-password"
                style={{ paddingRight: '3rem' }}
              />
              <button 
                type="button" 
                onClick={togglePasswordVisibility}
                style={passwordToggleStyle}
                disabled={isLoading}
                tabIndex={-1}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
              <a 
                href="#" 
                className="login-forgot-password"
                onClick={(e) => {
                  e.preventDefault();
                  if (onForgotPasswordClick) onForgotPasswordClick();
                }}
              >
                Esqueceu sua senha?
              </a>
            </div>

            <button 
              type="submit" 
              className="login-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg 
                    className="animate-spin" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                    style={{ width: '20px', height: '20px', marginRight: '8px' }}
                  >
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    ></circle>
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
            
            <div className="login-signup">
              Não tem uma conta?
              <button 
                type="button" 
                className="login-signup-link"
                onClick={onRegisterClick}
                disabled={isLoading}
              >
                Criar conta
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 