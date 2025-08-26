import './Benefits.css';
import { useNavigate } from 'react-router-dom';

interface BenefitsProps {
  isLoggedIn: boolean;
  onViewMatches: () => void;
  id?: string;
}

export function Benefits({ isLoggedIn, onViewMatches, id }: BenefitsProps) {
  const navigate = useNavigate();

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
      onClick: () => handleNavigation('/matches/create')
    },
    {
      icon: '🔍',
      title: 'Encontre Jogos',
      description: 'Descubra partidas próximas e junte-se a outros jogadores na sua região.',
      onClick: onViewMatches
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
      onClick: () => handleNavigation('/championships')
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
          {benefits.map((benefit, index) => (
            <div key={index} className="col-12 col-sm-6 col-lg-4 d-flex align-items-stretch">
              <div 
                className="benefit-card w-100" 
                onClick={benefit.onClick}
                style={{ cursor: 'pointer' }}
              >
                <div className="benefit-icon">{benefit.icon}</div>
                <h3 className="benefit-title">{benefit.title}</h3>
                <p className="benefit-description">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}