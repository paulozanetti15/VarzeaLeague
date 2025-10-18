import React, { useEffect, useState, useRef } from 'react';
import { Button, Row, Col, Table, Container, Card, Badge } from 'react-bootstrap';
import axios from 'axios';
import "./CriarsumulaPartidasAmistosas.css";
import EditarSumulaDialog from '../sumula/EditarSumulaPartidaAmistosas';
interface Team {
  id: number;
  name: string;
}

interface Player {
  playerId: number;
  nome: string;
  teamId: number;
}

interface Player {
  id: number;
  nome: string;
}

interface GoalAPI {
  id: number;
  match_id: number;
  player_id: number;
  minuteGoal: number;
  player: Player;
  team_id?: number;
  team:{
    name:string
  }
}

interface CardAPI {
  id: number;
  match_id: number;
  card_type: 'yellow' | 'red';
  minute: number;
  player_id: number;
  player: Player;
  team_id?: number;
  team:{
    name:string
  }
}

interface MatchDataAPI {
  goals: GoalAPI[];
  cards: CardAPI[];
  tallies: {
    goalsByPlayer: Record<string, number>;
    yellowByPlayer: Record<string, number>;
    redByPlayer: Record<string, number>;
  };
}

interface MatchData {
  match_id: number;
  team_home: string;
  team_away: string;
  team_home_id?: number;
  team_away_id?: number;
  team_home_score: number;
  team_away_score: number;
  attendance?: number;
  date: string;
  goals: GoalAPI[];
  cards: CardAPI[];
}

interface VisualizarSumulaModalProps {
  matchId: number;
  show: boolean;
  onHide: () => void;
}

