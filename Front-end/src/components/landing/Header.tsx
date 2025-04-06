import './Header.css';
import { useNavigate } from 'react-router-dom';

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
  
  return (
    <header className="header">
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
                  <li className="nav-item">
                    <span className="nav-link" onClick={() => navigate('/matches')}>Partidas</span>
                  </li>
                  <li className="nav-item">
                    <span className="nav-link" onClick={() => navigate('/teams')}>Times</span>
                  </li>
                </>
              )}
              <li className="nav-item">
                <a className="nav-link" href="#beneficios">Benefícios</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#depoimentos">Depoimentos</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#contato">Contato</a>
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
                      <li><span className="dropdown-item" onClick={() => navigate('/matches')}>Minhas Partidas</span></li>
                      <li><span className="dropdown-item" onClick={() => navigate('/teams')}>Meus Times</span></li>
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