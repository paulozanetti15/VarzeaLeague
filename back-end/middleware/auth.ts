import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    [key: string]: any;
  };
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    console.log(`Middleware de autenticação: Rota acessada: ${req.method} ${req.originalUrl}`);
    console.log(`Middleware de autenticação: Cabeçalho recebido: ${authHeader ? 'Sim' : 'Não'}`);
    
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      console.log('Middleware de autenticação: Token não fornecido');
      res.status(401).json({ error: 'Token não fornecido' });
      return;
    }

    const secret = process.env.JWT_SECRET || 'varzealeague_secret';
    const decoded = jwt.verify(token, secret) as { userId: number };
    
    console.log(`Middleware de autenticação: Token verificado para usuário ${decoded.userId}`);
    (req as AuthRequest).user = { id: decoded.userId };
    next();
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    console.log(`Middleware de autenticação: Erro de verificação - Token inválido ou expirado`);
    res.status(403).json({ error: 'Token inválido' });
  }
}; 