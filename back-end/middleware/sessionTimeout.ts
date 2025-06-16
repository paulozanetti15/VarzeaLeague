import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Estender a interface Request para incluir user
export interface AuthRequest extends Request {
  user?: any;
}

interface SessionData {
  lastActivity: number;
  userId: number;
}

// Armazenar dados de sessão em memória (em produção, use Redis)
const activeSessions: Map<string, SessionData> = new Map();

// Tempo limite de inatividade em milissegundos (30 minutos)
const INACTIVITY_TIMEOUT = 30 * 60 * 1000;

export const sessionTimeoutMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.decode(token) as any;
    
    if (!decoded || !decoded.id) {
      return next();
    }

    const sessionKey = `${decoded.id}-${token.slice(-10)}`;
    const now = Date.now();
    const session = activeSessions.get(sessionKey);

    if (session) {
      // Verificar se a sessão expirou por inatividade
      if (now - session.lastActivity > INACTIVITY_TIMEOUT) {
        activeSessions.delete(sessionKey);
        res.status(401).json({ 
          error: 'Sessão expirada por inatividade',
          code: 'SESSION_TIMEOUT'
        });
        return;
      }
      
      // Atualizar última atividade
      session.lastActivity = now;
    } else {
      // Criar nova sessão
      activeSessions.set(sessionKey, {
        lastActivity: now,
        userId: decoded.id
      });
    }

    next();
  } catch (error) {
    console.error('Erro no middleware de timeout de sessão:', error);
    next();
  }
};

// Função para limpar sessões expiradas
export const cleanupExpiredSessions = (): void => {
  const now = Date.now();
  
  for (const [sessionKey, session] of activeSessions.entries()) {
    if (now - session.lastActivity > INACTIVITY_TIMEOUT) {
      activeSessions.delete(sessionKey);
      console.log(`Sessão ${sessionKey} removida por inatividade`);
    }
  }
};

// Limpar sessões expiradas a cada 10 minutos
setInterval(cleanupExpiredSessions, 10 * 60 * 1000);

// Função para invalidar sessão manualmente (logout)
export const invalidateSession = (token: string, userId: number): void => {
  const sessionKey = `${userId}-${token.slice(-10)}`;
  activeSessions.delete(sessionKey);
};