import jwt, { SignOptions } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const SECRET = process.env.JWT_SECRET || 'default_secret';

interface JwtPayload {
  id: number;
  email: string;
}

export function generateToken(payload: JwtPayload, expiresIn: string = '1d') {
  const options: SignOptions = { expiresIn: expiresIn as SignOptions['expiresIn'] };
  return jwt.sign(payload, SECRET, options);
}

export function verifyToken(token: string) {
  return jwt.verify(token, SECRET);
}