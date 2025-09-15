import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';
import { api } from '../../services/api';

interface RegisterProps {
  onLoginClick: () => void;
}

interface FormData {
  name: string;
  cpf: string;
  email: string;
  phone: string;
  sexo: string;
  password: string;
  confirmPassword: string;
  userTypeId: number;
}

interface FormErrors {
  name?: string;
  cpf?: string;
  email?: string;
  phone?: string;
  sexo?: string;
  password?: string;
  confirmPassword?: string;
  userTypeId?: string;
  general?: string;
}

// Removido PasswordRequirement (não utilizado após refatoração)

const Register: React.FC<RegisterProps> = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    cpf: '',
    email: '',
    phone: '',
    sexo: '',
    password: '',
    confirmPassword: '',
    userTypeId: 0 // Valor padrão vazio para forçar seleção
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // apiUrl removido (não utilizado). Requisitos armazenados dentro de checkPasswordStrength.

  const validateCPF = (cpf: string): boolean => {
    cpf = cpf.replace(/[^\d]/g, '');
    
    if (cpf.length !== 11) return false;
    
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(10))) return false;
    
    return true;
  };

  const checkPasswordStrength = (password: string) => {
    const requirements = [
      { regex: /.{8,}/, text: 'Mínimo de 8 caracteres' },
      { regex: /[A-Z]/, text: 'Pelo menos uma letra maiúscula' },
      { regex: /[a-z]/, text: 'Pelo menos uma letra minúscula' },
      { regex: /[0-9]/, text: 'Pelo menos um número' },
      { regex: /[^A-Za-z0-9]/, text: 'Pelo menos um caractere especial' }
    ];

    const metRequirements = requirements.map(req => ({
      ...req,
      met: req.regex.test(password)
    }));

    const metCount = metRequirements.filter(req => req.met).length;
    const isStrong = metCount === requirements.length; // Só é forte se cumprir todos os requisitos
    
    return {
      requirements: metRequirements,
      strength: !password ? '' :
                !isStrong ? 'weak' : 'very-strong',
      label: !password ? '' :
             !isStrong ? 'Fraca' : 'Muito Forte',
      isStrong
    };
  };

  const passwordCheck = useMemo(() => {
    return checkPasswordStrength(formData.password);
  }, [formData.password]);

  // Função para verificar CPF duplicado
  const checkCPFExists = async (cpf: string): Promise<boolean> => {
    try {
      const { exists } = await api.auth.checkCPF(cpf);
      return exists;
    } catch (error) {
      console.error('Erro ao verificar CPF:', error);
      return false;
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let newValue: string | number = value;
    
    if (name === 'name') {
      newValue = value.replace(/[^A-Za-zÀ-ÿ\s]/g, '');
    }
    if (name === 'cpf') {
      newValue = value.replace(/\D/g, '').slice(0, 11);
      if (newValue.length > 9) newValue = newValue.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
      else if (newValue.length > 6) newValue = newValue.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
      else if (newValue.length > 3) newValue = newValue.replace(/(\d{3})(\d{0,3})/, '$1.$2');

      // Verifica CPF duplicado apenas quando o CPF estiver completo
      if (newValue.replace(/\D/g, '').length === 11) {
        if (validateCPF(newValue)) {
          const cpfExists = await checkCPFExists(newValue);
          if (cpfExists) {
            setErrors(prev => ({ ...prev, cpf: 'CPF já cadastrado no sistema' }));
          }
        }
      }
    }
    if (name === 'phone') {
      newValue = value.replace(/\D/g, '').slice(0, 11);
      if (newValue.length > 10) newValue = newValue.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      else if (newValue.length > 6) newValue = newValue.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
      else if (newValue.length > 2) newValue = newValue.replace(/(\d{2})(\d{0,5})/, '($1) $2');
    }
    if (name === 'userTypeId') {
      newValue = parseInt(value, 10);
    }
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
    
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = await validateForm();
    if (!isValid) return;
    
    setIsLoading(true);
    setErrors({});
    
    try {
  await api.auth.register(formData);
      // Em vez de logar direto, forçamos o usuário a autenticar manualmente
      // Garantir que nada residual fique salvo
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Opcional: armazenar flag para mostrar mensagem pós-registro na tela de login
      sessionStorage.setItem('justRegisteredEmail', formData.email);
      sessionStorage.setItem('registerSuccess', 'true');
      navigate('/login');
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        general: error instanceof Error ? error.message : 'Erro ao registrar usuário' 
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = async (): Promise<boolean> => {
    const newErrors: FormErrors = {};
    
    // Validações básicas
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.email.trim()) newErrors.email = 'Email é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
    if (!formData.phone.trim()) newErrors.phone = 'Telefone é obrigatório';
    else if (!/^\d{10,11}$/.test(formData.phone.replace(/\D/g, ''))) newErrors.phone = 'Telefone inválido';
    if (!formData.sexo) newErrors.sexo = 'Selecione o sexo';
    if (!formData.userTypeId || formData.userTypeId === 0) newErrors.userTypeId = 'Selecione o tipo de perfil';
    
    // Validação de CPF
    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else {
      const cpfLimpo = formData.cpf.replace(/\D/g, '');
      if (!validateCPF(cpfLimpo)) {
        newErrors.cpf = 'CPF inválido';
      } else {
        // Verifica CPF duplicado
        const cpfExists = await checkCPFExists(cpfLimpo);
        if (cpfExists) {
          newErrors.cpf = 'CPF já cadastrado no sistema';
        }
      }
    }

    // Validação de senha forte
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else {
      const passwordCheck = checkPasswordStrength(formData.password);
      if (!passwordCheck.isStrong) {
        newErrors.password = 'A senha deve cumprir todos os requisitos de segurança';
      }
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
              <div className="register-error">{errors.general}</div>
            )}
            <div className="register-row">
              <div className="register-form-group">
                <label className="register-label">Nome</label>
                <input
                  type="text"
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
                <label className="register-label">CPF</label>
                <input
                  type="text"
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
                <label className="register-label">Tipo de Perfil</label>
                <select
                  name="userTypeId"
                  value={formData.userTypeId}
                  onChange={handleChange}
                  className={`register-input${errors.userTypeId ? ' register-input-error' : ''}`}
                  disabled={isLoading}
                >
                  <option value={0}>Selecione</option>
                  <option value={2}>Organizador de Campeonatos e Partidas</option>
                  <option value={3}>Técnico/Organizador de Times</option>
                </select>
                {errors.userTypeId && <span className="register-error-message">{errors.userTypeId}</span>}
              </div>
              <div className="register-form-group">
                <label className="register-label">Sexo</label>
                <select
                  name="sexo"
                  value={formData.sexo}
                  onChange={handleChange}
                  className={`register-input${errors.sexo ? ' register-input-error' : ''}`}
                  disabled={isLoading}
                >
                  <option value="">Selecione</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Prefiro não informar">Prefiro não informar</option>
                </select>
                {errors.sexo && <span className="register-error-message">{errors.sexo}</span>}
              </div>
            </div>
            <div className="register-row">
              <div className="register-form-group">
                <label className="register-label">Telefone</label>
                <input
                  type="text"
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
              <div className="register-form-group" style={{ flex: 2 }}>
                <label className="register-label">E-mail</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`register-input${errors.email ? ' register-input-error' : ''}`}
                  placeholder="Digite seu e-mail"
                  disabled={isLoading}
                />
                {errors.email && <span className="register-error-message">{errors.email}</span>}
              </div>
            </div>
            <div className="register-row">
              <div className="register-form-group">
                <label className="register-label">Senha</label>
                <div className="register-password-container">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`register-input${errors.password ? ' register-input-error' : ''}`}
                    placeholder="Digite sua senha"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="register-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.81 21.81 0 0 1 5.06-6.06"/><path d="M1 1l22 22"/><path d="M9.53 9.53A3 3 0 0 0 12 15a3 3 0 0 0 2.47-5.47"/></svg>
                    )}
                  </button>
                </div>
                {formData.password && (
                  <div className="password-strength-container">
                    <div className="password-strength-title">
                      <span>Força da Senha:</span>
                      <div className={`password-strength-label ${passwordCheck.strength}`}>
                        {passwordCheck.label}
                      </div>
                    </div>
                    <div className="password-strength-meter">
                      <div className={`password-strength-progress ${passwordCheck.strength}`}></div>
                    </div>
                    <div className="password-requirements">
                      {passwordCheck.requirements.map((req, index) => (
                        <div key={index} className={`requirement-item ${req.met ? 'met' : 'not-met'}`}>
                          <span className={`requirement-icon ${req.met ? 'success' : 'pending'}`}>
                            {req.met ? (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><polyline points="20 6 9 17 4 12"/></svg>
                            ) : (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><circle cx="12" cy="12" r="10"/></svg>
                            )}
                          </span>
                          {req.text}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {errors.password && <span className="register-error-message">{errors.password}</span>}
              </div>
              <div className="register-form-group">
                <label className="register-label">Confirmar Senha</label>
                <div className="register-password-container">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`register-input${errors.confirmPassword ? ' register-input-error' : ''}`}
                    placeholder="Confirme sua senha"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="register-password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.81 21.81 0 0 1 5.06-6.06"/><path d="M1 1l22 22"/><path d="M9.53 9.53A3 3 0 0 0 12 15a3 3 0 0 0 2.47-5.47"/></svg>
                    )}
                  </button>
                </div>
                {errors.confirmPassword && <span className="register-error-message">{errors.confirmPassword}</span>}
              </div>
            </div>
            <button type="submit" className="register-btn" disabled={isLoading}>
              {isLoading ? 'Registrando...' : 'Criar Conta'}
            </button>
            <div className="register-login-link">
              Já tem uma conta?
              <a href="/login" onClick={(e) => {e.preventDefault(); navigate('/login');}}>
                Faça login
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;