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
      navigate('/create-match');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="landing-page">
      <Header 
        isLoggedIn={isLoggedIn}
        user={user}
        onLoginClick={onLoginClick}
        onRegisterClick={onRegisterClick}
        onLogout={onLogout}
      />
      <Hero onGetStarted={handleCreateMatch} />
      <Benefits isLoggedIn={isLoggedIn} />
      <Testimonials />
      <Footer />
    </div>
  );
} 