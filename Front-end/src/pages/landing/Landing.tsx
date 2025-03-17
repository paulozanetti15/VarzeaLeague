import { Header } from '../../components/landing/Header';
import { Hero } from '../../components/landing/Hero';
import { Benefits } from '../../components/landing/Benefits';
import { Testimonials } from '../../components/landing/Testimonials';
import { Footer } from '../../components/landing/Footer';
import './Landing.css';

interface LandingProps {
  isLoggedIn: boolean;
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onLogout: () => void;
}

export function Landing({ isLoggedIn, onLoginClick, onRegisterClick, onLogout }: LandingProps) {
  return (
    <div className="landing-page">
      <Header 
        isLoggedIn={isLoggedIn}
        onLoginClick={onLoginClick}
        onRegisterClick={onRegisterClick}
        onLogout={onLogout}
      />
      <Hero onGetStarted={isLoggedIn ? () => {} : onRegisterClick} />
      <Benefits />
      <Testimonials />
      <Footer />
    </div>
  );
} 