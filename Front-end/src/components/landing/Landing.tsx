import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/landing/Header';
import { Hero } from '../../components/landing/Hero';
import { Benefits } from '../../components/landing/Benefits';
import { Testimonials } from '../../components/landing/Testimonials';
import { Footer } from '../../components/landing/Footer';
import './Landing.css';

interface User {
  id: number;
  name: string;
  email: string;
}

interface LandingProps {
  isLoggedIn: boolean;
  user: User | null;
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onLogout: () => void;
}

export function Landing({ isLoggedIn, user, onLoginClick, onRegisterClick, onLogout }: LandingProps) {
  const navigate = useNavigate();

  const handleCreateMatch = () => {
    if (isLoggedIn) {
      navigate('/matches/create');
    } else {
      navigate('/login');
    }
  };

  const handleViewMatches = () => {
    if (isLoggedIn) {
      navigate('/matches');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="landing-page no-top-space">
      <Header 
        isLoggedIn={isLoggedIn}
        user={user}
        onLoginClick={onLoginClick}
        onRegisterClick={onRegisterClick}
        onLogout={onLogout}
      />
      <Hero 
        onGetStarted={handleCreateMatch} 
        onViewMatches={handleViewMatches}
      />
      <Benefits 
        isLoggedIn={isLoggedIn} 
        onViewMatches={handleViewMatches}
      />
      <Testimonials />
      <Footer />
    </div>
  );
} 