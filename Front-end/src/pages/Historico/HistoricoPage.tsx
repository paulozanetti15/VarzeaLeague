import { useState, useEffect, useContext } from 'react';
import Nav from 'react-bootstrap/Nav';
import Row from 'react-bootstrap/Row';
import Form from 'react-bootstrap/Form';
import './HistoricoPage.css';
import { HistoricoContext } from '../../Context/HistoricoContext';
import { useTeamCaptain } from '../../hooks/useTeamCaptain';
import MatchCard from '../../components/Historico/MatchCard';

const HistoricoPage = () => {
  const [activeTab, setActiveTab] = useState('amistosos');
  const [selectedChampionship, setSelectedChampionship] = useState<string>('');
  const { team, loading: teamLoading, error: teamError } = useTeamCaptain();
  const historico = useContext(HistoricoContext);

  useEffect(() => {
    if (team.id) {
      historico?.fetchHistorico(team.id, selectedChampionship ? parseInt(selectedChampionship) : undefined);
    }
  }, [team.id, selectedChampionship]);



  if (teamLoading) {
    return (
      <div className="min-h-screen bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-2">Carregando dados do time...</p>
        </div>
      </div>
    );
  }

  if (teamError) {
    return (
      <div className="min-h-screen bg-light d-flex align-items-center justify-content-center">
        <div className="text-center text-danger">
          <p>Erro ao carregar dados: {teamError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light">
      <div className="container py-5">
        <h1 className="text-center text-dark mb-5 historico-header">
          Histórico do {team.name}
        </h1>

        {/* Estatísticas - barra compacta */}
        <div className="stats-bar mb-4">
          {activeTab === 'amistosos' && (
            <> 
              <div className="stats-item">
                <div className="stat-label">Partidas amistosas disputadas</div>
                <div className="stat-value">{historico?.amistosos || 0}</div>
              </div>
              <div className="stats-item">
                <div className="stat-label">Vitórias</div>
                <div className="stat-value text-success">{historico?.vitoriasAmistosos || 0}</div>
              </div>
              <div className="stats-item">
                <div className="stat-label">Derrotas</div>
                <div className="stat-value text-danger">{historico?.derrotasAmistosos || 0}</div>
              </div>
              <div className="stats-item">
                <div className="stat-label">Empates</div>
                <div className="stat-value text-secondary">{historico?.empatesAmistosos || 0}</div>
              </div>
              <div className="stats-item highlight">
                <div className="stat-label">Desempenho em Amistosos</div>
                <div className="stat-value text-info">{`${historico?.aproveitamentoAmistosos || 0} %`}</div>
              </div>
            </>
          )}

          {activeTab === 'campeonatos' && selectedChampionship === '' && (
            <>
              <div className="stats-item">
                <div className="stat-label">Campeonatos Participados</div>
                <div className="stat-value">{historico?.campeonatosParticipados || 0}</div>
              </div>
              <div className="stats-item">
                <div className="stat-label">Campeonatos Em Disputa</div>
                <div className="stat-value">{historico?.campeonatosEmDisputa || 0}</div>
              </div>
              <div className="stats-item">
                <div className="stat-label">Vitórias acumuladas</div>
                <div className="stat-value text-success">{historico?.vitoriasCampeonato || 0}</div>
              </div>
              <div className="stats-item">
                <div className="stat-label">Derrotas acumuladas</div>
                <div className="stat-value text-danger">{historico?.derrotasCampeonato || 0}</div>
              </div>
              <div className="stats-item">
                <div className="stat-label">Empates acumulados</div>
                <div className="stat-value text-secondary">{historico?.empatesCampeonato || 0}</div>
              </div>
            </>
          )}

          {activeTab === 'campeonatos' && selectedChampionship !== '' && (
            <>
              <div className="stats-item">
                <div className="stat-label">Quantidade de Partidas disputadas</div>
                <div className="stat-value">{historico?.partidasFiltradasCampeonatoDisputadas || 0}</div>
              </div>
              <div className="stats-item">
                <div className="stat-label">Vitórias em partidas</div>
                <div className="stat-value text-success">{historico?.vitoriasCampeonato || 0}</div>
              </div>
              <div className="stats-item">
                <div className="stat-label">Derrotas em partidas</div>
                <div className="stat-value text-danger">{historico?.derrotasCampeonato || 0}</div>
              </div>
              <div className="stats-item">
                <div className="stat-label">Empates em partidas</div>
                <div className="stat-value text-secondary">{historico?.empatesCampeonato || 0}</div>
              </div>
              <div className="stats-item highlight">
                <div className="stat-label">Desempenho no Campeonato</div>
                <div className="stat-value text-info">{`${historico?.aproveitamentoCampeonatos || 0} %`}</div>
              </div>
            </>
          )}
        </div>

        <Nav variant="tabs" defaultActiveKey="amistosos" className="mb-4">
          <Nav.Item>
            <Nav.Link eventKey="amistosos" onClick={() => setActiveTab('amistosos')}>Partidas Amistosas</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="campeonatos" onClick={() => setActiveTab('campeonatos')}>Partidas Campeonatos</Nav.Link>
          </Nav.Item>
        </Nav>

        {activeTab === 'campeonatos' && (
          <div className="d-flex justify-content-end mb-4">
            <Form.Group className="select-championship" style={{ maxWidth: '350px', width: '100%' }}>
              <Form.Label style={{ marginBottom: '14px', fontSize: '1.08rem', fontWeight: 500, letterSpacing: '0.5px', fontFamily: 'Inter, Arial, sans-serif', textTransform: 'uppercase' }}>
                Selecione um Campeonato
              </Form.Label>
              <Form.Select
                style={{ fontSize: '1.08rem', padding: '0.7rem 1rem', marginTop: '6px' }}
                value={selectedChampionship}
                onChange={(e) => setSelectedChampionship(e.target.value)}
              >
                <option value="">Todos os Campeonatos</option>
                {historico?.nomesCampeonatos.map(champ => (
                  <option key={champ.id} value={champ.id}>{champ.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </div>
        )}

        <div>
          {activeTab === 'amistosos' && (
            <div className="match-section">
              <h2 className="match-section-heading text-center">Partidas Amistosas</h2>
              {historico?.PartidasAmistosas && historico.PartidasAmistosas.length > 0 ? (
                <div className="matches-grid">
                  {historico.PartidasAmistosas.map((partida) => (
                    <MatchCard key={partida.id} partida={partida} teamId={team.id} isChampionship={false} />
                  ))}
                </div>
              ) : (
                <div className="empty-state-card">Nenhuma partida amistosa disponível.</div>
              )}
            </div>
          )}

          {activeTab === 'campeonatos' && (
            <div className="match-section">
              <h2 className="match-section-heading text-center">
                {selectedChampionship && historico?.nomesCampeonatos
                  ? (() => {
                      const champ = historico.nomesCampeonatos.find(c => String(c.id) === String(selectedChampionship));
                      return champ ? `Partidas de ${champ.name}` : 'Partidas de Campeonato';
                    })()
                  : 'Partidas de Campeonato'}
              </h2>
              {selectedChampionship !== ''
                ? historico?.partidasFiltradasCampeonato && historico.partidasFiltradasCampeonato.length > 0
                  ? (
                    <div className="matches-grid">
                      {historico.partidasFiltradasCampeonato.map((partida) => (
                        <MatchCard key={partida.id} partida={partida} teamId={team.id} isChampionship />
                      ))}
                    </div>
                    )
                  : (<div className="empty-state-card">Nenhuma partida encontrada para o campeonato selecionado.</div>)
                : historico?.todasPartidasCampeonatos && historico.todasPartidasCampeonatos.length > 0
                  ? (
                    <div className="matches-grid">
                      {historico.todasPartidasCampeonatos.map((partida) => (
                        <MatchCard key={partida.id} partida={partida} teamId={team.id} isChampionship />
                      ))}
                    </div>
                    )
                  : (<div className="empty-state-card">Nenhuma partida de campeonato disponível.</div>)
                }
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoricoPage;