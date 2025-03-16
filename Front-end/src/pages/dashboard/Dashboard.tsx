import './Dashboard.css';

interface DashboardProps {
  onLogout: () => void;
}

export function Dashboard({ onLogout }: DashboardProps) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="dashboard">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <a className="navbar-brand" href="#">Várzea League</a>
          <div className="d-flex align-items-center">
            <span className="text-white me-3">Olá, {user.name}</span>
            <button 
              className="btn btn-outline-light" 
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                onLogout();
              }}
            >
              Sair
            </button>
          </div>
        </div>
      </nav>

      <div className="container mt-4">
        <div className="row">
          <div className="col-12">
            <h1>Bem-vindo ao Várzea League</h1>
            <p>Em breve você poderá:</p>
            <ul>
              <li>Criar e gerenciar seus times</li>
              <li>Agendar partidas</li>
              <li>Acompanhar estatísticas</li>
              <li>Organizar campeonatos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 