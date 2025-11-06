import { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import './ResetPassword.css';

interface ResetPasswordProps {
  onBackToLogin: () => void;
}

export function ResetPassword({ onBackToLogin }: ResetPasswordProps) {
  const { token } = useParams<{ token: string }>();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (newPassword.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres');
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.put(`${API_BASE_URL}/password-reset/reset`, {
        token: token,
        newPassword,
      });
      
      setSuccess(true);
      setTimeout(onBackToLogin, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao redefinir senha. Verifique o link ou tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <div className="reset-password-header">
          <h1 className="reset-password-title">Várzea League</h1>
          <p className="reset-password-subtitle">Redefinir Senha</p>
        </div>
        
        <div className="reset-password-body">
          {success ? (
            <div className="reset-password-success">
              <p>Senha atualizada com sucesso! Você será redirecionado para o login em instantes.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && <div className="reset-password-error">{error}</div>}
              
              <div className="reset-password-form-group">
                <label htmlFor="newPassword" className="reset-password-label">Nova Senha</label>
                <input
                  type="password"
                  id="newPassword"
                  className="reset-password-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite sua nova senha"
                  required
                />
              </div>
              
              <div className="reset-password-form-group">
                <label htmlFor="confirmPassword" className="reset-password-label">Confirmar Senha</label>
                <input
                  type="password"
                  id="confirmPassword"
                  className="reset-password-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme sua nova senha"
                  required
                />
              </div>
              
              <button 
                type="submit" 
                className="reset-password-btn"
                disabled={loading}
              >
                {loading ? 'Redefinindo...' : 'Redefinir Senha'}
              </button>
              
              <div className="reset-password-login">
                Lembrou sua senha?
                <button 
                  type="button" 
                  className="reset-password-login-link"
                  onClick={onBackToLogin}
                >
                  Entrar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 