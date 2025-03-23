import { useState } from 'react';
import './ForgotPassword.css';
import axios from 'axios';

interface ForgotPasswordProps {
  onBackToLogin?: () => void;
}

export function ForgotPassword({ onBackToLogin }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

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

    // Aqui você implementará a lógica de envio do email de recuperação
    console.log('Recuperação solicitada para:', email);
    axios.post('http://localhost:3001/api/password/request-reset', { email })
      .then(response => {
        console.log('Response:', response.data);
        setIsSubmitted(true);
      })
      .catch(error => {
        console.error('Erro ao solicitar recuperação de senha:', error);
      });
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="login-container">
        <div className="row justify-content-center align-items-center min-vh-100">
          <div className="col-md-4">
            <div className="card shadow">
              <div className="card-body p-5 text-center">
                <h2 className="mb-4">Email Enviado!</h2>
                <p className="mb-4">
                  Enviamos as instruções de recuperação de senha para:
                  <br />
                  <strong>{email}</strong>
                </p>
                <p className="text-muted mb-4">
                  Se você não receber o email em alguns minutos, verifique sua pasta de spam.
                </p>
                <div className="d-grid">
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={onBackToLogin}
                  >
                    Voltar para Login
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="row justify-content-center align-items-center min-vh-100">
        <div className="col-md-4">
          <div className="card shadow">
            <div className="card-body p-5">
              <h2 className="text-center mb-4">Recuperar Senha</h2>
              <p className="text-center mb-4">
                Digite seu email e enviaremos as instruções para recuperar sua senha.
              </p>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
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

                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-primary">
                    Enviar Instruções
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary"
                    onClick={onBackToLogin}
                  >
                    Voltar para Login
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