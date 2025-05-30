import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from '../../components/landing/Header';
import { Hero } from '../../components/landing/Hero';
import { Benefits } from '../../components/landing/Benefits';
import { Testimonials } from '../../components/landing/Testimonials';
import { Footer } from '../../components/landing/Footer';
import { useEffect } from 'react';
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
  const location = useLocation();

  // Handle scrolling to section based on URL parameters
  useEffect(() => {
    // Adiciona estilo ao body para garantir o tema escuro
    document.body.classList.add('dark-theme');
    
    // Check if we have a section parameter or hash
    const params = new URLSearchParams(location.search);
    const sectionParam = params.get('section');
    const hashSection = location.hash ? location.hash.substring(1) : null;
    
    const sectionId = sectionParam || hashSection;
    
    if (sectionId) {
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500); // Give the page time to fully render
    }
    
    return () => {
      document.body.classList.remove('dark-theme');
    };
  }, [location]);

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
    <div className="landing-page">
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
        id="beneficios"
      />
      <Testimonials id="depoimentos" />
      <Footer id="contato" />
    </div>
  );
} 