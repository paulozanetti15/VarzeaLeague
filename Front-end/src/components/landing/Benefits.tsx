import './Benefits.css';
import { useNavigate } from 'react-router-dom';

interface BenefitsProps {
  isLoggedIn: boolean;
  onViewMatches: () => void;
}

export function Benefits({ isLoggedIn, onViewMatches }: BenefitsProps) {
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
      description: 'Acompanhe o desempenho dos jogadores e times com estatísticas detalhadas.'
    },
    {
      icon: '🏆',
      title: 'Campeonatos',
      description: 'Organize torneios e acompanhe classificação em tempo real.'
    }
  ];

  return (
    <section className="benefits-section" id="beneficios">
      <div className="container">
        <h2 className="section-title text-center">
          Por que escolher a Várzea League?
        </h2>
        <p className="section-subtitle text-center mb-5">
          Descubra como podemos ajudar você a organizar melhor seus jogos
        </p>

        <div className="row g-4">
          {benefits.map((benefit, index) => (
            <div key={index} className="col-md-6 col-lg-3">
              <div 
                className="benefit-card" 
                onClick={benefit.onClick}
                style={{ cursor: benefit.onClick ? 'pointer' : 'default' }}
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