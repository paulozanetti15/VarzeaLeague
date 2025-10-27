import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { mvpService } from '../../../services/mvpService';

interface MvpVotingProps {
  matchId: number;
}

export const MvpVoting: React.FC<MvpVotingProps> = ({ matchId }) => {
  const [players, setPlayers] = useState<Array<{ playerId: number; nome: string; posicao: string; sexo: string; teamId: number }>>([]);
  const [summary, setSummary] = useState<{ votes: Array<{ playerId: number; votes: number }>; leader: { playerId: number; votes: number } | null }>({ votes: [], leader: null });
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const votesByPlayer = useMemo(() => {
    const map = new Map<number, number>();
    for (const v of summary.votes) map.set(v.playerId, v.votes);
    return map;
  }, [summary]);

  const leaderId = summary.leader?.playerId ?? null;

  const fetchAll = async () => {
    const [pl, sum] = await Promise.all([
      mvpService.listPlayers(matchId),
      mvpService.getSummary(matchId),
    ]);
    setPlayers(pl);
    setSummary(sum);
  };

  useEffect(() => {
    fetchAll().catch(() => toast.error('Erro ao carregar dados'));
  }, [matchId]);

  const onVote = async () => {
    if (!selected) { toast.error('Selecione um jogador'); return; }
    setLoading(true);
    try {
      await mvpService.vote(matchId, selected);
      toast.success('Voto registrado');
      await fetchAll();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Erro ao votar');
    } finally {
      setLoading(false);
    }
  };

  const grouped = useMemo(() => {
    const map = new Map<number, Array<{ playerId: number; nome: string; posicao: string; sexo: string; teamId: number }>>();
    for (const p of players) {
      const arr = map.get(p.teamId) || [];
      arr.push(p);
      map.set(p.teamId, arr);
    }
    return Array.from(map.entries());
  }, [players]);

  return (
    <div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {grouped.map(([teamId, list]) => (
          <div key={teamId} style={{ flex: '1 1 260px', minWidth: 260 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Time #{teamId}</div>
            <div style={{ display: 'grid', gap: 8 }}>
              {list.map(p => {
                const votes = votesByPlayer.get(p.playerId) || 0;
                const isLeader = leaderId === p.playerId;
                return (
                  <label key={p.playerId} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 8, border: '1px solid #ddd', borderRadius: 8 }}>
                    <input type="radio" name="mvp" value={p.playerId} onChange={() => setSelected(p.playerId)} checked={selected === p.playerId} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, textTransform: 'capitalize' }}>{p.nome}</div>
                      <div style={{ fontSize: 12, opacity: 0.7 }}>{p.posicao}</div>
                    </div>
                    <div style={{ fontWeight: 600 }}>🗳️ {votes}</div>
                    {isLeader && <span style={{ marginLeft: 6, color: '#2e7d32', fontWeight: 600 }}>MVP</span>}
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
        <button onClick={onVote} disabled={loading || !selected} className="btn btn-primary">
          {loading ? 'Enviando...' : 'Votar no MVP'}
        </button>
      </div>
    </div>
  );
};
