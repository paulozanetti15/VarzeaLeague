import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
      }
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: 'Token não fornecido' });
      return;
    }

    const secret = process.env.JWT_SECRET || 'varzealeague_secret';
    const decoded = jwt.verify(token, secret) as { userId: number };
    
    req.user = { id: decoded.userId };
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(403).json({ message: 'Token inválido' });
    return;
  }
}; 