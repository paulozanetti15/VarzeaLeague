import React, { useState } from "react";
import Card from 'react-bootstrap/Card';
import "./HistoricoPage.css";

const HistoricoPage = () => {
  const [activeTab, setActiveTab] = useState('amistosos');

  
  const partidasAmistosas = [
    {
      id: 1,
      adversario: "Flamengo",
      data: "2024-09-10",
      resultado: "2-1",
      status: "Vitória",
      local: "Casa"
    },
    {
      id: 2,
      adversario: "Santos",
      data: "2024-09-05",
      resultado: "1-3",
      status: "Derrota",
      local: "Fora"
    },
    {
      id: 3,
      adversario: "Palmeiras",
      data: "2024-08-28",
      resultado: "1-1",
      status: "Empate",
      local: "Casa"
    }
  ];

  const partidasCampeonatos = [
    {
      id: 1,
      adversario: "Corinthians",
      data: "2024-09-12",
      resultado: "3-0",
      status: "Vitória",
      campeonato: "Brasileirão",
      local: "Casa"
    },
    {
      id: 2,
      adversario: "Grêmio",
      data: "2024-09-08",
      resultado: "0-2",
      status: "Derrota",
      campeonato: "Brasileirão",
      local: "Fora"
    },
    {
      id: 3,
      adversario: "Internacional",
      data: "2024-09-01",
      resultado: "2-2",
      status: "Empate",
      campeonato: "Copa do Brasil",
      local: "Casa"
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Vitória': return 'bg-green-500';
      case 'Derrota': return 'bg-red-500';
      case 'Empate': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const renderPartida = (partida, showCampeonato = false) => (
    <div key={partida.id} className="bg-white rounded-lg shadow-md p-4 mb-4 border-l-4 border-blue-500">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800">{partida.adversario}</h3>
          <p className="text-sm text-gray-600">{new Date(partida.data).toLocaleDateString('pt-BR')}</p>
          {showCampeonato && (
            <p className="text-sm text-blue-600 font-medium">{partida.campeonato}</p>
          )}
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-800 mb-1">
            {partida.resultado}
          </div>
          <span className={`inline-block px-3 py-1 rounded-full text-white text-sm font-medium ${getStatusColor(partida.status)}`}>
            {partida.status}
          </span>
        </div>
      </div>
      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>{partida.local === 'Casa' ? '🏠 Casa' : '✈️ Fora'}</span>
      </div>
    </div>
  );

  const stats = {
    amistosos: {
      total: partidasAmistosas.length,
      vitorias: partidasAmistosas.filter(p => p.status === 'Vitória').length,
      derrotas: partidasAmistosas.filter(p => p.status === 'Derrota').length,
      empates: partidasAmistosas.filter(p => p.status === 'Empate').length
    },
    campeonatos: {
      total: partidasCampeonatos.length,
      vitorias: partidasCampeonatos.filter(p => p.status === 'Vitória').length,
      derrotas: partidasCampeonatos.filter(p => p.status === 'Derrota').length,
      empates: partidasCampeonatos.filter(p => p.status === 'Empate').length
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
     
    <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-black mb-8 text-center mt-2">
          Histórico do Time
        </h1>
        <div className="d-flex">
          <Card style={{ width: '18rem' }}>
              <Card.Body>
                  <Card.Title>Vitorias</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted"></Card.Subtitle>
                  <Card.Text>
                  {stats.amistosos.vitorias + stats.campeonatos.vitorias}
                  </Card.Text>
              </Card.Body>
          </Card>
          <Card style={{ width: '18rem' }}>
              <Card.Body>
                  <Card.Title>Derrota</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted"></Card.Subtitle>
                  <Card.Text>
                      {stats.amistosos.derrotas + stats.campeonatos.derrotas}    
                  </Card.Text>
              </Card.Body>
          </Card>
          <Card style={{ width: '18rem' }}>
              <Card.Body>
                  <Card.Title>Empates</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted"></Card.Subtitle>
                  <Card.Text>
                      {stats.amistosos.empates + stats.campeonatos.empates}       
                  </Card.Text>
              </Card.Body>
          </Card>
          <Card style={{ width: '18rem' }}>
              <Card.Body>
                  <Card.Title>Total</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted"></Card.Subtitle>
                  <Card.Text>
                      {stats.amistosos.total + stats.campeonatos.total}          
                  </Card.Text>
              </Card.Body>
          </Card>
        </div>

        <div className="p-6">
          {activeTab === 'amistosos' && (
           
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl text-center font-semibold text-black mt-5">
                Partidas Amistosas
              </h2>
              <Card style={{ width: '18rem' }}>
                <Card.Body>
                    <Card.Title>Vitorias</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted"></Card.Subtitle>
                    <Card.Text>
                    {stats.amistosos.vitorias + stats.campeonatos.vitorias}
                    </Card.Text>
                </Card.Body>
                </Card>
                <Card style={{ width: '18rem' }}>
                  <Card.Body>
                      <Card.Title>Derrota</Card.Title>
                      <Card.Subtitle className="mb-2 text-muted"></Card.Subtitle>
                      <Card.Text>
                          {stats.amistosos.derrotas + stats.campeonatos.derrotas}    
                      </Card.Text>
                  </Card.Body>
                </Card>
                <Card style={{ width: '18rem' }}>
                  <Card.Body>
                    <Card.Title>Empates</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted"></Card.Subtitle>
                    <Card.Text>
                        {stats.amistosos.empates + stats.campeonatos.empates}       
                    </Card.Text>
                  </Card.Body>
                </Card>
                <Card style={{ width: '18rem' }}>
                  <Card.Body>
                    <Card.Title>Total</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted"></Card.Subtitle>
                    <Card.Text>
                        {stats.amistosos.total + stats.campeonatos.total}          
                    </Card.Text>
                  </Card.Body>
                </Card>
                
              
              {partidasAmistosas.length > 0 ? (
                  <div>
                    {partidasAmistosas.map((partida, index) => (
                      <div key={index}>{renderPartida(partida)}</div>
                    ))}
                  </div>
                ) : (
                  <div>
                    <p className="text-center py-8 text-gray-500">
                      Nenhuma partida amistosa registrada
                    </p>
                  </div>  
                )
              }
            </div>
            )}

               
          {activeTab === 'campeonatos' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl text-center font-semibold text-gray-800 ">
                  Partidas de Campeonato
                </h2>
                <div className="flex space-x-4 text-sm">
                  <span className="text-green-600">V: {stats.campeonatos.vitorias}</span>
                  <span className="text-red-600">D: {stats.campeonatos.derrotas}</span>
                  <span className="text-yellow-600">E: {stats.campeonatos.empates}</span>
                </div>
              </div>
              {partidasCampeonatos.length > 0 ? (
                <div>
                  {partidasCampeonatos.map(partida => renderPartida(partida, true))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma partida de campeonato registrada
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}  
export default HistoricoPage;