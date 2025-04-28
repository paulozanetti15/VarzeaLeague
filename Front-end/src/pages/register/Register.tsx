import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

interface FormData {
  name: string;
  cpf: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  cpf?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    cpf: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.cpf.trim()) newErrors.cpf = 'CPF é obrigatório';
    else if (!/^\d{11}$/.test(formData.cpf.replace(/\D/g, ''))) newErrors.cpf = 'CPF inválido';
    if (!formData.email.trim()) newErrors.email = 'Email é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
    if (!formData.phone.trim()) newErrors.phone = 'Telefone é obrigatório';
    else if (!/^\d{10,11}$/.test(formData.phone.replace(/\D/g, ''))) newErrors.phone = 'Telefone inválido';
    if (!formData.password) newErrors.password = 'Senha é obrigatória';
    else if (formData.password.length < 6) newErrors.password = 'A senha deve ter pelo menos 6 caracteres';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'As senhas não coincidem';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === 'name') {
      newValue = value.replace(/[^A-Za-zÀ-ÿ\s]/g, '');
    }
    if (name === 'cpf') {
      newValue = value.replace(/\D/g, '').slice(0, 11);
      if (newValue.length > 9) newValue = newValue.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
      else if (newValue.length > 6) newValue = newValue.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
      else if (newValue.length > 3) newValue = newValue.replace(/(\d{3})(\d{0,3})/, '$1.$2');
    }
    if (name === 'phone') {
      newValue = value.replace(/\D/g, '').slice(0, 11);
      if (newValue.length > 10) newValue = newValue.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      else if (newValue.length > 6) newValue = newValue.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
      else if (newValue.length > 2) newValue = newValue.replace(/(\d{2})(\d{0,5})/, '($1) $2');
    }
    setFormData(prev => ({ ...prev, [name]: newValue }));
    if (errors[name as keyof FormErrors]) setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setErrors({});
    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erro ao registrar usuário');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (error) {
      setErrors(prev => ({ ...prev, general: error instanceof Error ? error.message : 'Erro ao registrar usuário' }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1 className="register-title">Criar Conta</h1>
          <p className="register-subtitle">Junte-se à nossa comunidade de futebol</p>
        </div>
        <div className="register-body">
          <form onSubmit={handleSubmit} className="register-form">
            {errors.general && (
              <div className="register-error" role="alert">{errors.general}</div>
            )}
            <div className="register-row">
              <div className="register-form-group">
                <label htmlFor="name" className="register-label">Nome</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`register-input${errors.name ? ' register-input-error' : ''}`}
                  placeholder="Digite seu nome completo"
                  disabled={isLoading}
                />
                {errors.name && <span className="register-error-message">{errors.name}</span>}
              </div>
              <div className="register-form-group">
                <label htmlFor="cpf" className="register-label">CPF</label>
                <input
                  type="text"
                  id="cpf"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleChange}
                  className={`register-input${errors.cpf ? ' register-input-error' : ''}`}
                  placeholder="000.000.000-00"
                  disabled={isLoading}
                  maxLength={14}
                />
                {errors.cpf && <span className="register-error-message">{errors.cpf}</span>}
              </div>
            </div>
            <div className="register-row">
              <div className="register-form-group">
                <label htmlFor="email" className="register-label">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`register-input${errors.email ? ' register-input-error' : ''}`}
                  placeholder="Digite seu email"
                  disabled={isLoading}
                />
                {errors.email && <span className="register-error-message">{errors.email}</span>}
              </div>
              <div className="register-form-group">
                <label htmlFor="phone" className="register-label">Telefone</label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`register-input${errors.phone ? ' register-input-error' : ''}`}
                  placeholder="(99) 99999-9999"
                  disabled={isLoading}
                  maxLength={15}
                />
                {errors.phone && <span className="register-error-message">{errors.phone}</span>}
              </div>
            </div>
            <div className="register-row">
              <div className="register-form-group">
                <label htmlFor="password" className="register-label">Senha</label>
                <div className="register-password-container">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`register-input${errors.password ? ' register-input-error' : ''}`}
                    placeholder="Digite sua senha"
                    disabled={isLoading}
                    style={{ paddingRight: '3rem' }}
                  />
                  <button
                    type="button"
                    className="register-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.81 21.81 0 0 1 5.06-6.06"/><path d="M1 1l22 22"/><path d="M9.53 9.53A3 3 0 0 0 12 15a3 3 0 0 0 2.47-5.47"/></svg>
                    )}
                  </button>
                </div>
                {errors.password && <span className="register-error-message">{errors.password}</span>}
              </div>
              <div className="register-form-group">
                <label htmlFor="confirmPassword" className="register-label">Confirmar Senha</label>
                <div className="register-password-container">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`register-input${errors.confirmPassword ? ' register-input-error' : ''}`}
                    placeholder="Confirme sua senha"
                    disabled={isLoading}
                    style={{ paddingRight: '3rem' }}
                  />
                  <button
                    type="button"
                    className="register-password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showConfirmPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.81 21.81 0 0 1 5.06-6.06"/><path d="M1 1l22 22"/><path d="M9.53 9.53A3 3 0 0 0 12 15a3 3 0 0 0 2.47-5.47"/></svg>
                    )}
                  </button>
                </div>
                {errors.confirmPassword && <span className="register-error-message">{errors.confirmPassword}</span>}
              </div>
            </div>
            <button type="submit" className="register-btn" disabled={isLoading}>{isLoading ? 'Registrando...' : 'Criar Conta'}</button>
            <div className="register-login-link">
              Já tem uma conta?
              <a href="/login" onClick={(e) => {e.preventDefault();navigate('/login');}}>Faça login</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;