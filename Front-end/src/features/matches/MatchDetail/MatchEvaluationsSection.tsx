import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import StarRating from './StarRating';

interface MatchEvaluationsSectionProps {
  matchId: number;
  readOnly?: boolean;
}

const MatchEvaluationsSection: React.FC<MatchEvaluationsSectionProps> = ({ matchId, readOnly }) => {
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [summary, setSummary] = useState<{ average: number; count: number } | null>(null);
  const [myRating, setMyRating] = useState<number>(0);
  const [myComment, setMyComment] = useState('');
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  const fetchAll = async () => {
    try {
      const [listRes, sumRes] = await Promise.all([
        fetch(`http://localhost:3001/api/friendly-matches/${matchId}/evaluations`).then(r => r.json()),
        fetch(`http://localhost:3001/api/friendly-matches/${matchId}/evaluations/summary`).then(r => r.json())
      ]);
      setEvaluations(Array.isArray(listRes) ? listRes : []);
      if (sumRes && typeof sumRes.average !== 'undefined') setSummary(sumRes);
      // Preencher minha avaliação se existir
      if (Array.isArray(listRes)) {
        const uid = localStorage.getItem('userId');
        if (uid) {
          const mine = listRes.find((e: any) => String(e.evaluator_id) === uid);
          if (mine) {
            setMyRating(mine.rating);
            setMyComment(mine.comment || '');
          }
        }
      }
    } catch (e) {
      console.error('Erro ao carregar avaliações', e);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [matchId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('Não autenticado');
      return;
    }
    if (myRating < 1 || myRating > 5) {
      toast.error('Nota deve ser de 1 a 5');
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch(`http://localhost:3001/api/friendly-matches/${matchId}/evaluations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating: myRating, comment: myComment })
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.message || 'Erro ao salvar avaliação');
      }
      toast.success('Avaliação salva');
      await fetchAll();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="match-evaluations-section">
      <div className="eval-header-line">
        <h3 className="eval-title">Avaliações</h3>
        {summary && (
          <div className="evaluation-summary-chip" title={`${summary.count} ${summary.count === 1 ? 'avaliação' : 'avaliações'}`}>
            ⭐ {summary.average} <span className="count">({summary.count})</span>
          </div>
        )}
      </div>
      {!readOnly && (
        <form className="evaluation-form fancy" onSubmit={handleSubmit}>
          <div className="rating-input block">
            <label className="field-label">Sua Nota</label>
            <StarRating value={myRating} onChange={setMyRating} />
          </div>
          <div className="comment-input block">
            <label className="field-label">Comentário</label>
            <textarea
              className="comment-box"
              value={myComment}
              onChange={e => setMyComment(e.target.value)}
              rows={4}
              placeholder="Compartilhe pontos positivos, organização, fair play..."
            />
          </div>
          <div className="actions-row">
            <button type="submit" className="submit-eval-btn" disabled={loading || myRating === 0}>
              {loading ? 'Salvando...' : (myRating ? 'Salvar Avaliação' : 'Selecione a nota')}
            </button>
            {myRating > 0 && <span className="edit-hint">Você pode alterar depois.</span>}
          </div>
        </form>
      )}
      <div className="evaluation-list modern">
        {evaluations.length === 0 && <div className="empty">Nenhuma avaliação ainda. Seja o primeiro a opinar!</div>}
        {evaluations.map(ev => {
          const mine = localStorage.getItem('userId') && String(ev.evaluator_id) === localStorage.getItem('userId');
          return (
            <div key={ev.id} className={`evaluation-item cardish ${mine ? 'mine' : ''}`}>
              <div className="evaluation-header">
                <div className="stars-inline" aria-label={`Nota ${ev.rating}`}>
                  {[1, 2, 3, 4, 5].map(n => <span key={n} className={n <= ev.rating ? 's filled' : 's'}>★</span>)}
                </div>
                <span className="date">{new Date(ev.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
              {ev.comment && <div className="comment-body">{ev.comment}</div>}
              {mine && <div className="badge-mine">Sua avaliação</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MatchEvaluationsSection;
