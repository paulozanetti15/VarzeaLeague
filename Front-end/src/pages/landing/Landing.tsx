import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  const handleCreateMatch = () => {
    if (isLoggedIn) {
      navigate('/create-match');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="landing-page">
      <Header 
        isLoggedIn={isLoggedIn}
        onLoginClick={() => navigate('/login')}
        onRegisterClick={() => navigate('/register')}
        onLogout={onLogout}
      />
      <Hero onGetStarted={handleCreateMatch} />
      <Benefits />
      <Testimonials />
      <Footer />
    </div>
  );
} 