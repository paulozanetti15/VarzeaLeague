import { useState } from 'react';
import './Login.css';

interface LoginProps {
  onRegisterClick?: () => void;
  onForgotPasswordClick?: () => void;
}

export function Login({ onRegisterClick, onForgotPasswordClick }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
      setEmailError('Email inválido. Use um formato válido (exemplo@dominio.com)');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (newEmail) {
      validateEmail(newEmail);
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      return;
    }

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
                    className={`form-control ${emailError ? 'is-invalid' : ''}`}
                    id="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="Seu email"
                    required
                  />
                  {emailError && (
                    <div className="invalid-feedback">
                      {emailError}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Senha</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setPasswordTouched(true)}
                    placeholder="Sua senha"
                    required
                  />
                </div>

                <div className="d-grid gap-2">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={!!emailError}
                  >
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