import { useState } from 'react';
import './Register.css';
import axios from 'axios';
interface RegisterProps {
  onLoginClick?: () => void;
}

export function Register({ onLoginClick }: RegisterProps) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const [registrationError, setRegistrationError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors = [];
    if (password.length < minLength) {
      errors.push(`Mínimo de ${minLength} caracteres`);
    }
    else if (password.length >= minLength) {
      setPasswordError('');
    }
    if (!hasUpperCase) {
      errors.push('Uma letra maiúscula');
    }
    if (!hasLowerCase) {
      errors.push('Uma letra minúscula');
    }
    if (!hasNumbers) {
      errors.push('Um número');
    }
    if (!hasSpecialChar) {
      errors.push('Um caractere especial');
    }

    if (errors.length > 0) {
      setPasswordError(`Sua senha precisa ter: ${errors.join(', ')}`);
      return false;
    }
   
    return true;
  };

  const validatePasswords = () => {
    if (!validatePassword(password)) {
      return false;
    }

    if (password !== confirmPassword) {
      setPasswordError('As senhas não coincidem');
      return false;
    }

    setPasswordError('');
    return true;
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    setConfirmPasswordTouched(true);
    
    if (password && e.target.value) {
      if (password !== e.target.value) {
        setPasswordError('As senhas não coincidem');
      } else {
        validatePassword(password);
      }
    } else {
      setPasswordError('');
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordTouched(true);
    
    if (newPassword) {
      if (!validatePassword(newPassword)) {
        return;
      }
      if (confirmPassword && newPassword !== confirmPassword) {
        setPasswordError('As senhas não coincidem');
      }
    } else {
      setPasswordError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePasswords();

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setIsLoading(true);
    setRegistrationError('');

    try {
      const response = await axios.post('http://localhost:3001/api/auth/register', {
        name: nome,
        email,
        password,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.status !== 201) {
        throw new Error('Erro ao criar conta');
      }

      // Salvar token no localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Redirecionar para login
      if (onLoginClick) {
        onLoginClick();
      }
    } catch (error) {
      console.error('Erro no registro:', error);
      setRegistrationError(error instanceof Error ? error.message : 'Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1 className="register-title">Criar Conta</h1>
          <p className="register-subtitle">Cadastre-se para começar a usar o sistema</p>
        </div>
        
        <div className="register-body">
          {registrationError && (
            <div className="register-error" role="alert">
              {registrationError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="register-form-group">
              <label htmlFor="nome" className="register-label">Nome</label>
              <input
                type="text"
                className="register-input"
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome completo"
                required
              />
            </div>

            <div className="register-form-group">
              <label htmlFor="email" className="register-label">Email</label>
              <input
                type="email"
                className={`register-input ${emailError ? 'is-invalid' : ''}`}
                id="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Seu email"
                required
              />
              {emailError && (
                <div className="register-error">
                  {emailError}
                </div>
              )}
            </div>

            <div className="register-form-group">
              <label htmlFor="password" className="register-label">Senha</label>
              <input
                type="password"
                className={`register-input ${passwordTouched && passwordError ? 'is-invalid' : ''}`}
                id="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="Sua senha"
                required
              />
              {passwordTouched && passwordError && !confirmPasswordTouched && (
                <div className="register-error">
                  {passwordError}
                </div>
              )}
            </div>

            <div className="register-form-group">
              <label htmlFor="confirmPassword" className="register-label">Confirmar Senha</label>
              <input
                type="password"
                className={`register-input ${confirmPasswordTouched && passwordError ? 'is-invalid' : ''}`}
                id="confirmPassword"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                placeholder="Confirme sua senha"
                required
              />
              {confirmPasswordTouched && passwordError && (
                <div className="register-error">
                  {passwordError}
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="register-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Criando...' : 'Criar Conta'}
            </button>
            
            <div className="register-login">
              Já tem uma conta?
              <button 
                type="button" 
                className="register-login-link"
                onClick={onLoginClick}
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