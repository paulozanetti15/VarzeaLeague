import React, { useEffect, useState, useRef } from 'react';
import { Button, Form, Row, Col, Table, Alert, Container, Card, Badge } from 'react-bootstrap';
import axios from 'axios';
import "./CriarsumulaPartidasAmistosas.css";

interface Team {
  id: number;
  name: string;
}

interface Player {
  playerId: number;
  nome: string;
  teamId: number;
}

interface GoalAPI {
  id: number;
  match_id: number;
  player_id: number;
  minuteGoal: number;
  player: { id: number; nome: string };
  team_id?: number;
  team: { name: string };
}

interface CardAPI {
  id: number;
  match_id: number;
  card_type: 'yellow' | 'red';
  minute: number;
  player_id: number;
  player: { id: number; nome: string };
  team_id?: number;
  team: { name: string };
}

interface AlterarSumulaModalProps {
  matchId: number;
  show: boolean;
  onHide: () => void;
  onUpdate?: () => void;
}

const AlterarSumulaDialog = ({ matchId, show, onHide, onUpdate }: AlterarSumulaModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Dados da partida
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [homeTeamId, setHomeTeamId] = useState(0);
  const [awayTeamId, setAwayTeamId] = useState(0);
  const [matchDate, setMatchDate] = useState('');

  // Dados originais (do backend)
  const [originalGoals, setOriginalGoals] = useState<GoalAPI[]>([]);
  const [originalCards, setOriginalCards] = useState<CardAPI[]>([]);

  // Dados temporários (modificações locais)
  const [players, setPlayers] = useState<Player[]>([]);
  const [tempGoals, setTempGoals] = useState<GoalAPI[]>([]);
  const [tempCards, setTempCards] = useState<CardAPI[]>([]);
  const [goalsToAdd, setGoalsToAdd] = useState<any[]>([]);
  const [goalsToRemove, setGoalsToRemove] = useState<number[]>([]);
  const [cardsToAdd, setCardsToAdd] = useState<any[]>([]);
  const [cardsToRemove, setCardsToRemove] = useState<number[]>([]);

  // Formulários para adicionar novos eventos
  const [newGoalPlayer, setNewGoalPlayer] = useState('');
  const [newGoalMinute, setNewGoalMinute] = useState<number | ''>('');
  const [newCardPlayer, setNewCardPlayer] = useState('');
  const [newCardType, setNewCardType] = useState<'yellow' | 'red'>('yellow');
  const [newCardMinute, setNewCardMinute] = useState<number | ''>('');

  // Calcular placar baseado nos gols temporários
  const homeScore = tempGoals.filter(g => g.team_id === homeTeamId).length;
  const awayScore = tempGoals.filter(g => g.team_id === awayTeamId).length;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (show) {
      dialog.showModal();
      fetchMatchData();
    } else {
      dialog.close();
    }
  }, [show]);

  const fetchMatchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Token de autorização não encontrado.');
        return;
      }

      const response = await axios.get(`http://localhost:3001/api/matches/${matchId}/events`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const reportData = response.data.report[0];
      const homeTeamId = reportData?.teamHome?.id || 0;
      const awayTeamId = reportData?.teamAway?.id || 0;
      
      setHomeTeam(reportData?.teamHome?.name || '');
      setAwayTeam(reportData?.teamAway?.name || '');
      setHomeTeamId(homeTeamId);
      setAwayTeamId(awayTeamId);
      setMatchDate(reportData?.match?.date || '');
      
      const goalsData = response.data.goals || [];
      const cardsData = response.data.cards || [];
      
      setOriginalGoals(goalsData);
      setOriginalCards(cardsData);
      setTempGoals(goalsData);
      setTempCards(cardsData);

      const playersResponse = await axios.get(
        `http://localhost:3001/api/matches/${matchId}/roster-players`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPlayers(playersResponse.data.players || []);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados da partida.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = () => {
    if (!newGoalPlayer || newGoalMinute === '' || newGoalMinute <= 0 || newGoalMinute > 120) {
      setError('Preencha todos os campos do gol corretamente (minuto 1-120).');
      return;
    }

    const selectedPlayer = players.find(p => p.playerId.toString() === newGoalPlayer);
    if (!selectedPlayer) {
      setError('Jogador não encontrado.');
      return;
    }

    const playerTeamData = players.find(p => p.playerId === selectedPlayer.playerId);
    const teamName = playerTeamData?.teamId === homeTeamId ? homeTeam : awayTeam;

    // Criar gol temporário
    const newGoal: any = {
      id: Date.now(), // ID temporário
      match_id: matchId,
      player_id: selectedPlayer.playerId,
      minuteGoal: Number(newGoalMinute),
      player: { id: selectedPlayer.playerId, nome: selectedPlayer.nome },
      team_id: selectedPlayer.teamId,
      team: { name: teamName },
      isNew: true // Flag para identificar novos gols
    };

    setTempGoals([...tempGoals, newGoal]);
    setGoalsToAdd([...goalsToAdd, {
      team_id: selectedPlayer.teamId,
      playerId: selectedPlayer.playerId,
      minute: Number(newGoalMinute)
    }]);

    setSuccess('Gol adicionado! Clique em "Concluir Alterações" para salvar.');
    setNewGoalPlayer('');
    setNewGoalMinute('');
    setError(null);
    
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleAddCard = () => {
    if (!newCardPlayer || newCardMinute === '' || newCardMinute <= 0 || newCardMinute > 120) {
      setError('Preencha todos os campos do cartão corretamente (minuto 1-120).');
      return;
    }

    const selectedPlayer = players.find(p => p.playerId.toString() === newCardPlayer);
    if (!selectedPlayer) {
      setError('Jogador não encontrado.');
      return;
    }

    const playerTeamData = players.find(p => p.playerId === selectedPlayer.playerId);
    const teamName = playerTeamData?.teamId === homeTeamId ? homeTeam : awayTeam;

    // Criar cartão temporário
    const newCard: any = {
      id: Date.now(), // ID temporário
      match_id: matchId,
      player_id: selectedPlayer.playerId,
      card_type: newCardType,
      minute: Number(newCardMinute),
      player: { id: selectedPlayer.playerId, nome: selectedPlayer.nome },
      team_id: selectedPlayer.teamId,
      team: { name: teamName },
      isNew: true
    };

    setTempCards([...tempCards, newCard]);
    setCardsToAdd([...cardsToAdd, {
      playerId: selectedPlayer.playerId,
      cardType: newCardType,
      minute: Number(newCardMinute),
      team_id: selectedPlayer.teamId
    }]);

    setSuccess('Cartão adicionado! Clique em "Concluir Alterações" para salvar.');
    setNewCardPlayer('');
    setNewCardMinute('');
    setNewCardType('yellow');
    setError(null);
    
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleDeleteGoal = (goalId: number) => {
    const goal = tempGoals.find(g => g.id === goalId);
    if (!goal) return;

    if (goal.isNew) {
      // Remove da lista de adições se for novo
      setTempGoals(tempGoals.filter(g => g.id !== goalId));
      setGoalsToAdd(goalsToAdd.filter((_, i) => {
        const goalIndex = tempGoals.filter(g => g.isNew).findIndex(g => g.id === goalId);
        return i !== goalIndex;
      }));
    } else {
      // Marca para remoção se já existia
      setTempGoals(tempGoals.filter(g => g.id !== goalId));
      setGoalsToRemove([...goalsToRemove, goalId]);
    }

    setSuccess('Gol removido! Clique em "Concluir Alterações" para salvar.');
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleDeleteCard = (cardId: number) => {
    const card = tempCards.find(c => c.id === cardId);
    if (!card) return;

    if (card.isNew) {
      // Remove da lista de adições se for novo
      setTempCards(tempCards.filter(c => c.id !== cardId));
      setCardsToAdd(cardsToAdd.filter((_, i) => {
        const cardIndex = tempCards.filter(c => c.isNew).findIndex(c => c.id === cardId);
        return i !== cardIndex;
      }));
    } else {
      // Marca para remoção se já existia
      setTempCards(tempCards.filter(c => c.id !== cardId));
      setCardsToRemove([...cardsToRemove, cardId]);
    }

    setSuccess('Cartão removido! Clique em "Concluir Alterações" para salvar.');
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleConcluirAlteracoes = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Token de autorização não encontrado.');
        return;
      }

      // 1. Adicionar novos gols
      for (const goal of goalsToAdd) {
        await axios.post(
          `http://localhost:3001/api/matches/${matchId}/goals`,
          goal,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      // 2. Remover gols marcados
      for (const goalId of goalsToRemove) {
        await axios.delete(
          `http://localhost:3001/api/matches/${matchId}/goals/${goalId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      // 3. Adicionar novos cartões
      for (const card of cardsToAdd) {
        await axios.post(
          `http://localhost:3001/api/matches/${matchId}/cards`,
          card,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      // 4. Remover cartões marcados
      for (const cardId of cardsToRemove) {
        await axios.delete(
          `http://localhost:3001/api/matches/${matchId}/cards/${cardId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      // 5. Atualizar placar no histórico
      await axios.put(
        `http://localhost:3001/api/matches/atualizar-sumula/${matchId}`,
        {
          team_home_score: homeScore,
          team_away_score: awayScore
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess('Alterações salvas com sucesso!');
      
      // Limpar listas de pendências
      setGoalsToAdd([]);
      setGoalsToRemove([]);
      setCardsToAdd([]);
      setCardsToRemove([]);

      setTimeout(() => {
        onUpdate?.();
        onHide();
      }, 1000);
      
    } catch (error) {
      console.error('Erro ao salvar alterações:', error);
      setError('Erro ao salvar as alterações da súmula.');
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClick = (e: React.MouseEvent) => {
    if (e.target === dialogRef.current) {
      onHide();
    }
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

  const hasChanges = goalsToAdd.length > 0 || goalsToRemove.length > 0 || 
                     cardsToAdd.length > 0 || cardsToRemove.length > 0;

  return (
    <dialog ref={dialogRef} className="sumula-dialog" onClick={handleDialogClick}>
      <div onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="dialog-header">
          <h2 className="dialog-title">Alterar Súmula da Partida</h2>
          <button className="dialog-close" onClick={onHide} type="button">×</button>
        </div>

        {/* Body */}
        <div className="dialog-body">
          <Container fluid className="px-4 py-3">
            {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
            {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}
            
            {hasChanges && (
              <Alert variant="info">
                <i className="bi bi-info-circle me-2"></i>
                Você tem alterações pendentes. Clique em "Concluir Alterações" para salvar.
              </Alert>
            )}

            {loading && !tempGoals.length ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Carregando...</span>
                </div>
              </div>
            ) : (
              <>
                {/* Cabeçalho da Partida */}
                <div className="match-header text-center mb-4">
                  <div className="scoreboard-display p-4 bg-light rounded-3 shadow-sm">
                    <div className="row align-items-center">
                      <div className="col-4">
                        <h4 className="team-name mb-1" style={{color:"black"}}>{homeTeam}</h4>
                        <small className="text-muted">Casa</small>
                      </div>
                      <div className="col-4">
                        <div className="score-display">
                          <span className="score home-score" style={{color:"black",fontSize:"1.5rem"}}>{homeScore}</span>
                          <span className="score-separator mx-3" style={{color:"black",fontSize:"1.5rem"}}>×</span>
                          <span className="score away-score" style={{color:"black",fontSize:"1.5rem"}}>{awayScore}</span>
                        </div>
                      </div>
                      <div className="col-4">
                        <h4 className="team-name mb-1" style={{color:"black"}}>{awayTeam}</h4>
                        <small className="text-muted">Visitante</small>
                      </div>
                    </div>
                    {matchDate && (
                      <div className="match-info mt-3">
                        <Badge bg="secondary">
                          <i className="bi bi-calendar me-1"></i>
                          {formatDate(matchDate)}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                {/* Estatísticas */}
                <Row className="mb-4">
                  <Col>
                    <Card className="text-center h-100">
                      <Card.Body>
                        <div className="stat-number text-success fs-2 fw-bold">{tempGoals.length}</div>
                        <div className="stat-label text-muted">Gols</div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col>
                    <Card className="text-center h-100">
                      <Card.Body>
                        <div className="stat-number text-warning fs-2 fw-bold">
                          {tempCards.filter(c => c.card_type === 'yellow').length}
                        </div>
                        <div className="stat-label text-muted">Amarelos</div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col>
                    <Card className="text-center h-100">
                      <Card.Body>
                        <div className="stat-number text-danger fs-2 fw-bold">
                          {tempCards.filter(c => c.card_type === 'red').length}
                        </div>
                        <div className="stat-label text-muted">Vermelhos</div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {/* Formulários de Adição */}
                <Row className="g-4 mb-4">
                  {/* Adicionar Gol */}
                  <Col lg={6}>
                    <Card className="border-success">
                      <Card.Header className="bg-success text-white">
                        <h6 className="mb-0">
                          <i className="bi bi-plus-circle me-2"></i>
                          Adicionar Novo Gol
                        </h6>
                      </Card.Header>
                      <Card.Body>
                        <Form.Group className="mb-3">
                          <Form.Label>Jogador</Form.Label>
                          <Form.Select 
                            value={newGoalPlayer} 
                            onChange={(e) => setNewGoalPlayer(e.target.value)}
                            disabled={loading}
                          >
                            <option value="">Selecione um jogador</option>
                            {players.map(p => (
                              <option key={p.playerId} value={p.playerId}>{p.nome}</option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Minuto da Partida</Form.Label>
                          <Form.Control 
                            type="number"
                            min="1"
                            max="120"
                            placeholder="Digite o minuto (1-120)"
                            value={newGoalMinute}
                            onChange={(e) => setNewGoalMinute(e.target.value === '' ? '' : Number(e.target.value))}
                            disabled={loading}
                          />
                        </Form.Group>
                        <Button 
                          variant="success" 
                          className="w-100" 
                          onClick={handleAddGoal} 
                          disabled={loading}
                        >
                          <i className="bi bi-plus-lg me-2"></i>
                          Adicionar Gol
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* Adicionar Cartão */}
                  <Col lg={6}>
                    <Card className="border-warning">
                      <Card.Header className="bg-warning text-dark">
                        <h6 className="mb-0">
                          <i className="bi bi-plus-circle me-2"></i>
                          Adicionar Novo Cartão
                        </h6>
                      </Card.Header>
                      <Card.Body>
                        <Form.Group className="mb-3">
                          <Form.Label>Jogador</Form.Label>
                          <Form.Select 
                            value={newCardPlayer}
                            onChange={(e) => setNewCardPlayer(e.target.value)}
                            disabled={loading}
                          >
                            <option value="">Selecione um jogador</option>
                            {players.map(p => (
                              <option key={p.playerId} value={p.playerId}>{p.nome}</option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                        <Row className="g-2 mb-3">
                          <Col>
                            <Form.Label>Tipo do Cartão</Form.Label>
                            <Form.Select 
                              value={newCardType}
                              onChange={(e) => setNewCardType(e.target.value as 'yellow' | 'red')}
                              disabled={loading}
                            >
                              <option value="yellow">Cartão Amarelo</option>
                              <option value="red">Cartão Vermelho</option>
                            </Form.Select>
                          </Col>
                          <Col>
                            <Form.Label>Minuto da Partida</Form.Label>
                            <Form.Control 
                              type="number"
                              min="1"
                              max="120"
                              placeholder="1-120"
                              value={newCardMinute}
                              onChange={(e) => setNewCardMinute(e.target.value === '' ? '' : Number(e.target.value))}
                              disabled={loading}
                            />
                          </Col>
                        </Row>
                        <Button 
                          variant="warning" 
                          className="w-100" 
                          onClick={handleAddCard} 
                          disabled={loading}
                        >
                          <i className="bi bi-plus-lg me-2"></i>
                          Adicionar Cartão
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {/* Listas de Eventos Registrados */}
                <Row className="g-3">
                  {/* Gols Registrados */}
                  <Col lg={6}>
                    <Card>
                      <Card.Header className="bg-success text-white">
                        <div className="d-flex justify-content-between align-items-center">
                          <h6 className="mb-0">
                            <i className="bi bi-trophy me-2"></i>
                            Gols Registrados
                          </h6>
                          <Badge bg="light" text="success">{tempGoals.length}</Badge>
                        </div>
                      </Card.Header>
                      <Card.Body className="p-0">
                        <div className="table-responsive">
                          <Table hover className="mb-0" size="sm">
                            <thead className="table-light">
                              <tr>
                                <th>Minuto</th>
                                <th>Jogador</th>
                                <th>Time</th>
                                <th style={{width: '70px', textAlign: 'center'}}>Remover</th>
                              </tr>
                            </thead>
                            <tbody>
                              {tempGoals.length > 0 ? tempGoals
                                .sort((a, b) => a.minuteGoal - b.minuteGoal)
                                .map((goal) => (
                                <tr key={goal.id} className={goal.isNew ? 'table-success' : ''}>
                                  <td>
                                    <Badge bg="success">{goal.minuteGoal}'</Badge>
                                    {goal.isNew && <Badge bg="info" className="ms-1" style={{fontSize: '0.65rem'}}>Novo</Badge>}
                                  </td>
                                  <td className="fw-semibold">
                                    <div className="text-truncate" title={goal.player?.nome}>
                                      {goal.player?.nome}
                                    </div>
                                  </td>
                                  <td>
                                    <div className="text-truncate" title={goal.team?.name}>
                                      {goal.team?.name}
                                    </div>
                                  </td>
                                  <td className="text-center">
                                    <Button 
                                      variant="outline-danger" 
                                      size="sm"
                                      onClick={() => handleDeleteGoal(goal.id)}
                                      disabled={loading}
                                      title="Remover gol"
                                    >
                                      <i className="bi bi-trash"></i>
                                    </Button>
                                  </td>
                                </tr>
                              )) : (
                                <tr>
                                  <td colSpan={4} className="text-center text-muted py-3">
                                    Nenhum gol registrado
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </Table>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* Cartões Registrados */}
                  <Col lg={6}>
                    <Card>
                      <Card.Header className="bg-warning text-dark">
                        <div className="d-flex justify-content-between align-items-center">
                          <h6 className="mb-0">
                            <i className="bi bi-card-text me-2"></i>
                            Cartões Registrados
                          </h6>
                          <Badge bg="dark">{tempCards.length}</Badge>
                        </div>
                      </Card.Header>
                      <Card.Body className="p-0">
                        <div className="table-responsive">
                          <Table hover className="mb-0" size="sm">
                            <thead className="table-light">
                              <tr>
                                <th>Minuto</th>
                                <th>Jogador</th>
                                <th>Tipo</th>
                                <th style={{width: '70px', textAlign: 'center'}}>Remover</th>
                              </tr>
                            </thead>
                            <tbody>
                              {tempCards.length > 0 ? tempCards
                                .sort((a, b) => a.minute - b.minute)
                                .map((card) => (
                                <tr key={card.id} className={card.isNew ? 'table-warning' : ''}>
                                  <td>
                                    <Badge bg="secondary">{card.minute}'</Badge>
                                    {card.isNew && <Badge bg="info" className="ms-1" style={{fontSize: '0.65rem'}}>Novo</Badge>}
                                  </td>
                                  <td className="fw-semibold">
                                    <div className="text-truncate" title={card.player?.nome}>
                                      {card.player?.nome}
                                    </div>
                                  </td>
                                  <td>
                                    <Badge bg={card.card_type === 'yellow' ? 'warning' : 'danger'}>
                                      {card.card_type === 'yellow' ? 'Amarelo' : 'Vermelho'}
                                    </Badge>
                                  </td>
                                  <td className="text-center">
                                    <Button 
                                      variant="outline-danger" 
                                      size="sm"
                                      onClick={() => handleDeleteCard(card.id)}
                                      disabled={loading}
                                      title="Remover cartão"
                                    >
                                      <i className="bi bi-trash"></i>
                                    </Button>
                                  </td>
                                </tr>
                              )) : (
                                <tr>
                                  <td colSpan={4} className="text-center text-muted py-3">
                                    Nenhum cartão registrado
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </Table>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </>
            )}
          </Container>

          <hr />
          
          {/* Footer */}
          <div className="d-flex gap-2 justify-content-end" style={{marginBlock: "1rem"}}>
            <Button 
              variant="primary" 
              onClick={handleConcluirAlteracoes}
              disabled={loading || !hasChanges}
            >
              <i className="bi bi-check-circle me-1"></i>
              {loading ? 'Salvando...' : 'Concluir Alterações'}
            </Button>
            <Button variant="outline-secondary" onClick={onHide} disabled={loading}>
              Fechar
            </Button>
          </div>
        </div>
      </div>
    </dialog>
  );
};

export default AlterarSumulaDialog;