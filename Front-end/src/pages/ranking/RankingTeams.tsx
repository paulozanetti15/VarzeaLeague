import React, { useEffect, useMemo, useState } from 'react';
import { Container, Table, Form, Row, Col, Badge, Card } from 'react-bootstrap';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';

// Simple skeleton loader component
const SkeletonRow: React.FC<{ cols: number }> = ({ cols }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i}>
        <div style={{ 
          background: 'linear-gradient(90deg,#2e2e2e 25%,#3a3a3a 37%,#2e2e2e 63%)', 
          backgroundSize: '400% 100%', 
          height: 16, 
          borderRadius: 4, 
          animation: 'placeholderShimmer 1.4s ease infinite' 
        }} />
      </td>
    ))}
  </tr>
);

// Inject keyframes (quick inline style) – alternative would be a CSS file
const shimmerStyleId = 'ranking-shimmer-style';
if (typeof document !== 'undefined' && !document.getElementById(shimmerStyleId)) {
  const style = document.createElement('style');
  style.id = shimmerStyleId;
  style.innerHTML = `@keyframes placeholderShimmer { 0% { background-position: 0% 50%; } 100% { background-position: -135% 50%; } }`;
  document.head.appendChild(style);
}

interface TeamsRanking {
  nomeTime: string;
  pontuacaoTime: number;
  countVitorias: number;
  countDerrotas: number;
  countEmpates: number;
  saldogoals: number;
  goalsScore: number;
  againstgoals: number;
}


const RankingPlayers: React.FC = () => {
  const [data, setData] = useState<TeamsRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterName, setFilterName] = useState('');
  const [namechampionship, setNameChampionship] = useState('');
  const { id } = useParams<{ id: string }>();
  const token = localStorage.getItem('token');
  const fetchChampionship=async(id:string) =>{
    
    const response = await axios.get(`${API_BASE_URL}/championships/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log(response.data.name)
    setNameChampionship(response.data.name)
  } 
  const fetchRanking = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const getTeams = await axios.get(`${API_BASE_URL}/teams/1/championship-ranking`, { 
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (getTeams.status !== 200) {
        toast.error('Falha ao carregar ranking');
        return;
      }
      
      console.log(getTeams);
      
      const rankingTeams: TeamsRanking[] = getTeams.data.map((dado: TeamsRanking) => ({
        nomeTime: dado.nomeTime || '',
        pontuacaoTime: dado.pontuacaoTime || 0,
        countVitorias: dado.countVitorias || 0,
        countDerrotas: dado.countDerrotas || 0,
        countEmpates: dado.countEmpates || 0,
        goalsScore: dado.goalsScore || 0,
        againstgoals: dado.againstgoals || 0,
        saldogoals: dado.saldogoals || 0
      }));
      
      setData(rankingTeams);
    } catch (e) {
      console.error(e);
      toast.error('Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChampionship(id) 
    fetchRanking(); 
  }, []);

  const filtered = useMemo(() => {
     if (!data || data.length === 0) return [];
    
    // Se não há filtro, retorna todos os dados
    if (!filterName.trim()) {
      return data;
    }
    
    return data.filter(team => 
      team.nomeTime && team.nomeTime.toLowerCase().includes(filterName.toLowerCase())
    );
  }, [data, filterName]);

  return (
    <Container className="py-4">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-3 gap-2">
        <div>
          <h1 className="mb-1 fw-bold" style={{ letterSpacing: '.5px' }}>
            Classificação do {namechampionship}
          </h1>
          <small className="text-info">Atualizado em tempo real a cada acesso</small>
        </div>
      </div>
      
      <Row className="mb-3 g-2 align-items-end">
        <Col xs={12} md={4}>
          <Form.Label style={{color: "black"}}>Filtrar pelo time</Form.Label>
          <Form.Control 
            placeholder="Digite o nome" 
            value={filterName} 
            onChange={e => setFilterName(e.target.value)} 
          />
        </Col>
      </Row>
      
      <div className="table-responsive rounded shadow-sm border border-secondary" style={{ overflow: 'hidden' }}>
        <Table hover size="sm" variant="dark" className="mb-0 align-middle" style={{ fontSize: 14 }}>
          <thead>
            <tr>
              <th>Posição</th>
              <th>Time</th>
              <th>Pontuação</th>
              <th>Vitórias</th>
              <th>Derrotas</th>
              <th>Empates</th>
              <th>Gols Marcados</th>
              <th>Gols Sofridos</th>
              <th>Saldo de Gols</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <>
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonRow key={i} cols={9} />
                ))}
              </>
            )}
            {!loading && filtered  && filtered.map((row, idx) => {
              const pos = idx + 1;
              return (
                <tr key={`${row.nomeTime}-${idx}`}>
                  <td className="fw-bold">
                    {pos}º
                  </td>
                  <td className="fw-semibold">{row.nomeTime}</td>
                  <td>
                    <Badge bg="primary" className="px-2">
                      {row.pontuacaoTime}
                    </Badge>
                  </td>
                  <td>
                    <span className="text-success fw-semibold">{row.countVitorias}</span>
                  </td>
                  <td>
                    <span className="text-danger fw-semibold">{row.countDerrotas}</span>
                  </td>
                  <td>
                    <span className="text-warning fw-semibold">{row.countEmpates}</span>
                  </td>
                  <td>{row.goalsScore}</td>
                  <td>{row.againstgoals}</td>
                  <td>
                    <span style={{color: row.saldogoals > 0 ? "#28a745" : row.saldogoals < 0 ? "red" : "white"}}>
                      {row.saldogoals > 0 ? '+' : ''}{row.saldogoals}
                    </span>
                  </td>
                </tr>
              );
            })}
            {!loading && data.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center text-secondary py-4">
                  {data.length === 0 ? 'Não há nenhum time participando' : 'Não foi possível encontrar este nome.'}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </Container>
  );
};

export default RankingPlayers;