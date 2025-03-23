import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

interface LoginProps {
  onRegisterClick?: () => void;
  onForgotPasswordClick?: () => void;
  onLoginSuccess?: () => void;
}

export function Login({ onRegisterClick, onForgotPasswordClick, onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');

    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', {
        email,
        password
      });

      const data = response
      if (response.status !== 200) {
        throw new Error(data.data.message || 'Erro ao fazer login');
      }

      // Salvar token e dados do usuário
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      // Chamar callback de sucesso
      if (onLoginSuccess) {
        onLoginSuccess();
      }

      // Redirecionar para a página principal
      navigate('/');
    } catch (error) {
      console.error('Erro no login:', error);
      setLoginError(error instanceof Error ? error.message : 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="row justify-content-center align-items-center min-vh-100">
        <div className="col-md-4">
          <div className="card shadow">
            <div className="card-body p-5">
              <h2 className="text-center mb-4">Várzea League</h2>
              
              {loginError && (
                <div className="alert alert-danger" role="alert">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Seu email"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Senha</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha"
                    required
                  />
                </div>

                <div className="d-grid gap-2">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Entrando...' : 'Entrar'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary"
                    onClick={onRegisterClick}
                    disabled={isLoading}
                  >
                    Criar conta
                  </button>
                </div>

                <div className="text-center mt-3">
                  <button 
                    type="button" 
                    className="btn btn-link text-decoration-none"
                    onClick={onForgotPasswordClick}
                    disabled={isLoading}
                  >
                    Esqueceu sua senha?
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 