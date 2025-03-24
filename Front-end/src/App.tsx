import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import './App.css'
import { Login } from './pages/login/Login'
import { Register } from './pages/register/Register'
import { ForgotPassword } from './pages/forgot-password/ForgotPassword'
import { Landing } from './pages/landing/Landing'
import { ResetPassword } from './pages/reset-password/ResetPassword'
import CreateMatch from './pages/CreateMatch'


function App() {
 

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setIsLoggedIn(true)
    }
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
    return isLoggedIn ? <>{children}</> : <Navigate to="/login" />;
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

      <Route path="/create-match" element={
        <PrivateRoute>
          <CreateMatch />
        </PrivateRoute>
      } />
    </Routes>
  )
}

 export default App
