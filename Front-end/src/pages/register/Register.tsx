import { useState } from 'react';
import './Register.css';

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
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: nome,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao criar conta');
      }

      // Salvar token no localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

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
    <div className="login-container">
      <div className="row justify-content-center align-items-center min-vh-100">
        <div className="col-md-4">
          <div className="card shadow">
            <div className="card-body p-5">
              <h2 className="text-center mb-4">Criar Conta</h2>
              
              {registrationError && (
                <div className="alert alert-danger" role="alert">
                  {registrationError}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="nome" className="form-label">Nome</label>
                  <input
                    type="text"
                    className="form-control"
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Seu nome completo"
                    required
                  />
                </div>

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
                    className={`form-control ${passwordTouched && passwordError ? 'is-invalid' : ''}`}
                    id="password"
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Sua senha"
                    required
                  />
                  {passwordTouched && passwordError && !confirmPasswordTouched && (
                    <div className="invalid-feedback">
                      {passwordError}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">Confirmar Senha</label>
                  <input
                    type="password"
                    className={`form-control ${confirmPasswordTouched && passwordError ? 'is-invalid' : ''}`}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    placeholder="Confirme sua senha"
                    required
                  />
                  {confirmPasswordTouched && passwordError && (
                    <div className="invalid-feedback">
                      {passwordError}
                    </div>
                  )}
                </div>

                <div className="d-grid gap-2">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Criando conta...' : 'Criar Conta'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary"
                    onClick={onLoginClick}
                    disabled={isLoading}
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