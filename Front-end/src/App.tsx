import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import axios from 'axios'
import './App.css'
import { Login } from './pages/login/Login'
import { Register } from './pages/register/Register'
import { ForgotPassword } from './pages/forgot-password/ForgotPassword'
import { Landing } from './pages/landing/Landing'
import { ResetPassword } from './pages/reset-password/ResetPassword'
import CreateMatch from './pages/CreateMatch'
import TeamList from './pages/teams/TeamList'
import CreateTeam from './pages/teams/CreateTeam'
import EditTeam from './pages/teams/EditTeam'
import PrivateRoute from './components/PrivateRoute'

interface User {
  id: number;
  name: string;
  email: string;
}

interface LoginProps {
  onRegisterClick?: () => void;
  onForgotPasswordClick?: () => void;
  onLoginSuccess?: (data: { user: User; token: string }) => void;
}

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!token || !storedUser) {
      setIsLoggedIn(false);
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.get('http://localhost:3001/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setIsLoggedIn(true);
      setUser(JSON.parse(storedUser));
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsLoggedIn(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = (userData: { user: User; token: string }) => {
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData.user));
    setUser(userData.user);
    setIsLoggedIn(true);
    navigate('/');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={
        <Landing 
          isLoggedIn={isLoggedIn}
          user={user}
          onLoginClick={() => navigate('/login')}
          onRegisterClick={() => navigate('/register')}
          onLogout={handleLogout}
        />
      } />
      
      <Route path="/login" element={
        isLoggedIn ? (
          <Navigate to="/" replace />
        ) : (
          <Login 
            onRegisterClick={() => navigate('/register')}
            onForgotPasswordClick={() => navigate('/forgot-password')}
            onLoginSuccess={handleLoginSuccess}
          />
        )
      } />
      
      <Route path="/register" element={
        isLoggedIn ? (
          <Navigate to="/" replace />
        ) : (
          <Register 
            onLoginClick={() => navigate('/login')}
          />
        )
      } />

      <Route path="/forgot-password" element={
        <ForgotPassword 
          onBackToLogin={() => navigate('/login')}
        />
      } />

      <Route path="reset-password/:token" element={
        <ResetPassword 
          onBackToLogin={() => navigate('/login')}
        />
      } />

      <Route path="/create-match" element={
        <PrivateRoute isLoggedIn={isLoggedIn}>
          <CreateMatch />
        </PrivateRoute>
      } />

      <Route path="/teams" element={
        <PrivateRoute isLoggedIn={isLoggedIn}>
          <TeamList />
        </PrivateRoute>
      } />

      <Route path="/teams/create" element={
        <PrivateRoute isLoggedIn={isLoggedIn}>
          <CreateTeam />
        </PrivateRoute>
      } />

      <Route path="/teams/edit/:id" element={
        <PrivateRoute isLoggedIn={isLoggedIn}>
          <EditTeam />
        </PrivateRoute>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}