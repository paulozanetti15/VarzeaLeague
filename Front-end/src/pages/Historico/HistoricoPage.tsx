import { useState, useEffect, useContext } from 'react';
import Nav from 'react-bootstrap/Nav';
import Row from 'react-bootstrap/Row';
import Form from 'react-bootstrap/Form';
import './HistoricoPage.css';
import { HistoricoContext } from '../../Context/HistoricoContext';
import { useTeamCaptain } from '../../hooks/useTeamCaptain';
import StatCard from '../../components/Historico/StatCard';
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
        <h1 className="text-center text-dark mb-5">
          Histórico do {team.name}
        </h1>

        <Row className="g-4 mb-5">
          {activeTab === 'amistosos' && (
            <>
              <StatCard title="Partidas amistosas disputadas" value={historico?.amistosos || 0} />
              <StatCard title="Vitórias" value={historico?.vitoriasAmistosos || 0} textColor="text-success" />
              <StatCard title="Derrotas" value={historico?.derrotasAmistosas || 0} textColor="text-danger" />
              <StatCard title="Empates" value={historico?.empatesAmistosos || 0} textColor="text-secondary" />
              <StatCard title="Desempenho em Amistosos" value={`${historico?.aproveitamentoAmistosos || 0} %`} textColor="text-info" />

            </>
          )}
          {activeTab === 'campeonatos'  && selectedChampionship === '' ? (
            <>
              <StatCard title="Campeonatos Participados" value={historico?.campeonatosParticipados || 0} />
              <StatCard title="Campeonatos Em Disputa" value={historico?.campeonatosEmDisputa || 0} />
              <StatCard title="Vitórias acumuladas" value={historico?.vitoriasCampeonato || 0} textColor="text-success" />
              <StatCard title="Derrotas acumuladas" value={historico?.derrotasCampeonato || 0} textColor="text-danger" />
              <StatCard title="Empates acumulados" value={historico?.empatesCampeonato || 0} textColor="text-secondary" />
            </>
            ) 
            :
            ( activeTab === 'campeonatos'  && selectedChampionship !== '' && (
            <>
              <StatCard title="Quantidade de Partidas disputadas" value={historico?.partidasFiltradasCampeonatoDisputadas || 0} />
              <StatCard title="Vitórias em partidas" value={historico?.vitoriasCampeonato || 0} textColor="text-success" />
              <StatCard title="Derrotas em partidas" value={historico?.derrotasCampeonato || 0} textColor="text-danger" />
              <StatCard title="Empates em partidas" value={historico?.empatesCampeonato || 0} textColor="text-secondary" />
              <StatCard title="Desempenho no Campeonato" value={`${historico?.aproveitamentoCampeonatos || 0} %`} textColor="text-info" />
            </>
          )
          ) 
         }  
        </Row>

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
            <Form.Group style={{ maxWidth: '350px', width: '100%' }}>
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
            <div className="mt-4">
              <h2 className="text-center text-dark mb-4">Partidas Amistosas</h2>
              <Row xs={1} md={2} lg={3} className="g-4">
                {historico?.PartidasAmistosas && historico.PartidasAmistosas.length > 0 ? (
                  historico.PartidasAmistosas.map((partida) => (
                    <MatchCard key={partida.id} partida={partida} teamId={team.id} isChampionship={false} />
                  ))
                ) : (
                  <p className="text-center text-muted">Nenhuma partida amistosa disponível.</p>
                )}
              </Row>
            </div>
          )}

          {activeTab === 'campeonatos' && (
            <div className="mt-4">
              <h2 className="text-center text-dark mb-4">
                {selectedChampionship && historico?.nomesCampeonatos
                  ? (() => {
                      const champ = historico.nomesCampeonatos.find(c => String(c.id) === String(selectedChampionship));
                      return champ ? `Partidas de ${champ.name}` : 'Partidas de Campeonato';
                    })()
                  : 'Partidas de Campeonato'}
              </h2>
              <Row xs={1} md={2} lg={3} className="g-4">
                {selectedChampionship !== ''
                  ? historico?.partidasFiltradasCampeonato && historico.partidasFiltradasCampeonato.length > 0
                    ? historico.partidasFiltradasCampeonato.map((partida) => (
                        <MatchCard key={partida.id} partida={partida} teamId={team.id} isChampionship />
                      ))
                    : <p className="text-center text-muted">Nenhuma partida encontrada para o campeonato selecionado.</p>
                  : historico?.todasPartidasCampeonatos && historico.todasPartidasCampeonatos.length > 0
                  ? historico.todasPartidasCampeonatos.map((partida) => (
                      <MatchCard key={partida.id} partida={partida} teamId={team.id} isChampionship />
                    ))
                  : <p className="text-center text-muted">Nenhuma partida de campeonato disponível.</p>
                }
              </Row>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoricoPage;