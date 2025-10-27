import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAttendance, postAttendance } from '../services/matchesFriendlyServices';

interface Player {
  id: number;
  name: string;
}

interface AttendanceStatus {
  userId: number;
  status: 'CONFIRMED' | 'DECLINED' | 'PENDING';
  confirmationDate?: string;
}

interface AttendanceControlProps {
  matchId: number;
  teamId: number;
}

const AttendanceControl: React.FC<AttendanceControlProps> = ({ matchId, teamId }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [attendance, setAttendance] = useState<AttendanceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [matchId, teamId]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Buscar jogadores do time
      const playersResponse = await axios.get(
        `http://localhost:3001/api/teams/${teamId}/players`,
        { headers }
      );

      // Buscar status de presença
      const attendanceResponse = await getAttendance(matchId);

      setPlayers(playersResponse.data);
      setAttendance(attendanceResponse.data);
    } catch (err) {
      setError('Erro ao carregar dados de presença');
    } finally {
      setLoading(false);
    }
  };

  const updateAttendance = async (userId: number, status: 'CONFIRMED' | 'DECLINED') => {
    try {
      await postAttendance(matchId, { userId, status });

      // Atualizar lista de presença
      fetchData();
    } catch (err) {
      setError('Erro ao atualizar presença');
    }
  };

  const getPlayerStatus = (playerId: number) => {
    const playerAttendance = attendance.find(a => a.userId === playerId);
    return playerAttendance?.status || 'PENDING';
  };

  if (loading) return <div>Carregando...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h2 className="text-xl font-bold mb-4">Controle de Presença</h2>
      
      <div className="space-y-4">
        {players.map(player => {
          const status = getPlayerStatus(player.id);
          
          return (
            <div key={player.id} className="flex items-center justify-between p-2 border-b">
              <span className="font-medium">{player.name}</span>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => updateAttendance(player.id, 'CONFIRMED')}
                  className={`px-3 py-1 rounded ${
                    status === 'CONFIRMED'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 hover:bg-green-500 hover:text-white'
                  }`}
                >
                  Confirmado
                </button>
                
                <button
                  onClick={() => updateAttendance(player.id, 'DECLINED')}
                  className={`px-3 py-1 rounded ${
                    status === 'DECLINED'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-200 hover:bg-red-500 hover:text-white'
                  }`}
                >
                  Não vai
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Confirmados: {attendance.filter(a => a.status === 'CONFIRMED').length}</span>
          <span>Ausentes: {attendance.filter(a => a.status === 'DECLINED').length}</span>
          <span>Pendentes: {attendance.filter(a => a.status === 'PENDING').length}</span>
        </div>
      </div>
    </div>
  );
};

export default AttendanceControl; 