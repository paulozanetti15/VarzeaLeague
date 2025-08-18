import './Header.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  userTypeId?: number;
}

interface HeaderProps {
  isLoggedIn: boolean;
  user: User | null;
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onLogout: () => void;
}

export function Header({ isLoggedIn, user, onLoginClick, onRegisterClick, onLogout }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("");
  const isHomePage = location.pathname === '/';

  // Handle navigation with hash when the component loads
  useEffect(() => {
    // Check if we're on the home page with a hash
    if (isHomePage && location.hash) {
      const sectionId = location.hash.substring(1); // Remove the # symbol
      const section = document.getElementById(sectionId);
      
      if (section) {
        // Add a slight delay to ensure the page is fully loaded
        setTimeout(() => {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setActiveSection(sectionId);
        }, 300);
      }
    }
  }, [isHomePage, location.hash]);

  const scrollToSection = (sectionId: string) => {
    if (isHomePage) {
      const section = document.getElementById(sectionId);
      if (section) {
        setActiveSection(sectionId);
        section.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    } else {
      navigate(`/?section=${sectionId}#${sectionId}`);
    }
  };

  useEffect(() => {
    if (!isHomePage) return; 
    
    const handleScroll = () => {
      const sections = ['beneficios', 'depoimentos', 'contato'];
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);
  
  return (
    <header className="header no-top-margin" style={{ background: '#0d47a1', boxShadow: '0 4px 20px rgba(13,71,161,0.15)' }}>
      <nav className="navbar navbar-expand-lg navbar-dark">
        <div className="container">
          <a className="navbar-brand" href="/" style={{ color: '#fff', fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'Inter, Montserrat, Arial, sans-serif', fontSize: '2rem' }}>
            Várzea League
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              {isLoggedIn && (
                <>
                  <li className="nav-item">
                    <span className="nav-link" onClick={() => navigate('/matches')}>Partidas</span>
                  </li>
                  <li className="nav-item">
                    <span className="nav-link" onClick={() => navigate('/championships')}>Campeonatos</span>
                  </li>
                  {(localStorage.getItem('Tipo_usuário:') === '1'|| localStorage.getItem('Tipo_usuário:') === '4' || localStorage.getItem('Tipo_usuário:') === '3') && (
                    <li className="nav-item">
                      <span className="nav-link" onClick={() => navigate('/teams')}>Meu time</span>
                    </li>
                  )}
                </>
              )}
              <li className="nav-item">
                <span 
                  className={`nav-link ${activeSection === "beneficios" ? "active" : ""}`}
                  onClick={() => scrollToSection("beneficios")}
                >
                  Benefícios
                </span>
              </li>
              <li className="nav-item">
                <span 
                  className={`nav-link ${activeSection === "depoimentos" ? "active" : ""}`}
                  onClick={() => scrollToSection("depoimentos")}
                >
                  Depoimentos
                </span>
              </li>
              <li className="nav-item">
                <span 
                  className={`nav-link ${location.pathname === "/dashboard" ? "active" : ""}`}
                  onClick={() => navigate('/dashboard')}
                >
                  Dashboard
                </span>
              </li>
            </ul>
            <div className="d-flex align-items-center">
              {isLoggedIn && user ? (
                <>
                  <div className="dropdown me-3">
                    <button className="btn btn-link dropdown-toggle text-white text-decoration-none" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                      {user.name}
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown" style={{ background: '#0d47a1', color: '#fff', borderRadius: 12, boxShadow: '0 4px 20px rgba(13,71,161,0.15)', padding: '0.5rem 0' }}>
                      {(localStorage.getItem('Tipo_usuário:') === '1' || localStorage.getItem('Tipo_usuário:') === '3') && (
                        <li><span className="dropdown-item" onClick={() => navigate('/teams')} style={{ color: '#fff', fontWeight: 600, fontSize: '1rem', borderRadius: 8, padding: '0.5rem 1.2rem', transition: 'all 0.3s' }}>Meu time</span></li>
                      )}
                      <li><span className="dropdown-item" onClick={() => navigate('/perfil')} style={{ color: '#fff', fontWeight: 600, fontSize: '1rem', borderRadius: 8, padding: '0.5rem 1.2rem', transition: 'all 0.3s' }}>Meu perfil</span></li>
                      {user?.userTypeId === 1 && (
                        <li><span className="dropdown-item" onClick={() => navigate('/admin/users')} style={{ color: '#fff', fontWeight: 600, fontSize: '1rem', borderRadius: 8, padding: '0.5rem 1.2rem', transition: 'all 0.3s' }}>Gerenciamento de Usuários</span></li>
                      )}
                      <li><hr className="dropdown-divider" /></li>
                      <li><span className="dropdown-item" onClick={onLogout} style={{ color: '#fff', fontWeight: 600, fontSize: '1rem', borderRadius: 8, padding: '0.5rem 1.2rem', transition: 'all 0.3s' }}>Sair</span></li>
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  <button 
                    className="btn btn-outline-light me-2" 
                    onClick={onLoginClick}
                  >
                    Entrar
                  </button>
                  <button 
                    className="btn btn-light" 
                    onClick={onRegisterClick}
                  >
                    Criar Conta
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}