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
      <Card className="shadow-sm border-0 h-100">
        <Card.Body className="text-center">
          <Card.Title className="text-muted fw-bold">{title}</Card.Title>
          <Card.Text className={`display-4 fw-bold ${textColor}`}>
            {value}
          </Card.Text>
        </Card.Body>
      </Card>
    </Col>
  );
};

export default StatCard;