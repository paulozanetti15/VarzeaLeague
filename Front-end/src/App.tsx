import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import './App.css'
import { Login } from './pages/login/Login'
import { Register } from './pages/register/Register'
import { ForgotPassword } from './pages/forgot-password/ForgotPassword'
import { Landing } from './pages/landing/Landing'
import { ResetPassword } from './pages/reset-password/ResetPassword'
import CreateMatch from './pages/CreateMatch'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import ptBR from 'date-fns/locale/pt-BR'

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const navigate = useNavigate();

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token')
    if (token) {
      // Verifica se o token é válido fazendo uma requisição para o backend
      fetch('http://localhost:3001/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => {
        if (response.ok) {
          setIsLoggedIn(true)
        } else {
          handleLogout()
        }
      })
      .catch(() => {
        handleLogout()
      })
    } else {
      setIsLoggedIn(false)
    }
  }

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const handleLoginSuccess = () => {
    setIsLoggedIn(true)
    navigate('/')
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsLoggedIn(false)
    navigate('/')
  }

  // Componente para proteger rotas
  const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    const token = localStorage.getItem('token')
    if (!token) {
      return <Navigate to="/login" />
    }
    return <>{children}</>
  };

  return (
    <Routes>
      <Route path="/" element={
        <Landing 
          isLoggedIn={isLoggedIn}
          onLoginClick={() => navigate('/login')}
          onRegisterClick={() => navigate('/register')}
          onLogout={handleLogout}
        />
      } />
      
      <Route path="/login" element={
        isLoggedIn ? (
          <Navigate to="/" />
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
          <Navigate to="/" />
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

      <Route path="/reset-password/:token" element={
        <ResetPassword 
          onBackToLogin={() => navigate('/login')}
        />
      } />

      <Route path="/create-match" element={
        <PrivateRoute>
          <CreateMatch />
        </PrivateRoute>
      } />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        <AppContent />
      </LocalizationProvider>
    </BrowserRouter>
  )
}

export default App
