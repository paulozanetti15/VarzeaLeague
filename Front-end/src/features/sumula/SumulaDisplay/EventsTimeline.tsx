import React from 'react';
import { Card } from 'react-bootstrap';
import { Goal, Card as CardType } from '../types';
import './EventsTimeline.css';

interface TimelineEvent {
  type: 'goal' | 'card';
  minute: number;
  player: string;
  team: string;
  cardType?: 'Amarelo' | 'Vermelho';
}

interface EventsTimelineProps {
  goals: Goal[];
  cards: CardType[];
}

export const EventsTimeline: React.FC<EventsTimelineProps> = ({ goals, cards }) => {
  const events: TimelineEvent[] = [
    ...goals.map(goal => ({
      type: 'goal' as const,
      minute: goal.minute,
      player: goal.player,
      team: goal.team
    })),
    ...cards.map(card => ({
      type: 'card' as const,
      minute: card.minute,
      player: card.player,
      team: card.team,
      cardType: card.type
    }))
  ].sort((a, b) => a.minute - b.minute);

  const getEventIcon = (event: TimelineEvent) => {
    if (event.type === 'goal') {
      return <i className="fas fa-futbol text-success"></i>;
    }
    return event.cardType === 'Amarelo' 
      ? <i className="fas fa-square text-warning"></i>
      : <i className="fas fa-square text-danger"></i>;
  };

  const getEventClass = (event: TimelineEvent) => {
    if (event.type === 'goal') return 'border-success';
    return event.cardType === 'Amarelo' ? 'border-warning' : 'border-danger';
  };

  return (
    <Card className="h-100">
      <Card.Header className="bg-primary text-white">
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0">
            <i className="fas fa-clock me-2"></i>
            Timeline de Eventos
          </h6>
          <span className="badge bg-light text-primary">{events.length}</span>
        </div>
      </Card.Header>
      <Card.Body className="p-3">
        {events.length > 0 ? (
          <div className="timeline">
            {events.map((event, index) => (
              <div key={index} className={`timeline-item ${getEventClass(event)}`}>
                <div className="timeline-marker">
                  {getEventIcon(event)}
                </div>
                <div className="timeline-content">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div className="fw-bold text-dark">{event.player}</div>
                      <div className="text-muted small">{event.team}</div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      {event.type === 'card' && (
                        <span className={`badge ${event.cardType === 'Amarelo' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                          {event.cardType}
                        </span>
                      )}
                      <span className="badge bg-secondary">{event.minute}'</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted py-4">
            <i className="fas fa-calendar-times fa-2x mb-2"></i>
            <p className="mb-0">Nenhum evento registrado</p>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};
