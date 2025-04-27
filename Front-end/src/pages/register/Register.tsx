import { useState } from 'react';
import './Register.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  const [dataNascimento, setDataNascimento] = useState('');
  const [sexo, setSexo] = useState('');
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
        DataNasc: dataNascimento,
        sexo,
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
          <h1 className="register-title">Várzea League</h1>
          <p className="register-subtitle">Crie sua conta para começar</p>
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
              className={`register-input ${emailError ? "is-invalid" : ""}`}
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
            <div className="register-password-container">
              <input
                type={showPassword ? "text" : "password"}
                className={`register-input register-password-input ${passwordTouched && passwordError ? "is-invalid" : ""}`}
                id="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="Sua senha"
                required
              />
              <button 
                type="button" 
                onClick={togglePasswordVisibility}
                className="register-password-toggle"
                tabIndex={-1}
                aria-label="Mostrar/ocultar senha"
              >
                {showPassword ? (
                  <svg className="register-eye-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                    <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="register-eye-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.091 1.092a4 4 0 00-5.557-5.557z" clipRule="evenodd" />
                    <path d="M10.748 13.93l2.523 2.523a9.987 9.987 0 01-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 010-1.186A10.007 10.007 0 012.839 6.02L6.07 9.252a4 4 0 004.678 4.678z" />
                  </svg>
                )}
              </button>
            </div>
            {passwordTouched && passwordError && !confirmPasswordTouched && (
              <div className="register-error">
                {passwordError}
              </div>
            )}
          </div>
  
          <div className="register-form-group">
            <label htmlFor="confirmPassword" className="register-label">Confirmar Senha</label>
            <div className="register-password-container">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className={`register-input register-password-input ${confirmPasswordTouched && passwordError ? "is-invalid" : ""}`}
                id="confirmPassword"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                placeholder="Confirme sua senha"
                required
              />
              <button 
                type="button" 
                onClick={toggleConfirmPasswordVisibility}
                className="register-password-toggle"
                tabIndex={-1}
                aria-label="Mostrar/ocultar senha de confirmação"
              >
                {showConfirmPassword ? (
                  <svg className="register-eye-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                    <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="register-eye-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.091 1.092a4 4 0 00-5.557-5.557z" clipRule="evenodd" />
                    <path d="M10.748 13.93l2.523 2.523a9.987 9.987 0 01-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 010-1.186A10.007 10.007 0 012.839 6.02L6.07 9.252a4 4 0 004.678 4.678z" />
                  </svg>
                )}
              </button>
            </div>
            {confirmPasswordTouched && passwordError && (
              <div className="register-error">
                {passwordError}
              </div>
            )}
          </div>
  
          <div className="register-form-group">
            <label htmlFor="dataNascimento" className="register-label">Data Nascimento</label>
            <input
              type="date"
              className="register-input register-input-date"
              id="dataNascimento"
              value={dataNascimento}
              onChange={(e) => setDataNascimento(e.target.value)}
              placeholder="DD/MM/AAAA"
              min={format(new Date(), 'dd-MM-yyyy', { locale: ptBR })}
              required
            />
          </div>
  
          <div className="register-form-group">
            <label htmlFor="sexo" className="register-label">Sexo</label>
            <select
              className="register-input register-input-select"
              id="sexo"
              value={sexo}
              onChange={(e) => setSexo(e.target.value)}
              required
            >
              <option value="">Selecione seu sexo</option>
              <option value="masculino">Masculino</option>
              <option value="feminino">Feminino</option>
            </select>
          </div>
          <button 
            type="submit" 
            className="register-button"
            disabled={isLoading}
          >
            {isLoading ? 'Criando conta...' : 'Criar Conta'}
          </button>
          
          <div className="register-link-container">
            Já tem uma conta?
            <button 
              type="button" 
              className="register-link"
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