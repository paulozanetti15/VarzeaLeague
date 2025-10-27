import React, { useEffect, useMemo, useState } from 'react';
import { mvpService, FinishedMatch } from '../../services/mvpService';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { MvpVoteDialog } from '../../components/Dialogs/MvpVoteDialog';

const MvpVotingPage: React.FC = () => {
  const [matches, setMatches] = useState<FinishedMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<FinishedMatch | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const list = await mvpService.listFinished();
      setMatches(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const items = useMemo(() => matches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [matches]);

  return (
    <div className="container" style={{ padding: 16, maxWidth: 1100, margin: '0 auto' }}>
      <h2 style={{ marginBottom: 16, textAlign: 'center' }}>Partidas finalizadas</h2>
      {loading && <div style={{ textAlign: 'center' }}>Carregando...</div>}
      {!loading && items.length === 0 && (
        <div style={{ textAlign: 'center' }}>Nenhuma partida finalizada disponível para votação.</div>
      )}

      <div className="row" style={{ gap: 16 }}>
        {items.map(m => (
          <div key={m.id} className="col" style={{ minWidth: 280, flex: '1 1 300px' }}>
            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontWeight: 600 }}>{m.title}</div>
              <div style={{ fontSize: 13, opacity: 0.8 }}>{format(new Date(m.date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</div>
              <div style={{ fontSize: 13, opacity: 0.8 }}>{m.location}</div>
              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" onClick={() => setSelectedMatch(m)}>Votar MVP</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedMatch && (
        <MvpVoteDialog
          open={!!selectedMatch}
          onClose={() => setSelectedMatch(null)}
          matchId={selectedMatch.id}
        />
      )}
    </div>
  );
};

export default MvpVotingPage;
