import { randomBytes } from 'node:crypto';
import { prisma } from '@/lib/prisma';

const TOKEN_TTL_MS = 1000 * 60 * 60; // 1 hour — shorter than email verification since this grants account access

export async function issueResetToken(userId: string) {
  const token = randomBytes(32).toString('hex');
  await prisma.user.update({
    where: { id: userId },
    data: { resetToken: token, resetExpiresAt: new Date(Date.now() + TOKEN_TTL_MS) },
  });
  return token;
}

export async function getUserByResetToken(token: string) {
  const user = await prisma.user.findUnique({ where: { resetToken: token } });
  if (!user || !user.resetExpiresAt || user.resetExpiresAt < new Date()) return null;
  return user;
}

export async function clearResetToken(userId: string) {
  await prisma.user.update({ where: { id: userId }, data: { resetToken: null, resetExpiresAt: null } });
}
