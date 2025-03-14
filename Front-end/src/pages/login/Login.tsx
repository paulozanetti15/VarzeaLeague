import { useState } from 'react';
import './Login.css';

interface LoginProps {
  onRegisterClick?: () => void;
  onForgotPasswordClick?: () => void;
}

export function Login({ onRegisterClick, onForgotPasswordClick }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você implementará a lógica de login
    console.log('Login:', { email, password });
  };

  return (
    <div className="container-fluid login-container">
      <div className="row justify-content-center align-items-center min-vh-100">
        <div className="col-md-4">
          <div className="card shadow">
            <div className="card-body p-5">
              <h2 className="text-center mb-4">Várzea League</h2>
              
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
                  <button type="submit" className="btn btn-primary">
                    Entrar
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary"
                    onClick={onRegisterClick}
                  >
                    Criar conta
                  </button>
                </div>

                <div className="text-center mt-3">
                  <button 
                    type="button" 
                    className="btn btn-link text-decoration-none"
                    onClick={onForgotPasswordClick}
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