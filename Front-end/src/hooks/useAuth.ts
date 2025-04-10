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
         const storedToken = localStorage.getItem('token');
        console.log('Token encontrado no useEffect:', storedToken);
        checkAuthStatus(storedToken);
    }, []);

    const checkAuthStatus = async (token:any) => {
      const storedUser = localStorage.getItem('user');
      if (!token || !storedUser) {
        setIsLoggedIn(false);
        setUser(null);
        setIsLoading(false);
        return;
      }
      try {
        
        const response = await axios.get('http://localhost:3001/api/auth/verify', {
          params: {
            token: token
          },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.status === 200) {
          setIsLoggedIn(true);
          if (response.data.user) {
            localStorage.setItem("Tipo_usuário:",response.data.user.userTypeId);          
            const token = localStorage.getItem('token');
            console.log('Token encontrado no checkAuthStatus:', token);
            const user = localStorage.getItem('user');
            console.log('Usuário encontrado no checkAuthStatus:', user);  
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
    console.log('Salvando token no localStorage:', userData.token);
    localStorage.setItem('token', userData.token.toString());
    localStorage.setItem('user', JSON.stringify(userData.user));
    setUser(userData.user);
    setIsLoggedIn(true);
    checkAuthStatus(userData.token);
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
