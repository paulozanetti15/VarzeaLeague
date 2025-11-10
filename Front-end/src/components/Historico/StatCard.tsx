import React from 'react';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';

interface StatCardProps {
  title: string;
  value: string | number;
  textColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, textColor = 'text-dark' }) => {
  return (
    <Col xs={12} sm={6} md={4} lg={3}>
      <Card className="h-100 border-0 stat-card">
        <Card.Body className="d-flex flex-column justify-content-center align-items-center text-center">
          <div className="stat-card-title text-muted fw-semibold">{title}</div>
          <div className={`stat-card-value fw-bold ${textColor}`}>{value}</div>
        </Card.Body>
      </Card>
    </Col>
  );
};

export default StatCard;