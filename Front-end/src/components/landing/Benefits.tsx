import './Benefits.css';
import { useNavigate } from 'react-router-dom';

interface BenefitsProps {
  isLoggedIn: boolean;
  id?: string;
}

export function Benefits({ isLoggedIn, id }: BenefitsProps) {
  const navigate = useNavigate();
  const storedUser = localStorage.getItem('user');
  let userTypeId: number = 0;
  try {
    if (storedUser) {
      userTypeId = Number(JSON.parse(storedUser).userTypeId) || 0;
    }
  } catch {}
  const canCreateChampionship = userTypeId === 2; // tier 2

  const handleNavigation = (path: string) => {
    if (isLoggedIn) {
      navigate(path);
    } else {
      navigate('/login');
    }
  };

  const benefits = [
    {
      icon: '⚽',
      title: 'Organize Partidas',
      description: 'Crie e gerencie jogos facilmente, definindo local, data e participantes.',
      // Only allow navigation for tier 2 (userTypeId === 2); keep styling unchanged for others
      onClick: () => {
        if (userTypeId === 2) {
          handleNavigation('/matches/create');
        }
      }
    },
    {
      icon: '🔍',
      title: 'Encontre Jogos',
      description: 'Descubra partidas próximas e junte-se a outros jogadores na sua região.',
      onClick: () => {
        if (isLoggedIn) {
          window.location.href = '/listings';
        } else {
          navigate('/login');
        }
      }
    },
    {
      icon: '👥',
      title: 'Gerencie Times',
      description: 'Monte seus times, controle presença e mantenha todos informados.',
      onClick: () => handleNavigation('/teams')
    },
    {
      icon: '📊',
      title: 'Estatísticas',
      description: 'Acompanhe o desempenho dos jogadores e times com estatísticas detalhadas.',
      onClick: () => handleNavigation('/dashboard')
    },
    {
      icon: '🏆',
      title: 'Campeonatos',
      description: 'Organize torneios e acompanhe classificação em tempo real.',
  onClick: undefined
    }
  ];

  return (
    <section className="benefits-section" id={id || "beneficios"}>
      <div className="section-separator">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0,60 C360,0 1080,120 1440,60 L1440,0 L0,0 Z" fill="#e3f2fd"/>
        </svg>
      </div>
      <div className="container">
        <h2 className="section-title text-center">
          Por que escolher o Várzea League?
        </h2>
        <p className="section-subtitle text-center mb-5">
          Descubra como podemos ajudar você a organizar melhor seus jogos
        </p>

        <div className="row g-4 justify-content-center">
          {benefits.map((benefit, index) => {
            const isChampionshipCard = benefit.title === 'Campeonatos';
            return (
              <div key={index} className="col-12 col-sm-6 col-lg-4 d-flex align-items-stretch">
                <div
                  className="benefit-card w-100"
                  onClick={!isChampionshipCard ? benefit.onClick : undefined}
                  style={{ cursor: !isChampionshipCard && benefit.onClick ? 'pointer' : 'default' }}
                >
                  <div className="benefit-icon">{benefit.icon}</div>
                  <h3 className="benefit-title">{benefit.title}</h3>
                  <p className="benefit-description">{benefit.description}</p>
                  {isChampionshipCard && (
                    <div className="benefit-actions" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
                      <button
                        onClick={() => handleNavigation('/listings')}
                        className="benefit-btn"
                        style={{
                          background: '#1976d2',
                          color: '#fff',
                          border: 'none',
                          padding: '10px 14px',
                          borderRadius: '6px',
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          cursor: 'pointer'
                        }}
                      >
                        Procurar campeonatos
                      </button>
                      {canCreateChampionship ? (
                        <button
                          onClick={() => handleNavigation('/championships')}
                          className="benefit-btn"
                          style={{
                            background: '#0d47a1',
                            color: '#fff',
                            border: 'none',
                            padding: '10px 14px',
                            borderRadius: '6px',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            cursor: 'pointer'
                          }}
                        >
                          Criar campeonato
                        </button>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                          <button
                            disabled
                            style={{
                              background: 'rgba(0,0,0,0.12)',
                              color: '#555',
                              border: 'none',
                              padding: '10px 14px',
                              borderRadius: '6px',
                              fontWeight: 500,
                              fontSize: '0.85rem',
                              cursor: 'not-allowed',
                              width: '100%'
                            }}
                          >
                            Criar campeonato (restrito)
                          </button>
                          <small style={{
                            fontSize: '0.65rem',
                            color: '#d32f2f',
                            fontWeight: 600,
                            textAlign: 'center',
                            lineHeight: 1.2
                          }}>
                            Você não possui permissão. Necessário ser organizador de campeonatos.
                          </small>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}