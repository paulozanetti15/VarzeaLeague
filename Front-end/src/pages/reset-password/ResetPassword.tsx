import { useState } from 'react';
import { useParams } from 'react-router-dom';
import './ResetPassword.css';
import axios from 'axios';

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

    if (newPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.put('http://localhost:3001/api/password/reset-password', {
        token: token,
        newPassword,
      });
      if (response.status !== 201) {
        throw new Error(response.data.message || 'Erro ao redefinir senha');
      }
      

      //if (!response) {
      //  throw new Error(data.message || 'Erro ao redefinir senha');
      //}

      setSuccess(true);
      setTimeout(onBackToLogin, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao redefinir senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <h2>Redefinir Senha</h2>
        {success ? (
          <div className="success-message">
            <i className="bi bi-check-circle"></i>
            <p>Senha atualizada com sucesso! Redirecionando para o login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="newPassword">Nova Senha</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite sua nova senha"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Senha</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme sua nova senha"
                required
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button 
              type="submit" 
              className="btn btn-primary w-100"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              ) : null}
              Redefinir Senha
            </button>
            <button 
              type="button" 
              className="btn btn-link w-100"
              onClick={onBackToLogin}
            >
              Voltar para o Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
} 