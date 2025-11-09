import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    [key: string]: any;
  };
  userId?: number;
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    console.log(`Middleware de autenticação: Rota acessada: ${req.method} ${req.originalUrl}`);
    console.log(`Middleware de autenticação: Cabeçalho recebido: ${authHeader ? 'Sim' : 'Não'}`);
    
    if (!authHeader) {
      console.log('Middleware de autenticação: Token não fornecido');
      res.status(401).json({ error: 'Token não fornecido' });
      return;
    }

    // Verifica se o token começa com 'Bearer '
    if (!authHeader.startsWith('Bearer ')) {
      console.log('Middleware de autenticação: Formato de token inválido');
      res.status(401).json({ error: 'Formato de token inválido' });
      return;
    }

    const token = authHeader.split(' ')[1];
    console.log(`Middleware de autenticação: Token recebido: ${token}`);
    
    if (!token) {
      console.log('Middleware de autenticação: Token não fornecido após Bearer');
      res.status(401).json({ error: 'Token não fornecido' });
      return;
    }

    const secret = process.env.JWT_SECRET || 'varzealeague_secret';
    const decoded = jwt.verify(token, secret) as { id?: number, userId?: number };
    const userId = decoded.id || decoded.userId;
    
    if (!userId) {
      console.log('Middleware de autenticação: ID do usuário não encontrado no token');
      res.status(401).json({ error: 'Token inválido - ID do usuário não encontrado' });
      return;
    }

    console.log(`Middleware de autenticação: Token verificado para usuário ${userId}`);
    (req as AuthRequest).user = { id: userId };
    (req as AuthRequest).userId = userId;
    next();
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    console.log(`Middleware de autenticação: Erro de verificação - Token inválido ou expirado`);
    res.status(403).json({ error: 'Token inválido' });
  }
}; 