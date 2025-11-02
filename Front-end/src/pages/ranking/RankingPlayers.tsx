import React, { useEffect, useMemo, useState } from 'react';
import { Container, Table, Form, Row, Col, Badge, Card } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { getPlayerRanking } from '../../services/rankingServices';

// Simple skeleton loader component
const SkeletonRow: React.FC<{ cols: number }> = ({ cols }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i}>
        <div style={{ background: 'linear-gradient(90deg,#2e2e2e 25%,#3a3a3a 37%,#2e2e2e 63%)', backgroundSize: '400% 100%', height: 16, borderRadius: 4, animation: 'placeholderShimmer 1.4s ease infinite' }} />
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

interface PlayerRankRow {
  type: 'user' | 'player';
  userId: number | null;
  playerId: number | null;
  nome: string;
  time?: string | null;
  gols: number;
  amarelos: number;
  vermelhos: number;
  mediaRating: number;
  avaliacoes: number;
  score: number;
}

const RankingPlayers: React.FC = () => {
  const [data, setData] = useState<PlayerRankRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterName, setFilterName] = useState('');
  const [order, setOrder] = useState<'score' | 'gols' | 'mediaRating'>('score');
  const [desc, setDesc] = useState(true);

  const fetchRanking = async () => {
    try {
      setLoading(true);
      const json = await getPlayerRanking();
      const ranking = (json.ranking || []).map((r: any) => ({
        type: r.type || (r.playerId ? 'player' : 'user'),
        userId: typeof r.userId === 'number' ? r.userId : (r.userId === null ? null : (r.userId ? Number(r.userId) : null)),
        playerId: typeof r.playerId === 'number' ? r.playerId : (r.playerId ? Number(r.playerId) : null),
        nome: r.nome,
        time: r.time,
        gols: r.gols || 0,
        amarelos: r.amarelos || 0,
        vermelhos: r.vermelhos || 0,
        mediaRating: r.mediaRating || 0,
        avaliacoes: r.avaliacoes || 0,
        score: r.score || 0
      }));
      setData(ranking);
    } catch (e) {
      console.error(e);
      toast.error('Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRanking(); }, []);

  const filtered = useMemo(() => {
    const arr = data.filter(r => r.nome.toLowerCase().includes(filterName.toLowerCase()));
    arr.sort((a,b) => {
      let diff = 0;
      if (order === 'score') diff = a.score - b.score;
      else if (order === 'gols') diff = a.gols - b.gols;
      else if (order === 'mediaRating') diff = a.mediaRating - b.mediaRating;
      return desc ? -diff : diff;
    });
    return arr;
  }, [data, filterName, order, desc]);


  const totalPlayers = data.length;
  const avgScore = totalPlayers ? data.reduce((s,r)=>s+r.score,0) / totalPlayers : 0;
  const avgRating = totalPlayers ? data.reduce((s,r)=>s+r.mediaRating,0) / totalPlayers : 0;

  const toggleOrderDirection = () => setDesc(d => !d);

  return (
    <Container className="py-4">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-3 gap-2">
        <div>
          <h1 className="mb-1 fw-bold" style={{ letterSpacing: '.5px' }}>Ranking de Jogadores</h1>
          <small className="text-info">Atualizado em tempo real a cada acesso</small>
        </div>
        <div className="d-flex gap-2">
          <Form.Select value={order} onChange={e=>setOrder(e.target.value as any)} style={{ maxWidth: 180 }}>
            <option value="score">Score</option>
            <option value="gols">Gols</option>
            <option value="mediaRating">Média</option>
          </Form.Select>
          <Form.Select value={desc ? 'desc':'asc'} onChange={toggleOrderDirection} style={{ maxWidth: 140 }}>
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </Form.Select>
        </div>
      </div>
      <Row className="g-3 mb-4">
        <Col xs={12} md={4}>
          <Card bg="dark" text="light" className="h-100 shadow-sm border-secondary">
            <Card.Body>
              <Card.Title className="text-warning mb-1" style={{ fontSize: 14 }}>TOTAL JOGADORES</Card.Title>
              <h2 className="fw-bold mb-0">{totalPlayers}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={4}>
          <Card bg="dark" text="light" className="h-100 shadow-sm border-secondary">
            <Card.Body>
              <Card.Title className="text-warning mb-1" style={{ fontSize: 14 }}>MÉDIA SCORE GLOBAL</Card.Title>
              <h2 className="fw-bold mb-0">{avgScore.toFixed(2)}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={4}>
          <Card bg="dark" text="light" className="h-100 shadow-sm border-secondary">
            <Card.Body>
              <Card.Title className="text-warning mb-1" style={{ fontSize: 14 }}>MÉDIA AVALIAÇÃO GLOBAL</Card.Title>
              <h2 className="fw-bold mb-0">{avgRating.toFixed(2)}</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="mb-3 g-2 align-items-end">
        <Col xs={12} md={4}>
          <Form.Label>Filtrar por nome</Form.Label>
          <Form.Control placeholder="Digite o nome" value={filterName} onChange={e=>setFilterName(e.target.value)} />
        </Col>
        <Col xs={12} md={8} className="text-md-end d-flex flex-column align-items-start align-items-md-end">
          <small className="text-secondary">Fórmula Score = gols*4 - amarelos - vermelhos*3 + média*2</small>
          <small className="text-secondary">Clique nas colunas para ordenar rapidamente</small>
        </Col>
      </Row>
      <div className="table-responsive rounded shadow-sm border border-secondary" style={{ overflow: 'hidden' }}>
        <Table hover size="sm" variant="dark" className="mb-0 align-middle" style={{ fontSize: 14 }}>
          <thead>
            <tr>
              <th style={{ width: 50 }}>#</th>
              <th>Nome</th>
              <th>Time</th>
              <th style={{ cursor:'pointer' }} onClick={()=>setOrder('gols')}>Gols</th>
              <th>A</th>
              <th>V</th>
              <th style={{ cursor:'pointer' }} onClick={()=>setOrder('mediaRating')}>Média</th>
              <th>Avaliações</th>
              <th style={{ cursor:'pointer' }} onClick={()=>setOrder('score')}>Score</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <>
                {Array.from({length:6}).map((_,i)=>(<SkeletonRow key={i} cols={9} />))}
              </>
            )}
            {!loading && filtered.map((row, idx) => {
              const pos = idx + 1;
              const highlight = pos === 1 ? 'rgba(255,215,0,0.18)' : pos === 2 ? 'rgba(192,192,192,0.18)' : pos === 3 ? 'rgba(205,127,50,0.18)' : 'transparent';
              return (
                <tr key={(row.type==='player' ? 'p-' + row.playerId : 'u-' + row.userId)} style={{ background: highlight }}>
                  <td className="fw-bold">
                    {pos === 1 && '🥇'}
                    {pos === 2 && '🥈'}
                    {pos === 3 && '🥉'}
                    {pos > 3 && pos}
                  </td>
                  <td>{row.nome} {row.type==='player' && <small className="text-info ms-1">(Player)</small>}</td>
                  <td>{row.time || <span className="text-muted">-</span>}</td>
                  <td><Badge bg="success">{row.gols}</Badge></td>
                  <td><Badge bg="warning" text="dark">{row.amarelos}</Badge></td>
                  <td><Badge bg="danger">{row.vermelhos}</Badge></td>
                  <td>{row.mediaRating.toFixed(2)}</td>
                  <td>{row.avaliacoes}</td>
                  <td><strong>{row.score.toFixed(2)}</strong></td>
                </tr>
              );
            })}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center text-secondary py-4">
                  Nenhum jogador encontrado
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
