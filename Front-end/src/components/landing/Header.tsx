import './Header.css';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
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
  const [activeSection, setActiveSection] = useState("");

  // Função para rolagem suave
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      setActiveSection(sectionId);
      section.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Detectar seção ativa ao rolar
  useEffect(() => {
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
  }, []);
  
  return (
    <header className="header no-top-margin">
      <nav className="navbar navbar-expand-lg navbar-dark">
        <div className="container">
          <a className="navbar-brand" href="#">
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
                   { (localStorage.getItem('Tipo_usuário:') === '1' || localStorage.getItem('Tipo_usuário:') === '2') && (
                    <li className="nav-item">
                      <span className="nav-link" onClick={() => navigate('/matches')}>Partidas</span>
                    </li>
                   ) }
                  {(localStorage.getItem('Tipo_usuário:') === '1' || localStorage.getItem('Tipo_usuário:') === '3') && (
                    <li className="nav-item">
                      <span className="nav-link" onClick={() => navigate('/teams')}>Times</span>
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
                  className={`nav-link ${activeSection === "contato" ? "active" : ""}`}
                  onClick={() => scrollToSection("contato")}
                >
                  Contato
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
                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                      {(localStorage.getItem('Tipo_usuário:') === '1' || localStorage.getItem('Tipo_usuário:') === '2') && (
                        <li><span className="dropdown-item" onClick={() => navigate('/matches')}>Partidas</span></li>
                      )}
                      {(localStorage.getItem('Tipo_usuário:') === '1' || localStorage.getItem('Tipo_usuário:') === '3') && (
                        <li><span className="dropdown-item" onClick={() => navigate('/teams')}>Times</span></li>
                      )}
                      <li><span className="dropdown-item" onClick={() => navigate('/perfil')}>Meu perfil</span></li>
                      <li><hr className="dropdown-divider" /></li>
                      <li><span className="dropdown-item" onClick={onLogout}>Sair</span></li>
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