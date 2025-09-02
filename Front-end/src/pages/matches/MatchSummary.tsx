import { useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function MatchSummary() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const forceSummary = location.state?.forceSummary;

  useEffect(() => {
    // Se não for obrigatório, permite sair normalmente
    if (!forceSummary) return;
    // Bloqueia navegação até preencher sumário
    window.onbeforeunload = () => 'Preencha o sumário antes de sair!';
    return () => { window.onbeforeunload = null; };
  }, [forceSummary]);

  const handleSubmitSummary = async (data: any) => {
    // Envia sumário para o backend
    await axios.post(`http://localhost:3001/api/matches/${id}/finalize-report`, data, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    // Libera navegação
    window.onbeforeunload = null;
    navigate('/');
  };

  return (
    <div>
      <h2>Preencha o sumário da partida</h2>
      {/* Aqui você pode usar o modal ou formulário já existente para gols/cartões */}
      {/* Exemplo simplificado: */}
      <form onSubmit={e => { e.preventDefault(); handleSubmitSummary({ goals: 0, yellowCards: 0, redCards: 0 }); }}>
        <button type="submit">Salvar sumário</button>
      </form>
      {forceSummary && <p style={{color:'red'}}>Você deve preencher o sumário antes de sair!</p>}
    </div>
  );
}
