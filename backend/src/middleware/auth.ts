import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key';

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.header('Authorization')?.split(' ')[1]; 

  if (!token) {
    res.status(401).json({ error: 'Access denied, token missing' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; role: string };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireRole = (roles: Array<'ADMIN' | 'USER' | 'STORE_OWNER'>) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    
    if (!roles.includes(req.user.role as any)) {
      res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
      return;
    }
    
    next();
  };
};
