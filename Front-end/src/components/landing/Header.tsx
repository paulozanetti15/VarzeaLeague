import './Header.css';
import { useNavigate, useLocation } from 'react-router-dom';

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
                  {localStorage.getItem('Tipo_usuário:') === '3' && (
                    <li className="nav-item">
                      <span className="nav-link" onClick={() => navigate('/calendario')}>Calendário</span>
                    </li>
                  )}
                  {(localStorage.getItem('Tipo_usuário:') === '1' || localStorage.getItem('Tipo_usuário:') === '2') && (
                    <>
                      <li className="nav-item">
                        <span className="nav-link" onClick={() => navigate('/matches')}>Partidas</span>
                      </li>
                      <li className="nav-item">
                        <span className="nav-link" onClick={() => navigate('/championships')}>Campeonatos</span>
                      </li>
                    </>
                  )}
                  {(localStorage.getItem('Tipo_usuário:') === '1'|| localStorage.getItem('Tipo_usuário:') === '4' || localStorage.getItem('Tipo_usuário:') === '3') && (
                    <li className="nav-item">
                      <span className="nav-link" onClick={() => navigate('/teams')}>Meu time</span>
                    </li>
                  )}
                </>
              )}
              <li className="nav-item">
                <span className="nav-link" onClick={() => navigate('/listings')}>Procurar</span>
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
                      {localStorage.getItem('Tipo_usuário:') === '3' && (
                        <>
                          <li><span className="dropdown-item" onClick={() => navigate('/calendario')} style={{ color: '#fff', fontWeight: 600, fontSize: '1rem', borderRadius: 8, padding: '0.5rem 1.2rem', transition: 'all 0.3s' }}>Calendário</span></li>
                          <li><span className="dropdown-item" onClick={() => navigate('/listings')} style={{ color: '#fff', fontWeight: 600, fontSize: '1rem', borderRadius: 8, padding: '0.5rem 1.2rem', transition: 'all 0.3s' }}>Procurar</span></li>
                        </>
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