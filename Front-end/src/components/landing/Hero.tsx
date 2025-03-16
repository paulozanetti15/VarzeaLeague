import './Hero.css';
import gerenciamentoImg from '../../assets/gerenciamento.png';

interface HeroProps {
  onGetStarted: () => void;
}

export function Hero({ onGetStarted }: HeroProps) {
  return (
    <section className="hero-section">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6">
            <h1 className="hero-title">
              Organize seus jogos de futebol com facilidade
            </h1>
            <p className="hero-subtitle">
              Crie times, agende partidas e acompanhe estatísticas. 
              Tudo em um só lugar para você se concentrar apenas em jogar.
            </p>
            <button 
              className="btn btn-primary btn-lg hero-cta"
              onClick={onGetStarted}
            >
              Comece Agora
            </button>
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