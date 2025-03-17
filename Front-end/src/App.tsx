import { useState, useEffect } from 'react'
import './App.css'
import { Login } from './pages/login/Login'
import { Register } from './pages/register/Register'
import { ForgotPassword } from './pages/forgot-password/ForgotPassword'
import { Landing } from './pages/landing/Landing'

type Page = 'landing' | 'login' | 'register' | 'forgot-password'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // Verificar se o usuário está logado ao carregar a página
    const token = localStorage.getItem('token')
    if (token) {
      setIsLoggedIn(true)
    }
  }, [])

  const handleLoginSuccess = () => {
    setIsLoggedIn(true)
    setCurrentPage('landing')
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsLoggedIn(false)
    setCurrentPage('landing')
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return (
          <Landing 
            isLoggedIn={isLoggedIn}
            onLoginClick={() => setCurrentPage('login')}
            onRegisterClick={() => setCurrentPage('register')}
            onLogout={handleLogout}
          />
        )
      case 'login':
        return (
          <Login 
            onRegisterClick={() => setCurrentPage('register')}
            onForgotPasswordClick={() => setCurrentPage('forgot-password')}
            onLoginSuccess={handleLoginSuccess}
          />
        )
      case 'register':
        return (
          <Register 
            onLoginClick={() => setCurrentPage('login')}
          />
        )
      case 'forgot-password':
        return (
          <ForgotPassword 
            onBackToLogin={() => setCurrentPage('login')}
          />
        )
      default:
        return <Landing 
          isLoggedIn={isLoggedIn}
          onLoginClick={() => setCurrentPage('login')}
          onRegisterClick={() => setCurrentPage('register')}
          onLogout={handleLogout}
        />
    }
  }

  return renderPage()
}

export default App
