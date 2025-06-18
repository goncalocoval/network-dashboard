import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt';

const prisma = new PrismaClient();

export async function register(email: string, password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });
  return { token: generateToken({ id: user.id, email: user.email }) };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Utilizador não encontrado');

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error('Password incorreta');

  return { token: generateToken({ id: user.id, email: user.email }), email: user.email };
}

export async function updatePassword(email: string, oldPassword: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Utilizador não encontrado');

  const valid = await bcrypt.compare(oldPassword, user.password);
  if (!valid) throw new Error('Password incorreta');

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { email },
    data: { password: hashedNewPassword },
  });

  return { message: 'Password atualizada com sucesso' };
}