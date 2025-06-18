import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const SECRET = process.env.JWT_SECRET || 'default_secret';

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Token não fornecido' });
    return;
  }

  jwt.verify(token, SECRET, (err, user) => {
    if (err) {
      res.status(403).json({ error: 'Token inválido ou expirado' });
      return;
    }
    (req as any).user = user;
    next();
  });
}