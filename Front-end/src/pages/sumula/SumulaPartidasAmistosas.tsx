import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import { Button, Form, Row, Col, Table, Alert, Container, Card } from 'react-bootstrap';
import "./sumulaPartidasAmistosas.css";
interface Team {
  id: number;
  name: string;
}

interface Player {
  playerId: number;
  nome: string;
  teamId: number;
}

interface Goal {
  player: string;
  minute: number;
  team: string;
  playerId?: number;
}

interface Card {
  player: string;
  team: string;
  type: 'Amarelo' | 'Vermelho';
  minute: number;
  playerId?: number;
}

interface SumulaPartidaAmistosaModalProps {
  id: number;
  show: boolean;
  onHide: () => void;
  // Quando true, exibe botão de salvar; deve ser true apenas para o organizador da partida
  canSave?: boolean;
}
interface MatchReport{
    match_id  : number ,
    team_home : number , 
    team_away : number,
    team_home_score : number,
    team_away_score : number,
}

const SumulaPartidaAmistosaModal = ({ id, show, onHide, canSave = false }: SumulaPartidaAmistosaModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [homeTeam, setHomeTeam] = useState<number>(0);
  const [awayTeam, setAwayTeam] = useState<number>(0);
  const [goalPlayer, setGoalPlayer] = useState<string>('');
  const [goalMinute, setGoalMinute] = useState<number | ''>('');
  const [cardPlayer, setCardPlayer] = useState<string>('');
  const [cardType, setCardType] = useState<'Amarelo' | 'Vermelho'>('Amarelo');
  const [cardMinute, setCardMinute] = useState<number | ''>('');
  const [attendance, setAttendance] = useState<number | ''>('');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [nomeHomeTeam,setNomeHomeTeam] = useState<string>('');
  const [nomeAwayTeam,setNomeAwayTeam] = useState<string>('');
  const [tempGoals, setTempGoals] = useState<Goal[]>([]);
  const [tempCards, setTempCards] = useState<Card[]>([]);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (show) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [show]);

  // Funções de validação
  const validateMatchInfo = (): boolean => {
    if (!homeTeam || !awayTeam) {
      setError('Selecione ambos os times.');
      return false;
    }
    if (homeTeam === awayTeam) {
      setError('Times não podem ser iguais.');
      return false;
    }
    
    setError(null);
    return true;
  };

  const validateGoal = (): boolean => {
    if (!goalPlayer) {
      setError('Selecione um jogador para o gol.');
      return false;
    }
    if (goalMinute === '' || goalMinute <= 0 || goalMinute > 120) {
      setError('Informe um minuto válido (1-120).');
      return false;
    }
    setError(null);
    return true;
  };

  const validateCard = (): boolean => {
    if (!cardPlayer) {
      setError('Selecione um jogador para o cartão.');
      return false;
    }
    if (cardMinute === '' || cardMinute <= 0 || cardMinute > 120) {
      setError('Informe um minuto válido (1-120).');
      return false;
    }
    setError(null);
    return true;
  };

  // Buscar times da partida
  const fetchTeams = async (matchId: number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Token de autorização não encontrado.');
        return;
      }

      const response = await axios.get(`http://localhost:3001/api/matches/${matchId}/join-team`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setTeams(response.data);
    } catch (error) {
      console.error('Erro ao carregar times:', error);
      setError('Erro ao carregar times da partida.');
    } finally {
      setLoading(false);
    }
  };

  // Buscar jogadores
  const fetchMatchPlayers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`http://localhost:3001/api/matches/${id}/roster-players`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 200) {
        setPlayers(response.data.players);
      } else {
        setPlayers([]);
      }
    } catch (error) {
      console.error('Erro ao carregar jogadores:', error);
      setPlayers([]);
    }
  };

  useEffect(() => {
    if (show && id) {
      fetchTeams(id);
      fetchMatchPlayers();
    }
  }, [id, show]);

  // Handlers
  const handleSaveMatch = async (id:number) => {
    if (!validateMatchInfo()) return;

    const token = localStorage.getItem('token');
    if (!token) {
        setError('Token de autorização não encontrado.');
        return;
    }

    const sumula: MatchReport = {
        match_id  : id,
        team_home : homeTeam,
        team_away : awayTeam,
        team_home_score : tempGoals.filter(g => teams.find(t => t.id === g.playerId)?.id === homeTeam).length,
        team_away_score : tempGoals.filter(g => teams.find(t => t.id === g.playerId)?.id === awayTeam).length,
    };

    try {
      setLoading(true);
      // 1️⃣ Salvar partida
      const adicionarSumula = await axios.post(
        `http://localhost:3001/api/historico/adicionar-sumula`,
        sumula,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      if(adicionarSumula.status===201){
        // 2️⃣ Enviar gols
        await Promise.all(tempGoals.map(goal => axios.post(
          `http://localhost:3001/api/matches/${id}/goals`,
          {
              playerId: goal.playerId,
              minute: goal.minute
          },
          { headers: { Authorization: `Bearer ${token}` } }
        )));

        // 3️⃣ Enviar cartões
        await Promise.all(tempCards.map(card => axios.post(
            `http://localhost:3001/api/matches/${id}/cards`,
            {
                playerId: card.playerId,
                cardType: card.type.toLowerCase() === 'amarelo' ? 'yellow' : 'red',
                minute: card.minute
            },
            { headers: { Authorization: `Bearer ${token}` } }
        )));

        // Atualizar estado visual
        setGoals(tempGoals);
        setCards(tempCards);
        setHomeScore(sumula.team_home_score);
        setAwayScore(sumula.team_away_score);

        // Limpar temporários
        setTempGoals([]);
        setTempCards([]);
        alert('Partida validada com sucesso!');
        onHide()
      }
    } catch (error) {
      console.error(error);
      setError('Erro ao salvar partida.');
    } finally {
      setLoading(false);
    }
  };


  const handleAddGoal = () => {
    if (!validateGoal()) return;

    const selectedPlayer = players.find(p => p.playerId.toString() === goalPlayer);
    if (!selectedPlayer) {
        setError("Jogador inválido.");
        return;
    }

    const playerTeam = teams.find(t => t.id === selectedPlayer.teamId);

    const newGoal: Goal = {
        player: selectedPlayer.nome,
        minute: Number(goalMinute),
        team: playerTeam?.name || 'Time não identificado',
        playerId: selectedPlayer.playerId
    };

    setGoals([...goals, newGoal]);

    if (selectedPlayer.teamId === homeTeam) {
        setHomeScore(prev => prev + 1);
    } else if (selectedPlayer.teamId === awayTeam) {
        setAwayScore(prev => prev + 1);
    }

    setGoalPlayer('');
    setGoalMinute('');
    setError(null);
  };
  const handleAddCard = () => {
    if (!validateCard()) return;

    const selectedPlayer = players.find(p => p.playerId.toString() === cardPlayer);
    const playerTeam = teams.find(t => t.id === selectedPlayer?.teamId);

    const newCard: Card = {
        player: selectedPlayer?.nome || cardPlayer,
        team: playerTeam?.name || 'Time não identificado',
        type: cardType,
        minute: Number(cardMinute),
        playerId: selectedPlayer?.playerId
    };

    setTempCards([...tempCards, newCard]); // adiciona apenas ao temporário
    setCards([...cards,newCard])
    setCardPlayer('');
    setCardMinute('');
    setCardType('Amarelo');
    setError(null);
  };
  
  

  const handleDialogClick = (e: React.MouseEvent) => {
    if (e.target === dialogRef.current) {
      onHide();
    }
  };

  return (
    <>
      <dialog 
        ref={dialogRef} 
        className="sumula-dialog"
        onClick={handleDialogClick}
      >
        <div onClick={(e) => e.stopPropagation()}>
          {/* Header */}
            <div className="dialog-header">
            <h2 className="dialog-title">Súmula da Partida</h2>
            <button className="dialog-close" onClick={onHide} type="button">
                ×
            </button>
            </div>
            <div className="scoreboard text-center my-3">
                <h4 style={{color:"black"}}>
                    {nomeHomeTeam} {homeScore} x {awayScore} {nomeAwayTeam}
                </h4>
            </div>


          {/* Body */}
            <div className="dialog-body">
            <Container fluid className="px-4 py-3">
                {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

                {/* Estatísticas Resumidas */}
                <div className="summary-stats">
                  <Row className="text-center">
                      <Col>
                        <div className="fw-bold">{goals.length}</div>
                        <small>Gols</small>
                        </Col>
                        <Col>
                        <div className="fw-bold">{cards.filter(c => c.type === 'Amarelo').length}</div>
                        <small>Cartões Amarelos</small>
                        </Col>
                        <Col>
                        <div className="fw-bold">{cards.filter(c => c.type === 'Vermelho').length}</div>
                        <small>Cartões Vermelhos</small>
                      </Col>
                  </Row>
                </div>

              {/* Informações da Partida */}
              <div className="form-section section-primary">
                <h5 className="text-primary">Informações da Partida</h5>
                <Row className="g-3">
                  <Col lg={4} md={6}>
                  <Form.Group>
                    <Form.Label>Time da Casa</Form.Label>
                    <Form.Select 
                        value={homeTeam} 
                        onChange={(e) => {
                            const selectedId = Number(e.target.value);
                            setHomeTeam(selectedId);
                            const team = teams.find(t => t.id === selectedId);
                            if (team) setNomeHomeTeam(team.name);
                        }}
                        disabled={loading}
                        >
                        <option value="">Selecione o time da casa</option>
                        {teams.map((team) => (
                            <option key={team.id} value={team.id.toString()}>
                            {team.name}
                            </option>
                        ))}
                        </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col lg={4} md={6}>
                    <Form.Group>
                      <Form.Label>Time Visitante</Form.Label>
                      <Form.Select 
                        value={awayTeam} 
                        onChange={(e) => {
                            const selectedId = Number(e.target.value);
                            setAwayTeam(selectedId);
                            const team = teams.find(t => t.id === selectedId);
                            if (team) setNomeAwayTeam(team.name);
                        }}
                        >
                        <option value="">Selecione o time de fora</option>
                        {teams.map((team) => (
                            <option key={team.id} value={team.id.toString()}>
                            {team.name}
                            </option>
                        ))}
                        </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </div>
              <Row className="g-4 mb-4">
                {/* Registrar Gol */}
                <Col lg={6} md={12}>
                  <div className="form-section section-success">
                    <h5 className="text-success">Registrar Gol</h5>
                    <Row className="g-3">
                      <Col xs={12}>
                        <Form.Group>
                          <Form.Label>Jogador</Form.Label>
                          <Form.Select 
                            value={goalPlayer} 
                            onChange={(e) => setGoalPlayer(e.target.value)}
                            disabled={loading || !homeTeam || !awayTeam}

                          >
                            <option value="">Selecione um jogador</option>
                            {players?.map((player) => (
                              <option key={player.playerId} value={player.playerId}>
                                {player.nome}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col sm={8} xs={7}>
                        <Form.Group>
                          <Form.Label>Minuto da Partida</Form.Label>
                          <Form.Control 
                            type="number" 
                            min="1"
                            max="120"
                            placeholder="Digite o minuto (1-120)"
                            value={goalMinute} 
                            onChange={(e) => setGoalMinute(e.target.value === '' ? '' : Number(e.target.value))} 
                            disabled={loading || !homeTeam || !awayTeam}
                          />
                        </Form.Group>
                      </Col>
                      <Col sm={4} xs={5} className="d-flex align-items-end">
                        <Button 
                          variant="success" 
                          className="w-100" 
                          onClick={handleAddGoal}
                        >
                          Registrar Gol
                        </Button>
                      </Col>
                    </Row>
                  </div>
                </Col>

                {/* Registrar Cartão */}
                <Col lg={6} md={12}>
                  <div className="form-section section-warning">
                    <h5 className="text-warning">Registrar Cartão</h5>
                    <Row className="g-3">
                      <Col xs={12}>
                        <Form.Group>
                          <Form.Label>Jogador</Form.Label>
                          <Form.Select 
                            value={cardPlayer} 
                            onChange={(e) => setCardPlayer(e.target.value)}
                            disabled={loading || !homeTeam || !awayTeam}
                          >
                            <option value="">Selecione um jogador</option>
                            {players.map((player) => (
                              <option key={player.playerId} value={player.playerId}>
                                {player.nome}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col sm={6} xs={6}>
                        <Form.Group>
                          <Form.Label>Tipo do Cartão</Form.Label>
                          <Form.Select 
                            value={cardType} 
                            onChange={(e) => setCardType(e.target.value as 'Amarelo' | 'Vermelho')}
                            disabled={loading || !homeTeam || !awayTeam}
                          >
                            <option value="Amarelo">Cartão Amarelo</option>
                            <option value="Vermelho">Cartão Vermelho</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col sm={6} xs={6}>
                        <Form.Group>
                          <Form.Label>Minuto da Partida</Form.Label>
                          <Form.Control 
                            type="number" 
                            min="1"
                            max="120"
                            placeholder="1-120"
                            value={cardMinute} 
                            onChange={(e) => setCardMinute(e.target.value === '' ? '' : Number(e.target.value))} 
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={12}>
                        <Button 
                          variant="warning" 
                          className="w-100" 
                          onClick={handleAddCard}
                        >
                          Registrar Cartão
                        </Button>
                      </Col>
                    </Row>
                  </div>
                </Col>
              </Row>

              {/* Tabelas de Registros */}
              <Row className="g-3">
                {/* Listagem de Gols */}
                <Col xl={6} lg={6} md={12}>
                  <Card className="h-100">
                    <Card.Header className="bg-success text-white">
                      <div className="d-flex justify-content-between align-items-center">
                        <h6 className="mb-0">Gols Registrados</h6>
                        <span className="badge bg-light text-success">{goals.length}</span>
                      </div>
                    </Card.Header>
                    <Card.Body className="p-0">
                      <div className="table-responsive">
                        <Table hover className="mb-0" size="sm">
                          <thead>
                            <tr>
                              <th>Jogador</th>
                              <th>Time</th>
                              <th>Minuto</th>
                            </tr>
                          </thead>
                          <tbody>
                            {goals.length > 0 ? goals.map((goal, index) => (
                              <tr key={index}>
                                <td className="fw-semibold">
                                  <div className="text-truncate" title={goal.player}>
                                    {goal.player}
                                  </div>
                                </td>
                                <td>
                                  <div className="text-truncate" title={goal.team}>
                                    {goal.team}
                                  </div>
                                </td>
                                <td>
                                  <span className="badge bg-success">{goal.minute}'</span>
                                </td>
                              </tr>
                            )) : (
                              <tr>
                                <td colSpan={3} className="text-center text-muted py-3">
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

                {/* Listagem de Cartões */}
                <Col xl={6} lg={6} md={12}>
                  <Card className="h-100">
                    <Card.Header className="bg-warning text-dark">
                      <div className="d-flex justify-content-between align-items-center">
                        <h6 className="mb-0">Cartões Registrados</h6>
                        <span className="badge bg-dark text-light">{cards.length}</span>
                      </div>
                    </Card.Header>
                    <Card.Body className="p-0">
                      <div className="table-responsive">
                        <Table hover className="mb-0" size="sm">
                          <thead>
                            <tr>
                              <th>Jogador</th>
                              <th>Time</th>
                              <th>Tipo</th>
                              <th>Minuto</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cards.length > 0 ? cards.map((card, index) => (
                              <tr key={index}>
                                <td className="fw-semibold">
                                  <div className="text-truncate" title={card.player}>
                                    {card.player}
                                  </div>
                                </td>
                                <td>
                                  <div className="text-truncate" title={card.team}>
                                    {card.team}
                                  </div>
                                </td>
                                <td>
                                  <span className={`badge ${card.type === 'Amarelo' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                                    {card.type}
                                  </span>
                                </td>
                                <td>
                                  <span className="badge bg-secondary">{card.minute}'</span>
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
            </Container>
             <hr></hr>
             <div className="d-flex gap-2 justify-content-end " style={{marginBlock:"1rem"}}>
                {canSave && (
                  <Button 
                    variant="primary" 
                    onClick={() => handleSaveMatch(id)}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                        Salvando...
                      </>
                    ) : (
                      'Salvar Partida'
                    )}
                  </Button>
                )}
                <Button 
                  variant="outline-secondary" 
                  onClick={onHide} 
                  disabled={loading}
                  >
                  Fechar
                </Button>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
};

export default SumulaPartidaAmistosaModal;