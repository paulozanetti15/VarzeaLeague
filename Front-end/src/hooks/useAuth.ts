import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface User {
    id: number;
    name: string;
    email: string;
    userTypeId: number; // ID do tipo de usuário (role)
}
  
interface LoginProps {
    onRegisterClick?: () => void;
    onForgotPasswordClick?: () => void;
    onLoginSuccess?: (data: { user: User; token: string }) => void;
}

export function useAuth() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null); // Inicializa como null
    const [userType, setUserType] = useState<number | null>(null); // Inicializa como null
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

      if (response.status === 200) {
        setIsLoggedIn(true);
        if (response.data.user) {
          localStorage.setItem("Tipo_usuário:",response.data.user.userTypeId);
        }
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        } catch (parseError) {
          console.error('Erro ao analisar dados do usuário:', parseError);
          localStorage.removeItem('user');
          setIsLoggedIn(false);
          setUser(null);
        }
      } else {
        throw new Error('Resposta não foi 200');
      }
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
  const login = (userData: { user: User; token: string }) => {
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData.user));
    setUser(userData.user);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
  };
    // Define your auth object properties or methods here
    return { isLoggedIn, isLoading, user, login, logout };
};
