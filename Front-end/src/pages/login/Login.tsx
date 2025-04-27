import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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

    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', {
        email,
        password
      });

      const data = response.data;
      if (response.status !== 200) {
        throw new Error(data.message || 'Erro ao fazer login');
      }

      // Salvar token e dados do usuário
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Chamar callback de sucesso
      if (onLoginSuccess) {
        onLoginSuccess(data);
      }

      // Redirecionar para a página principal
      navigate('/');
    } catch (error) {
      console.error('Erro no login:', error);
      // Verifica se é um erro 404 (servidor não encontrado) para dar uma mensagem mais útil
      if (error && (error as any).response && (error as any).response.status === 404) {
        setLoginError('Servidor não encontrado. Verifique se o backend está funcionando corretamente.');
      } else {
        setLoginError(error instanceof Error ? error.message : 'Erro ao fazer login');
      }
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
                style={{ paddingRight: '3rem' }}
              />
              <button 
                type="button" 
                onClick={togglePasswordVisibility}
                style={passwordToggleStyle}
                tabIndex={-1}
              >
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
              {isLoading ? 'Entrando...' : 'Entrar'}
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