import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface UseSessionTimeoutProps {
  timeout?: number; // em milissegundos
  onTimeout?: () => void;
  warningTime?: number; // tempo para mostrar aviso antes de expirar
  onWarning?: () => void;
}

export const useSessionTimeout = ({
  timeout = 30 * 60 * 1000, // 30 minutos
  onTimeout,
  warningTime = 5 * 60 * 1000, // 5 minutos antes de expirar
  onWarning
}: UseSessionTimeoutProps = {}) => {
  const navigate = useNavigate();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningRef = useRef<NodeJS.Timeout>();
  const lastActivityRef = useRef<number>(Date.now());

  const handleTimeout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    if (onTimeout) {
      onTimeout();
    } else {
      navigate('/login', { 
        state: { message: 'Sua sessão expirou devido à inatividade. Faça login novamente.' }
      });
    }
  }, [navigate, onTimeout]);

  const handleWarning = useCallback(() => {
    if (onWarning) {
      onWarning();
    }
  }, [onWarning]);

  const resetTimeout = useCallback(() => {
    lastActivityRef.current = Date.now();

    // Limpar timeouts existentes
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
    }

    // Configurar novo timeout
    timeoutRef.current = setTimeout(handleTimeout, timeout);
    
    // Configurar aviso
    warningRef.current = setTimeout(handleWarning, timeout - warningTime);
  }, [timeout, warningTime, handleTimeout, handleWarning]);

  const updateActivity = useCallback(() => {
    const token = localStorage.getItem('token');
    if (token) {
      resetTimeout();
    }
  }, [resetTimeout]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Eventos que indicam atividade do usuário
    const events = [
      'mousedown',
      'mousemove', 
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    // Throttle para evitar muitas chamadas
    let throttleTimer: NodeJS.Timeout | null = null;
    const throttledUpdate = () => {
      if (throttleTimer) return;
      
      throttleTimer = setTimeout(() => {
        updateActivity();
        throttleTimer = null;
      }, 1000); // Atualizar no máximo a cada segundo
    };

    // Adicionar listeners
    events.forEach(event => {
      document.addEventListener(event, throttledUpdate, true);
    });

    // Iniciar timeout
    resetTimeout();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, throttledUpdate, true);
      });
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningRef.current) {
        clearTimeout(warningRef.current);
      }
      if (throttleTimer) {
        clearTimeout(throttleTimer);
      }
    };
  }, [resetTimeout, updateActivity]);

  return {
    resetTimeout,
    updateActivity,
    getLastActivity: () => lastActivityRef.current
  };
};