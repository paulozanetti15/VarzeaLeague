import React, { useEffect, useState } from 'react';
import { Container, Card, Badge, Spinner, Alert, Button, ButtonGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { 
  SportsSoccer, 
  EmojiEvents, 
  PersonAdd, 
  Flag,
  AccessTime
} from '@mui/icons-material';
import './Feed.css';

interface FeedEvent {
  id: string;
  type: 'goal' | 'card' | 'match_completed' | 'championship_started' | 'championship_ended';
  timestamp: Date;
  title: string;
  description: string;
  relatedEntity?: {
    id: number;
    type: 'match' | 'championship';
    name: string;
  };
  metadata?: any;
}

const Feed: React.FC = () => {
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const navigate = useNavigate();

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const typeParam = filter !== 'all' ? `?type=${filter}` : '';
      const response = await fetch(`http://localhost:3001/api/feed${typeParam}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Falha ao carregar feed');

      const data = await response.json();
      setEvents(data.events.map((e: any) => ({
        ...e,
        timestamp: new Date(e.timestamp)
      })));
      setError(null);
    } catch (err: any) {
      console.error('Erro ao buscar feed:', err);
      setError(err.message || 'Erro ao carregar feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [filter]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'goal':
        return <SportsSoccer className="text-success" />;
      case 'card':
        return <PersonAdd className="text-warning" />;
      case 'match_completed':
        return <Flag className="text-primary" />;
      case 'championship_started':
      case 'championship_ended':
        return <EmojiEvents className="text-warning" />;
      default:
        return <AccessTime />;
    }
  };

  const getEventColor = (type: string): string => {
    switch (type) {
      case 'goal':
        return 'success';
      case 'card':
        return 'warning';
      case 'match_completed':
        return 'primary';
      case 'championship_started':
        return 'info';
      case 'championship_ended':
        return 'secondary';
      default:
        return 'light';
    }
  };

  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `${diffMins} min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEventClick = (event: FeedEvent) => {
    if (event.relatedEntity) {
      if (event.relatedEntity.type === 'match') {
        navigate(`/matches/${event.relatedEntity.id}`);
      } else if (event.relatedEntity.type === 'championship') {
        navigate(`/championships/${event.relatedEntity.id}`);
      }
    }
  };

  return (
    <Container className="py-4 feed-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-1 fw-bold">Feed de Eventos</h1>
          <p className="text-muted mb-0">Últimos resultados e acontecimentos</p>
        </div>
        <Button variant="outline-primary" onClick={fetchFeed} disabled={loading}>
          {loading ? <Spinner size="sm" animation="border" /> : 'Atualizar'}
        </Button>
      </div>

      <ButtonGroup className="mb-4 w-100 flex-wrap">
        <Button 
          variant={filter === 'all' ? 'primary' : 'outline-primary'}
          onClick={() => setFilter('all')}
        >
          Todos
        </Button>
        <Button 
          variant={filter === 'goal' ? 'success' : 'outline-success'}
          onClick={() => setFilter('goal')}
        >
          Gols
        </Button>
        <Button 
          variant={filter === 'card' ? 'warning' : 'outline-warning'}
          onClick={() => setFilter('card')}
        >
          Cartões
        </Button>
        <Button 
          variant={filter === 'match_completed' ? 'primary' : 'outline-primary'}
          onClick={() => setFilter('match_completed')}
        >
          Partidas
        </Button>
        <Button 
          variant={filter === 'championship_started' ? 'info' : 'outline-info'}
          onClick={() => setFilter('championship_started')}
        >
          Campeonatos
        </Button>
      </ButtonGroup>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading && events.length === 0 ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="text-muted mt-3">Carregando eventos...</p>
        </div>
      ) : events.length === 0 ? (
        <Alert variant="info">
          Nenhum evento encontrado nos últimos 30 dias.
        </Alert>
      ) : (
        <div className="events-timeline">
          {events.map((event) => (
            <Card 
              key={event.id} 
              className="mb-3 event-card shadow-sm"
              onClick={() => handleEventClick(event)}
              style={{ cursor: event.relatedEntity ? 'pointer' : 'default' }}
            >
              <Card.Body className="d-flex gap-3">
                <div className="event-icon-wrapper">
                  {getEventIcon(event.type)}
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h5 className="mb-1 fw-bold">{event.title}</h5>
                      <Badge bg={getEventColor(event.type)} className="mb-2">
                        {event.type.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <small className="text-muted d-flex align-items-center gap-1">
                      <AccessTime fontSize="small" />
                      {formatTimestamp(event.timestamp)}
                    </small>
                  </div>
                  <p className="mb-2 text-secondary">{event.description}</p>
                  {event.relatedEntity && (
                    <small className="text-primary">
                      Ver {event.relatedEntity.type === 'match' ? 'partida' : 'campeonato'}: {event.relatedEntity.name}
                    </small>
                  )}
                  {event.metadata?.minute && (
                    <Badge bg="dark" className="ms-2">
                      {event.metadata.minute}'
                    </Badge>
                  )}
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
};

export default Feed;