const VisualizarSumulaDialog = ({ matchId, show, onHide }: VisualizarSumulaModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEdicaoSumulaPartida,setShowEdicaoSumulaPartida] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (show) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [show]);

  // Buscar dados da súmula
  const fetchMatchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Token de autorização não encontrado.');
        return;
      }


      // Buscar informações básicas da súmula
      const sumulaResponse = await axios.get(`http://localhost:3001/api/matches/${matchId}/events`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(sumulaResponse?.data.cards)

      const reportData = sumulaResponse?.data.report[0];

      setMatchData({
        match_id: matchId,
        team_home: reportData?.teamHome?.name || 'Time Casa',
        team_away: reportData?.teamAway?.name || 'Time Visitante',
        team_home_id: reportData?.teamHome?.id,
        team_away_id: reportData?.teamAway?.id,
        team_home_score: reportData?.teamHome_score || 0,
        team_away_score: reportData?.teamAway_score || 0,
        date: reportData?.match.date || new Date().toISOString(),
        goals: sumulaResponse?.data.goals || [],
        cards: sumulaResponse?.data.cards || []
      });

    } catch (error) {
      console.error('Erro ao carregar dados da súmula:', error);
      setError('Erro ao carregar dados da partida.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show && matchId) {
      fetchMatchData();
    }
  }, [matchId, show]);

  const handleDialogClick = (e: React.MouseEvent) => {
    if (e.target === dialogRef.current) {
      onHide();
    }
  };


  const getCardTypeName = (type: string): 'Amarelo' | 'Vermelho' => {
    return type === 'yellow' ? 'Amarelo' : 'Vermelho';
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <dialog ref={dialogRef} className="sumula-dialog" onClick={handleDialogClick}>
        <div onClick={(e) => e.stopPropagation()}>
          <div className="dialog-header">
            <h2 className="dialog-title">Carregando Súmula...</h2>
            <button className="dialog-close" onClick={onHide} type="button">×</button>
          </div>
          <div className="dialog-body text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
          </div>
        </div>
      </dialog>
    );
  }

  if (error || !matchData) {
    return (
      <dialog ref={dialogRef} className="sumula-dialog" onClick={handleDialogClick}>
        <div onClick={(e) => e.stopPropagation()}>
          <div className="dialog-header">
            <h2 className="dialog-title">Erro</h2>
            <button className="dialog-close" onClick={onHide} type="button">×</button>
          </div>
          <div className="dialog-body text-center py-5">
            <p className="text-danger">{error || 'Dados da partida não encontrados'}</p>
            <Button variant="secondary" onClick={onHide}>Fechar</Button>
          </div>
        </div>
      </dialog>
    );
  }

  return (
    <dialog ref={dialogRef} className="sumula-dialog" onClick={handleDialogClick}>
      <div onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="dialog-header">
          <h2 className="dialog-title">Súmula da Partida</h2>
          <button className="dialog-close" onClick={onHide} type="button">×</button>
        </div>

        {/* Body */}
        <div className="dialog-body">
          <Container fluid className="px-4 py-3">
            {/* Cabeçalho da Partida */}
            <div className="match-header text-center mb-4">
              <div className="scoreboard-display p-4 bg-light rounded-3 shadow-sm">
                <div className="row align-items-center">
                  <div className="col-4">
                    <h4 className="team-name mb-1 " style={{color:"black"}}>{matchData.team_home}</h4>
                    <small className="text-muted">Casa</small>
                  </div>
                  <div className="col-4">
                    <div className="score-display">
                      <span className="score home-score"  style={{color:"black",fontSize:"1.5rem"}}>{matchData.team_home_score}</span>
                      <span className="score-separator mx-3"style={{color:"black",fontSize:"1.5rem"}}>×</span>
                      <span className="score away-score"  style={{color:"black",fontSize:"1.5rem"}}>{matchData.team_away_score}</span>
                    </div>
                  </div>
                  <div className="col-4">
                    <h4 className="team-name mb-1"  style={{color:"black"}}>{matchData.team_away}</h4>
                    <small className="text-muted">Visitante</small>
                  </div>
                </div>
                {matchData.date && (
                  <div className="match-info mt-3">
                    <Badge bg="secondary" className="me-2">
                      <i className="bi bi-calendar me-1"></i>
                      {formatDate(matchData.date)}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Estatísticas Resumidas */}
            <Row className="mb-4">
              <Col>
                <Card className="text-center h-100">
                  <Card.Body>
                    <div className="stat-number text-success fs-2 fw-bold">
                      {matchData.goals.length}
                    </div>
                    <div className="stat-label text-muted">Gols Marcados</div>
                  </Card.Body>
                </Card>
              </Col>
              <Col>
                <Card className="text-center h-100">
                  <Card.Body>
                    <div className="stat-number text-warning fs-2 fw-bold">
                      {matchData.cards.filter(c => c.card_type === 'yellow').length}
                    </div>
                    <div className="stat-label text-muted">Cartões Amarelos</div>
                  </Card.Body>
                </Card>
              </Col>
              <Col>
                <Card className="text-center h-100">
                  <Card.Body>
                    <div className="stat-number text-danger fs-2 fw-bold">
                      {matchData.cards.filter(c => c.card_type === 'red').length}
                    </div>
                    <div className="stat-label text-muted">Cartões Vermelhos</div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Tabelas de Eventos */}
            <Row className="g-3">
              {/* Gols */}
              <Col xl={6} lg={6} md={12}>
                <Card className="h-100">
                  <Card.Header className="bg-success text-white">
                    <div className="d-flex justify-content-between align-items-center">
                      <h6 className="mb-0">
                        <i className="bi bi-trophy me-2"></i>
                        Gols da Partida
                      </h6>
                      <Badge bg="light" text="success">{matchData.goals.length}</Badge>
                    </div>
                  </Card.Header>
                  <Card.Body className="p-0">
                    {matchData.goals.length > 0 ? (
                      <div className="table-responsive">
                        <Table hover className="mb-0" size="sm">
                          <thead className="table-light">
                            <tr>
                              <th>Minuto</th>
                              <th>Jogador</th>
                              <th>Time</th>
                            </tr>
                          </thead>
                          <tbody>
                            {matchData.goals
                              .sort((a, b) => a.minuteGoal - b.minuteGoal)
                              .map((goal, index) => (
                              <tr key={index}>
                                <td>
                                  <Badge bg="success" className="me-1">{goal.minuteGoal}'</Badge>
                                </td>
                                <td className="fw-semibold">
                                  <div className="d-flex align-items-center">
                                    <i className="bi bi-circle-fill text-success me-2" style={{fontSize: '8px'}}></i>
                                    <span className="text-truncate" title={goal.player?.nome || 'N/A'}>
                                      {goal.player?.nome || 'N/A'}
                                    </span>
                                  </div>
                                </td>
                                <td>
                                  <span className="text-truncate">
                                    {goal.team.name}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted">
                        <i className="bi bi-trophy fs-1 opacity-25"></i>
                        <p className="mb-0 mt-2">Nenhum gol foi marcado nesta partida</p>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              {/* Cartões */}
              <Col xl={6} lg={6} md={12}>
                <Card className="h-100">
                  <Card.Header className="bg-warning text-dark">
                    <div className="d-flex justify-content-between align-items-center">
                      <h6 className="mb-0">
                        <i className="bi bi-card-text me-2"></i>
                        Cartões da Partida
                      </h6>
                      <Badge bg="dark">{matchData.cards.length}</Badge>
                    </div>
                  </Card.Header>
                  <Card.Body className="p-0">
                    {matchData.cards.length > 0 ? (
                      <div className="table-responsive">
                        <Table hover className="mb-0" size="sm">
                          <thead className="table-light">
                            <tr>
                              <th>Minuto</th>
                              <th>Jogador</th>
                              <th>Time</th>
                              <th>Tipo</th>
                            </tr>
                          </thead>
                          <tbody>
                            {matchData.cards
                              .sort((a, b) => a.minute - b.minute)
                              .map((card, index) => (
                              <tr key={index}>
                                <td>
                                  <Badge bg="secondary">{card.minute}'</Badge>
                                </td>
                                <td className="fw-semibold">
                                  <div className="d-flex align-items-center">
                                    <i className={`bi bi-square-fill me-2 ${card.card_type === 'yellow' ? 'text-warning' : 'text-danger'}`} style={{fontSize: '8px'}}></i>
                                    <span className="text-truncate" title={card.player?.nome || 'N/A'}>
                                      {card.player?.nome || 'N/A'}
                                    </span>
                                  </div>
                                </td>
                                <td>
                                  <span className="text-truncate">
                                    {card.team.name}
                                  </span>
                                </td>
                                <td>
                                  <Badge 
                                    bg={card.card_type === 'yellow' ? 'warning' : 'danger'}
                                    text={card.card_type === 'yellow' ? 'dark' : 'white'}
                                  >
                                    {getCardTypeName(card.card_type)}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted">
                        <i className="bi bi-card-text fs-1 opacity-25"></i>
                        <p className="mb-0 mt-2">Nenhum cartão foi aplicado nesta partida</p>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Timeline de Eventos (se houver eventos) */}
            {(matchData.goals.length > 0 || matchData.cards.length > 0) && (
              <Card className="mt-4">
                <Card.Header>
                  <h6 className="mb-0">
                    <i className="bi bi-clock-history me-2"></i>
                    Cronologia dos Eventos
                  </h6>
                </Card.Header>
                <Card.Body>
                  <div className="timeline">
                    {[
                      ...matchData.goals.map(g => ({
                        type: 'goal' as const, 
                        minute: g.minuteGoal, 
                        player: g.player?.nome || 'N/A', 
                        playerId: g.player_id,
                        teamId: g.team_id,
                        teamName:g.team.name
                      })), 
                      ...matchData.cards.map(c => ({
                        type: 'card' as const, 
                        minute: c.minute, 
                        player: c.player?.nome || 'N/A', 
                        playerId: c.player_id, 
                        cardType: c.card_type,
                        teamId: c.team_id,
                        teamName:c.team.name
                      }))
                    ]
                      .sort((a, b) => a.minute - b.minute)
                      .map((event, index) => (
                        <div key={index} className="timeline-item d-flex align-items-center mb-2">
                          <div className="timeline-marker me-3">
                            <Badge bg="secondary" className="rounded-pill px-2">
                              {event.minute}'
                            </Badge>
                          </div>
                          <div className="timeline-content">
                            {event.type === 'goal' ? (
                              <span>
                                <i className="bi bi-circle-fill text-success me-2"></i>
                                <strong>{event.player}</strong> marcou um gol para {event.teamName}
                              </span>
                            ) : (
                              <span>
                                <i className={`bi bi-square-fill me-2 ${event.cardType === 'yellow' ? 'text-warning' : 'text-danger'}`}></i>
                                <strong>{event.player}</strong> recebeu cartão {getCardTypeName(event.cardType!).toLowerCase()} - {event.teamName}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </Card.Body>
              </Card>
            )}
          </Container>
         {
            showEdicaoSumulaPartida && (
              <EditarSumulaDialog
                  matchId={Number(matchId)}
                  show={showEdicaoSumulaPartida}
                  onHide={()=>setShowEdicaoSumulaPartida(false)}
                  onUpdate={() => setShowEdicaoSumulaPartida(false)}
              />
          )}
          <div className="d-flex gap-2 justify-content-end" style={{marginBlock: "1rem"}}>
            <Button variant="outline-primary" onClick={()=>setShowEdicaoSumulaPartida(true)}>
              Alterar
            </Button>
            <Button variant="outline-danger">
              Deletar
            </Button>
            <Button variant="outline-secondary" onClick={onHide}>
              Fechar
            </Button>
          </div>
        </div>
      </div>
    </dialog>
  );
};

export default VisualizarSumulaDialog;