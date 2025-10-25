import React, { useState, useEffect, useContext } from "react";
import Card from 'react-bootstrap/Card';
import Nav from 'react-bootstrap/Nav';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import "./HistoricoPage.css";
import axios from "axios";
import { HistoricoContext } from '../../context/HistoricoContext';

interface Team {
  id: number,
  name: string
}

const HistoricoPage = () => {
  const [activeTab, setActiveTab] = useState('amistosos');
  const [team, setTeam] = useState<Team>({ id: 0, name: "" })
  const historico = useContext(HistoricoContext);

  const StatusResultado = (idTeamHome: Number, idTeamAway: Number, teamHomeGoals: Number, teamAwayGoals: Number, meuId: Number) => {
    let resultado;
    if (meuId === idTeamHome) {
      if (teamHomeGoals > teamAwayGoals) {
        resultado = 'Vitória';
      } else if (teamHomeGoals < teamAwayGoals) {
        resultado = 'Derrota';
      } else {
        resultado = 'Empate';
      }
    } else if (meuId === idTeamAway) {
      if (teamAwayGoals > teamHomeGoals) {
        resultado = 'Vitória';
      } else if (teamAwayGoals < teamHomeGoals) {
        resultado = 'Derrota';
      } else {
        resultado = 'Empate';
      }
    }
    return resultado;
  };

  const getResultadoClass = (idTeamHome: Number, idTeamAway: Number, teamHomeGoals: Number, teamAwayGoals: Number, meuId: Number) => {
    const resultado = StatusResultado(idTeamHome, idTeamAway, teamHomeGoals, teamAwayGoals, meuId);
    switch (resultado) {
      case 'Vitória': return 'bg-success text-white';
      case 'Derrota': return 'bg-danger text-white';
      case 'Empate': return 'bg-secondary text-white';
      default: return 'bg-info text-white';
    }
  };

  useEffect(() => {
    try {
      const fetchTeam = async () => {
        let user = JSON.parse(localStorage.getItem('user') || '{}');
        let idUser = parseInt(user.id);
        let token = localStorage.getItem('token');
        if (!user.id || !token) return;
        const responseGetTeam = await axios.get(`http://localhost:3001/api/teams/${idUser}/teamCaptain`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTeam({ id: responseGetTeam.data.id, name: responseGetTeam.data.name });
      };
      fetchTeam();
    } catch (err) {
      console.log(err);
    }
  }, []);

  useEffect(() => {
    historico?.fetchHistorico(team.id);
  }, [team]);

  return (
    <div className="min-h-screen bg-light">
      <div className="container py-5">
        <h1 className="text-center text-dark mb-5">
          Histórico do {team.name}
        </h1>
        
        <Row className="g-4 mb-5">
          <Col xs={12} sm={6} md={4} lg={3}>
            <Card className="shadow-sm border-0 h-100">
              <Card.Body className="text-center">
                <Card.Title className="text-muted fw-bold">Amistosos Participados</Card.Title>
                <Card.Text className="display-4 fw-bold text-dark">
                  {historico?.amistosos}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} sm={6} md={4} lg={3}>
            <Card className="shadow-sm border-0 h-100">
              <Card.Body className="text-center">
                <Card.Title className="text-muted fw-bold">Campeonatos Participados</Card.Title>
                <Card.Text className="display-4 fw-bold text-dark">
                  {historico?.campeonatos}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} sm={6} md={4} lg={3}>
            <Card className="shadow-sm border-0 h-100">
              <Card.Body className="text-center">
                <Card.Title className="text-muted fw-bold">Vitórias</Card.Title>
                <Card.Text className="display-4 fw-bold text-success">
                  {historico?.vitoriasGeral}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} sm={6} md={4} lg={3}>
            <Card className="shadow-sm border-0 h-100">
              <Card.Body className="text-center">
                <Card.Title className="text-muted fw-bold">Derrotas</Card.Title>
                <Card.Text className="display-4 fw-bold text-danger">
                  {historico?.derrotasGeral}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} sm={6} md={4} lg={3}>
            <Card className="shadow-sm border-0 h-100">
              <Card.Body className="text-center">
                <Card.Title className="text-muted fw-bold">Empates</Card.Title>
                <Card.Text className="display-4 fw-bold text-secondary">
                  {historico?.empatesGeral}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} sm={6} md={4} lg={3}>
            <Card className="shadow-sm border-0 h-100">
              <Card.Body className="text-center">
                <Card.Title className="text-muted fw-bold">Aproveitamento em Campeonatos</Card.Title>
                <Card.Text className="display-4 fw-bold text-info">
                  {historico?.aproveitamentoCampeonatos} %
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          
          <Col xs={12} sm={6} md={4} lg={3}>
            <Card className="shadow-sm border-0 h-100">
              <Card.Body className="text-center">
                <Card.Title className="text-muted fw-bold">Desempenho em Amistosos</Card.Title>
                <Card.Text className="display-4 fw-bold text-info">
                  {historico?.aproveitamentoAmistosos} %
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Nav variant="tabs" defaultActiveKey="amistosos" className="mb-4">
          <Nav.Item>
            <Nav.Link eventKey="amistosos" onClick={() => setActiveTab("amistosos")}>Partidas Amistosas</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="campeonatos" onClick={() => setActiveTab("campeonatos")}>Partidas Campeonatos</Nav.Link>
          </Nav.Item>
        </Nav>

        <div>
          {activeTab === "amistosos" && (
            <div className="mt-4">
              <h2 className="text-center text-dark mb-4">Partidas Amistosas</h2>
              <Row xs={1} md={2} lg={3} className="g-4">
                {historico?.PartidasAmistosas.length > 0 ? (
                  historico?.PartidasAmistosas.map((partida) => (
                    <Col key={partida.id}>
                      <Card className="shadow-sm border-0 h-100">
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h5 className="fw-bold">VS {team.id === partida.team_away ? partida.teamHome.name : partida.teamAway.name}</h5>
                            <span className={`badge rounded-pill ${getResultadoClass(partida.team_home, partida.team_away, partida.teamHome_score, partida.teamAway_score, team.id)}`}>
                              {StatusResultado(partida.team_home, partida.team_away, partida.teamHome_score, partida.teamAway_score, team.id)}
                            </span>
                          </div>
                          
                          <div className="d-flex flex-column text-muted small mb-2">
                            <div className="d-flex align-items-center mb-1">
                              <span className="me-3">🏟️ {partida.Match.nomequadra}</span>
                              <span>📍 {partida.Match.location}</span>
                            </div>
                            <div className="d-flex align-items-center">
                              <span className="me-3">🗓 {new Date(partida.Match.date).toLocaleDateString("pt-BR")}</span>
                              <span>🕒 {partida.Match.date.split(" ")[1]}</span>
                            </div>
                          </div>
                          
                          <hr />
                          
                          <div className="d-flex justify-content-between align-items-center">
                            <h4 className="fw-bold">{partida.teamHome_score} <span className="text-muted">x</span> {partida.teamAway_score}</h4>
                            <span className="text-muted">
                              {team.id === partida.team_home ? "🏠 Casa" : "✈️ Fora"}
                            </span>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))
                ) : (
                  <Col xs={12}>
                    <p className="text-center text-muted py-5">Não possui nenhuma partida amistosa.</p>
                  </Col>
                )}
              </Row>
            </div>
          )}

          {activeTab === 'campeonatos' && (
            <div className="mt-4">
              <h2 className="text-center text-dark mb-4">Partidas de Campeonato</h2>
              <Row xs={1} md={2} lg={3} className="g-4">
                {historico?.PartidasCampeonato.length > 0 ? (
                  historico?.PartidasCampeonato.map((partida) => (
                    <Col key={partida.id}>
                      <Card className="shadow-sm border-0 h-100">
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h5 className="fw-bold">VS {team.id === partida.team_away ? partida.teamHome.name : partida.teamAway.name}</h5>
                            <span className={`badge rounded-pill ${getResultadoClass(partida.team_home, partida.team_away, partida.teamHome_score, partida.teamAway_score, team.id)}`}>
                              {StatusResultado(partida.team_home, partida.team_away, partida.teamHome_score, partida.teamAway_score, team.id)}
                            </span>
                          </div>
                          <div className="d-flex flex-column text-muted small mb-2">
                            <div className="d-flex align-items-center mb-1">
                              <span className="me-3">🏆 {partida.match.championship.name}</span>
                              <span>🏟️ {partida.match.nomequadra}</span>
                            </div>
                            <div className="d-flex align-items-center">
                              <span className="me-3">🗓 {new Date(partida.match.date).toLocaleDateString("pt-BR")}</span>
                              <span>🕒 {partida.match.date.split(" ")[1]}</span>
                            </div>
                          </div>
                          <hr />
                          <div className="d-flex justify-content-between align-items-center">
                            <h4 className="fw-bold">{partida.teamHome_score} <span className="text-muted">x</span> {partida.teamAway_score}</h4>
                            <span className="text-muted">
                              {team.id === partida.team_home ? '🏠 Casa' : '✈️ Fora'}
                            </span>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))
                ) : (
                  <Col xs={12}>
                    <p className="text-center text-muted py-5">Não possui nenhuma partida de campeonato.</p>
                  </Col>
                )}
              </Row>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoricoPage;