import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  modalidade?: string;
  nomequadra?: string;
  tipo?: string;
  fase_grupos?: boolean;
  max_teams?: number;
  num_grupos?: number;
  times_por_grupo?: number;
  status?: string;
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
        const uid = Number(user.id);
        if (uid) {
          const onlyMine = (data || []).filter((c: Championship) => c.created_by === uid);
          setChampionships(onlyMine);
        } else {
          setChampionships([]);
        }
      } catch (err) {
        setError('Erro ao carregar campeonatos');
      } finally {
        setLoading(false);
      }
    }
    fetchChampionships();
  }, []);

  return (
    <div className="championship-list-container">
      <div className="content-container">
        {/* Header com título e botão à direita */}
        <div className="championship-header">
          <div className="header-content">
            <div className="title-section">
              <img src={trophy} alt="Troféu Campeonato" className="championship-trophy-icon" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <h1 className="page-title">Meus Campeonatos</h1>
            </div>
            {canCreateChampionship && (
              <button
                className="create-championship-btn"
                onClick={() => navigate('/championships/create')}
              >
                <img src={trophy} alt="Novo Campeonato" className="btn-icon" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                Novo Campeonato
              </button>
            )}
          </div>
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
          <div className="championships-grid">
            {championships.map((champ) => (
              <div key={champ.id} className="championship-card" onClick={() => navigate(`/championships/${champ.id}`)}>
                <div className="championship-card-content">
                  <div className="championship-header">
                    <h2 className="championship-title">{champ.name}</h2>
                    {currentUserId === champ.created_by && (
                      <div className="organizer-badge">
                        <span className="badge-text">Organizador</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="championship-info">
                    {champ.modalidade && (
                      <div className="info-item">
                        <span className="info-label">Modalidade</span>
                        <span className="info-value">{champ.modalidade}</span>
                      </div>
                    )}
                    {champ.nomequadra && (
                      <div className="info-item">
                        <span className="info-label">Quadra</span>
                        <span className="info-value">{champ.nomequadra}</span>
                      </div>
                    )}
                    {champ.start_date && (
                      <div className="info-item">
                        <span className="info-label">Início</span>
                        <span className="info-value">{new Date(champ.start_date).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                    {champ.end_date && (
                      <div className="info-item">
                        <span className="info-label">Fim</span>
                        <span className="info-value">{new Date(champ.end_date).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                    {champ.tipo && (
                      <div className="info-item">
                        <span className="info-label">Tipo</span>
                        <span className={`championship-type ${champ.tipo.toLowerCase().replace(' ', '-')}`}>
                          {champ.tipo === 'Mata-Mata' ? '🏆 Mata-Mata' : '⚽ Liga'}
                        </span>
                      </div>
                    )}
                    {champ.status && (
                      <div className="info-item">
                        <span className="info-label">Status</span>
                        <span className={`championship-status ${champ.status.toLowerCase().replace(' ', '-')}`}>
                          {champ.status === 'open' ? '🟢 Aberto' : 
                           champ.status === 'closed' ? '🔴 Fechado' : 
                           champ.status === 'in-progress' ? '🟡 Em Andamento' : champ.status}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {champ.description && (
                    <div className="championship-description">
                      <h4 className="description-title">Descrição</h4>
                      <p className="description-text">{champ.description}</p>
                    </div>
                  )}
                  
                  {/* Alerta de sobra de times */}
                  {(() => {
                    // Verificar se é mata-mata com fase de grupos
                    if (champ.tipo?.toLowerCase() === 'mata-mata' && 
                        champ.fase_grupos && 
                        champ.num_grupos && 
                        champ.times_por_grupo && 
                        champ.max_teams) {
                      
                      const totalTimes = champ.num_grupos * champ.times_por_grupo;
                      const sobraTimes = champ.max_teams - totalTimes;
                      
                      if (sobraTimes > 0) {
                        return (
                          <div className="championship-alert-card">
                            <div className="championship-alert-icon">🏆</div>
                            <div className="championship-alert-content">
                              <div className="championship-alert-title">Vagas Disponíveis</div>
                              <div className="championship-alert-description">
                                Com {champ.max_teams} vagas disponíveis e {totalTimes} times nos grupos, 
                                restam <strong>{sobraTimes} vaga{sobraTimes > 1 ? 's' : ''}</strong> para times adicionais.
                              </div>
                            </div>
                          </div>
                        );
                      }
                    }
                    return null;
                  })()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
