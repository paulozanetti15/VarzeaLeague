import './Hero.css';
import gerenciamentoImg from '../../assets/gerenciamento.png';

interface HeroProps {
  onGetStarted: () => void;
  onViewMatches: () => void;
}

export function Hero({ onGetStarted, onViewMatches }: HeroProps) {
  return (
    <section className="hero-section">
      <div className="container h-100">
        <div className="row align-items-center h-100">
          <div className="col-lg-6 d-flex flex-column h-100">
            <div>
              <h1 className="hero-title">
                Organize seus jogos e campeonatos de futebol com facilidade
              </h1>
              <p className="hero-subtitle">
                Crie times, agende partidas e acompanhe estatísticas. 
                Tudo em um só lugar para você se concentrar apenas em jogar.
              </p>
            </div>
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
                Gerenciar Partidas
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