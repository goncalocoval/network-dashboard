import { Request, Response, NextFunction } from 'express';

export const scannerOnly = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization || '';
  const expectedToken = process.env.SCANNER_SECRET;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token ausente.' });
  }

  const token = authHeader.split(' ')[1];
  if (token !== expectedToken) {
    res.status(403).json({ error: 'Token inválido.' });
  }
  next();
};