import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import './ChampionshipList.css';
import { api } from '../../../services/api';
import trophy from "../../../assets/championship-trophy.svg";

interface Championship {
  id: number;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  created_by: number;
}

export default function ChampionshipList() {
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [canCreateChampionship, setCanCreateChampionship] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar permissões do usuário
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userType = Number(user.userTypeId); // Alterado de userType para userTypeId
    const isAdmin = userType === 1;
    const isOrganizer = userType === 2;
    setCanCreateChampionship(isAdmin || isOrganizer);
    setCurrentUserId(Number(user.id));

    async function fetchChampionships() {
      try {
        const data = await api.championships.list();
        setChampionships(data);
      } catch (err) {
        setError('Erro ao carregar campeonatos');
      } finally {
        setLoading(false);
      }
    }
    fetchChampionships();
  }, []);

  return (
    <div className="match-list-container">
      <div className="content-container">
        <div className="header-container championship-header-visual">
          <img src={trophy} alt="Troféu Campeonato" className="championship-trophy-main" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <h1 className="page-title" style={{ color: '#212121', textShadow: 'none' }}>Campeonatos</h1>
          {canCreateChampionship && (
            <button
              className="create-match-btn"
              onClick={() => navigate('/championships/create')}
            >
              <img src={trophy} alt="Novo Campeonato" className="championship-trophy-btn" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              Novo Campeonato
            </button>
          )}
        </div>
        {loading ? (
          <div className="loading">Carregando campeonatos...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : championships.length === 0 ? (
          <div className="no-matches-message">
            <img src={trophy} alt="Nenhum Campeonato" className="championship-trophy-empty" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <h3>Nenhum campeonato cadastrado</h3>
            <p>Cadastre um novo campeonato para começar.</p>
          </div>
        ) : (
          <div className="matches-grid">
            {championships.map((champ) => (
              <div key={champ.id} className="match-card" onClick={() => navigate(`/championships/${champ.id}`)}>
                <div className="match-card-inner">
                  <div className="match-card-gradient"></div>
                  <div className="match-header">
                    <h2 className="match-title">{champ.name}</h2>
                  </div>
                  <div className="match-info">
                    {champ.start_date && (
                      <div className="info-row">
                        <span><strong>Início:</strong> {new Date(champ.start_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    {champ.end_date && (
                      <div className="info-row">
                        <span><strong>Fim:</strong> {new Date(champ.end_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="info-row">
                      <span><strong>Organizador:</strong> {champ.created_by}</span>
                    </div>
                  </div>
                  {champ.description && (
                    <div className="match-description">
                      <h3>Descrição</h3>
                      <p>{champ.description}</p>
                    </div>
                  )}
                  {currentUserId === champ.created_by && (
                    <div className="organizer-badge" style={{ marginTop: 'auto' }}>
                      Você é o organizador
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
