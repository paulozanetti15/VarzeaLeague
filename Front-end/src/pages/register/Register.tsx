import { useState } from 'react';
import './Register.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
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

  // Aplicando os estilos inline diretamente para garantir que sejam aplicados
  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
    padding: '2rem 1rem',
    width: '100%',
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  };

  const cardStyle = {
    width: '100%',
    maxWidth: '450px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 8px 30px rgba(25, 118, 210, 0.15)',
    overflow: 'hidden' as const,
    position: 'relative' as const,
  };

  const headerStyle = {
    backgroundColor: '#1e88e5',
    color: '#ffffff',
    padding: '2rem',
    textAlign: 'center' as const,
    position: 'relative' as const,
  };

  const titleStyle = {
    fontSize: '1.75rem',
    fontWeight: 700,
    marginBottom: '0.5rem',
    color: '#ffffff',
  };

  const subtitleStyle = {
    fontSize: '1rem',
    opacity: 0.9,
    color: '#ffffff',
  };

  const bodyStyle = {
    padding: '2.5rem',
    backgroundColor: '#ffffff',
  };

  const formGroupStyle = {
    marginBottom: '1.75rem',
    position: 'relative' as const,
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 500,
    color: '#374151',
    fontSize: '0.95rem',
  };

  const inputStyle = {
    width: '100%',
    padding: '0.875rem 1rem',
    fontSize: '1rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    backgroundColor: '#f9fafb',
    transition: 'all 0.3s ease',
  };

  const passwordInputStyle = {
    ...inputStyle,
    paddingRight: '3rem', // Espaço para o botão de mostrar/ocultar
  };

  const invalidInputStyle = {
    ...inputStyle,
    borderColor: '#ef4444',
    paddingRight: '3rem',
  };

  const invalidPasswordInputStyle = {
    ...invalidInputStyle,
    paddingRight: '3rem', // Espaço para o botão de mostrar/ocultar
  };

  const passwordToggleStyle = {
    position: 'absolute' as const,
    right: '1rem',
    top: '38px', // Ajustado para alinhar com o campo
    background: 'none',
    border: 'none',
    color: '#4b5563',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.9rem',
    padding: '0.25rem',
  };

  const eyeIconStyle = {
    width: '20px',
    height: '20px',
    display: 'inline-block',
  };

  const buttonStyle = {
    width: '100%',
    padding: '1rem',
    backgroundColor: '#1e88e5',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: '0.5rem',
    marginBottom: '1.5rem',
    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
  };

  const linkContainerStyle = {
    textAlign: 'center' as const,
    fontSize: '0.95rem',
    color: '#4b5563',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  };

  const linkStyle = {
    color: '#1e88e5',
    fontWeight: 600,
    textDecoration: 'none',
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
  };

  const errorStyle = {
    color: '#ef4444',
    fontSize: '0.875rem',
    marginBottom: '1.5rem',
    padding: '0.75rem 1rem',
    backgroundColor: 'rgba(254, 226, 226, 1)',
    border: '1px solid rgba(254, 202, 202, 1)',
    borderRadius: '6px',
  };

  const triangleStyle = {
    content: '',
    position: 'absolute' as const,
    bottom: '-10px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '50px',
    height: '20px',
    backgroundColor: '#ffffff',
    clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>Várzea League</h1>
          <p style={subtitleStyle}>Crie sua conta para começar</p>
          <div style={triangleStyle}></div>
        </div>
        
        <div style={bodyStyle}>
          {registrationError && (
            <div style={errorStyle} role="alert">
              {registrationError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={formGroupStyle}>
              <label htmlFor="nome" style={labelStyle}>Nome</label>
              <input
                type="text"
                style={inputStyle}
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome completo"
                required
              />
            </div>

            <div style={formGroupStyle}>
              <label htmlFor="email" style={labelStyle}>Email</label>
              <input
                type="email"
                style={emailError ? invalidInputStyle : inputStyle}
                id="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Seu email"
                required
              />
              {emailError && (
                <div style={errorStyle}>
                  {emailError}
                </div>
              )}
            </div>

            <div style={formGroupStyle}>
              <label htmlFor="password" style={labelStyle}>Senha</label>
              <input
                type={showPassword ? "text" : "password"}
                style={passwordTouched && passwordError ? invalidPasswordInputStyle : passwordInputStyle}
                id="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="Sua senha"
                required
              />
              <button 
                type="button" 
                onClick={togglePasswordVisibility}
                style={passwordToggleStyle}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg style={eyeIconStyle} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                    <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg style={eyeIconStyle} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.091 1.092a4 4 0 00-5.557-5.557z" clipRule="evenodd" />
                    <path d="M10.748 13.93l2.523 2.523a9.987 9.987 0 01-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 010-1.186A10.007 10.007 0 012.839 6.02L6.07 9.252a4 4 0 004.678 4.678z" />
                  </svg>
                )}
              </button>
              {passwordTouched && passwordError && !confirmPasswordTouched && (
                <div style={errorStyle}>
                  {passwordError}
                </div>
              )}
            </div>

            <div style={formGroupStyle}>
              <label htmlFor="confirmPassword" style={labelStyle}>Confirmar Senha</label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                style={confirmPasswordTouched && passwordError ? invalidPasswordInputStyle : passwordInputStyle}
                id="confirmPassword"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                placeholder="Confirme sua senha"
                required
              />
              <button 
                type="button" 
                onClick={toggleConfirmPasswordVisibility}
                style={passwordToggleStyle}
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <svg style={eyeIconStyle} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                    <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg style={eyeIconStyle} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.091 1.092a4 4 0 00-5.557-5.557z" clipRule="evenodd" />
                    <path d="M10.748 13.93l2.523 2.523a9.987 9.987 0 01-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 010-1.186A10.007 10.007 0 012.839 6.02L6.07 9.252a4 4 0 004.678 4.678z" />
                  </svg>
                )}
              </button>
              {confirmPasswordTouched && passwordError && (
                <div style={errorStyle}>
                  {passwordError}
                </div>
              )}
            </div>

            <button 
              type="submit" 
              style={buttonStyle}
              disabled={isLoading}
            >
              {isLoading ? 'Criando conta...' : 'Criar Conta'}
            </button>
            
            <div style={linkContainerStyle}>
              Já tem uma conta?
              <button 
                type="button" 
                style={linkStyle}
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