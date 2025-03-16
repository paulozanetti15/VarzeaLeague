import './Header.css';

interface HeaderProps {
  isLoggedIn: boolean;
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onLogout: () => void;
}

export function Header({ isLoggedIn, onLoginClick, onRegisterClick, onLogout }: HeaderProps) {
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
              {isLoggedIn ? (
                <>
                  <span className="text-light me-3">
                    {JSON.parse(localStorage.getItem('user') || '{}').name}
                  </span>
                  <button 
                    className="btn btn-outline-light" 
                    onClick={onLogout}
                  >
                    Sair
                  </button>
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