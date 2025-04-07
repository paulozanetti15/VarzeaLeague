import './Hero.css';
import gerenciamentoImg from '../../assets/gerenciamento.png';

interface HeroProps {
  onGetStarted: () => void;
  onViewMatches: () => void;
}

export function Hero({ onGetStarted, onViewMatches }: HeroProps) {
  return (
    <section className="hero-section">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6">
            <h1 className="hero-title">
              Organize seus jogos de <span>futebol</span> com facilidade
            </h1>
            <p className="hero-subtitle">
              Crie times, agende partidas e acompanhe estatísticas. 
              Tudo em um só lugar para você se concentrar apenas em jogar.
            </p>
            <div className="hero-buttons">
              <button 
                className="btn btn-primary btn-lg hero-cta me-3"
                onClick={onGetStarted}
              >
                Criar Partida
              </button>
              <button 
                className="btn btn-outline-primary btn-lg hero-cta-secondary"
                onClick={onViewMatches}
              >
                Ver Partidas
              </button>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="hero-image">
              <img src={gerenciamentoImg} alt="Gerenciamento de Times" className="img-fluid" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 