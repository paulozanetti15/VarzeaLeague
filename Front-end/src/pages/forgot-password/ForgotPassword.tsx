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
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      return;
    }

<<<<<<< HEAD
    // Aqui você implementará a lógica de envio do email de recuperação
    console.log('Recuperação solicitada para:', email);
    axios.post('http://localhost:3001/api/password-reset/request-reset', { email })
      .then(response => {
        console.log('Response:', response.data);
        setIsSubmitted(true);
      })
      .catch(error => {
        console.error('Erro ao solicitar recuperação de senha:', error);
      });
    setIsSubmitted(true);
=======
    setIsLoading(true);
    setErrorMessage('');

    try {
      await axios.post('http://localhost:3001/api/password/request-reset', { email });
      setIsSubmitted(true);
    } catch (error) {
      console.error('Erro ao solicitar recuperação de senha:', error);
      setErrorMessage('Não foi possível enviar o email de recuperação. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
>>>>>>> bd7ee1707d98a65b8841c7358b0ccf2887bc6b9a
  };

  if (isSubmitted) {
    return (
      <div className="forgot-password-container">
        <div className="forgot-password-card">
          <div className="forgot-password-header">
            <h1 className="forgot-password-title">Várzea League</h1>
            <p className="forgot-password-subtitle">Recuperação de Senha</p>
          </div>
          
          <div className="forgot-password-body text-center">
            <div className="forgot-password-success">
              Enviamos as instruções de recuperação de senha para:
              <br />
              <strong>{email}</strong>
            </div>
            
            <p className="mb-4">
              Se você não receber o email em alguns minutos, verifique sua pasta de spam.
            </p>
            
            <button 
              type="button" 
              className="forgot-password-btn"
              onClick={onBackToLogin}
            >
              Voltar para Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="forgot-password-header">
          <h1 className="forgot-password-title">Várzea League</h1>
          <p className="forgot-password-subtitle">Recuperação de Senha</p>
        </div>
        
        <div className="forgot-password-body">
          <p className="mb-4">
            Digite seu email e enviaremos as instruções para recuperar sua senha.
          </p>
          
          {errorMessage && (
            <div className="forgot-password-error">
              {errorMessage}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="forgot-password-form-group">
              <label htmlFor="email" className="forgot-password-label">Email</label>
              <input
                type="email"
                className="forgot-password-input"
                id="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Seu email"
                required
              />
              {emailError && (
                <div className="forgot-password-error mt-2">
                  {emailError}
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="forgot-password-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Enviando...' : 'Enviar Instruções'}
            </button>
            
            <div className="forgot-password-login">
              Lembrou sua senha?
              <button 
                type="button" 
                className="forgot-password-login-link"
                onClick={onBackToLogin}
                disabled={isLoading}
              >
                Entrar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 